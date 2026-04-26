/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, TrendingUp, Check } from 'lucide-react';
import { db, auth, handleFirestoreError } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  increment, 
  serverTimestamp,
  query,
  runTransaction,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { signInWithGoogle } from './firebase';
import { Barraca } from './types';
import { INITIAL_BARRACAS } from './constants';
import Map from './components/Map';
import BarracaModal from './components/BarracaModal';
import VoteListModal from './components/VoteListModal';
import Leaderboard from './components/Leaderboard';
import RankingModal from './components/RankingModal';

export default function App() {
  const [barracas, setBarracas] = useState<Barraca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBarraca, setSelectedBarraca] = useState<Barraca | null>(null);
  const [votingCooldown, setVotingCooldown] = useState<string>('');
  const [canVote, setCanVote] = useState(true);
  const [isVoteListOpen, setIsVoteListOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Auth
  useEffect(() => {
    return auth.onAuthStateChanged(setUser);
  }, []);

  const isAdmin = user?.email === 'iarafcplopes@gmail.com';

  const handleRecalculate = async () => {
    if (!isAdmin) return;
    try {
      setIsLoading(true);
      console.log('Recalculating votes...');
      const votesSnap = await getDocs(collection(db, 'votes'));
      const counts: Record<string, number> = {};
      votesSnap.docs.forEach(d => {
        const bid = d.data().barracaId;
        counts[bid] = (counts[bid] || 0) + 1;
      });

      const batch = writeBatch(db);
      barracas.forEach(b => {
        batch.update(doc(db, 'barracas', b.id), { voteCount: counts[b.id] || 0 });
      });
      await batch.commit();
      alert('Votos recalculados com sucesso!');
    } catch (error) {
      console.error('Recalculate failed:', error);
      alert('Erro ao recalcular. Verifica as permissões.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load barracas from Firestore
  useEffect(() => {
    let isSubscribed = true;
    
    const q = query(collection(db, 'barracas'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!isSubscribed) return;

      if (snapshot.empty) {
        console.log('Database is empty. auto-seeding...');
        setBarracas(INITIAL_BARRACAS);
        
        try {
          const batchPromises = INITIAL_BARRACAS.map(b => {
            // Use merge: true to avoid wiping out vote counts if some data exists
            const cleaned = JSON.parse(JSON.stringify(b));
            return setDoc(doc(db, 'barracas', b.id), cleaned, { merge: true }).catch(e => handleFirestoreError(e, 'write', `barracas/${b.id}`));
          });
          await Promise.all(batchPromises);
          console.log('Auto-seeding complete.');
        } catch (err) {
          console.error('Auto-seeding failed:', err);
        }
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Barraca));
        setBarracas(data);

        // Check if we need to sync new images (metadata update)
        const needsSync = INITIAL_BARRACAS.some(initial => {
          const existing = data.find(d => d.id === initial.id);
          if (!existing) return false;
          
          const initialShots = JSON.stringify(initial.shotsUrls || []);
          const existingShots = JSON.stringify(existing.shotsUrls || []);
          const initialGifts = JSON.stringify(initial.giftsUrls || []);
          const existingGifts = JSON.stringify(existing.giftsUrls || []);
          
          return initialShots !== existingShots || 
                 initialGifts !== existingGifts || 
                 initial.course !== existing.course;
        });

        if (needsSync) {
          console.log('New assets detected. Syncing database...');
          const syncPromises = INITIAL_BARRACAS.map(async (initial) => {
             const existing = data.find(d => d.id === initial.id);
             if (!existing) return Promise.resolve();

             const { shotsUrls, giftsUrls, course } = initial;
             
             // Only update if there is actually a difference for THIS specific barraca
             const shouldUpdate = 
               JSON.stringify(shotsUrls || []) !== JSON.stringify(existing.shotsUrls || []) ||
               JSON.stringify(giftsUrls || []) !== JSON.stringify(existing.giftsUrls || []) ||
               course !== existing.course;

             if (!shouldUpdate) return Promise.resolve();

             console.log(`Syncing metadata for: ${initial.name}`);
             return setDoc(doc(db, 'barracas', initial.id), { 
               shotsUrls: shotsUrls || [], 
               giftsUrls: giftsUrls || [],
               course: course || ''
             }, { merge: true }).catch(e => handleFirestoreError(e, 'update', `barracas/${initial.id}`));
          });
          Promise.all(syncPromises).then(() => {
            console.log('Database sync complete');
          }).catch(err => {
            console.error('Database sync failed:', err);
          });
        }
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'barracas');
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // Device-based voting enforcement
  const getDeviceId = useCallback(() => {
    let id = localStorage.getItem('bt_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('bt_device_id', id);
    }
    return id;
  }, []);

  const getAcademicDayKey = useCallback(() => {
    const now = new Date();
    // Academic day resets at 22:00.
    // If it's before 22h, it's still "yesterday's" academic session.
    const resetTime = 22;
    const currentHour = now.getHours();
    
    let date = new Date(now);
    if (currentHour < resetTime) {
      date.setDate(date.getDate() - 1);
    }
    
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  }, []);

  const updateCooldown = useCallback(() => {
    const now = new Date();
    const nextReset = new Date();
    nextReset.setHours(22, 0, 0, 0);
    
    if (now.getHours() >= 22) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
    
    const diff = nextReset.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setVotingCooldown(`${hours}h ${minutes}m ${seconds}s`);
    
    const dayKey = getAcademicDayKey();
    const lastVoteKey = `last_vote_${dayKey}`;
    const voted = localStorage.getItem(lastVoteKey);
    setCanVote(!voted);
  }, [getAcademicDayKey]);

  useEffect(() => {
    const timer = setInterval(updateCooldown, 1000);
    updateCooldown();
    return () => clearInterval(timer);
  }, [updateCooldown]);

  const handleVote = async (barracaId: string) => {
    if (!canVote) return;
    
    const deviceId = getDeviceId();
    const dayKey = getAcademicDayKey();
    const voteId = `v_d-${deviceId}_${dayKey}`;
    
    try {
      await runTransaction(db, async (transaction) => {
        const barracaRef = doc(db, 'barracas', barracaId);
        const voteRef = doc(db, 'votes', voteId);
        
        const barracaSnap = await transaction.get(barracaRef);
        if (!barracaSnap.exists()) throw new Error("Barraca not found");
        
        transaction.set(voteRef, {
          deviceId,
          barracaId,
          timestamp: serverTimestamp()
        });
        
        transaction.update(barracaRef, {
          voteCount: increment(1)
        });
      });
      
      localStorage.setItem(`last_vote_${dayKey}`, 'true');
      setCanVote(false);
      alert('Voto registado com sucesso! 🎉');
    } catch (error: any) {
      if (error?.message?.includes('permission-denied')) {
        handleFirestoreError(error, 'write', `votes/${voteId} or barracas/${barracaId}`);
      }
      console.error('Vote failed:', error);
      if (error instanceof Error && error.message === "Barraca not found") {
        alert('Erro: Esta barraca ainda não está registada no sistema. O administrador precisa de iniciar o recinto.');
      } else {
        alert('Erro ao votar. Talvez já tenhas votado hoje?');
      }
    }
  };

  const topThree = useMemo(() => {
    return [...barracas].sort((a, b) => b.voteCount - a.voteCount).slice(0, 3);
  }, [barracas]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-white/10 rounded-full animate-spin" />
        <h2 className="text-xl font-black italic uppercase tracking-widest text-white/50 animate-pulse">
          A Sincronizar Recinto...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-8 border-b-2 border-white/20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-blue-400 mb-2">Referendo Oficial</span>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Enterro <span className="text-blue-500">'26</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-[0.2em]">Live Connection</span>
            <span className="text-[10px] font-mono text-white/30 uppercase">Firebase Database: Active</span>
          </div>
          <div className="bg-white text-brand-dark px-4 py-2 font-mono font-bold text-xl md:text-2xl flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest opacity-70">Próximo Voto:</span>
            {votingCooldown}
          </div>
          <p className="text-[10px] uppercase tracking-tighter opacity-50">
            1 voto por dispositivo a cada 24h académicas
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 p-6 pb-12">
        {/* Left Side: Map */}
        <section className="md:col-span-8 bg-brand-surface border border-white/10 p-4 rounded-sm shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-300 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              Mapa do Recinto
            </h2>
            <span className="text-[10px] text-white/40 uppercase italic">Double-tap para detalhes</span>
          </div>
          <Map 
            barracas={barracas} 
            onSelect={setSelectedBarraca} 
          />
        </section>

        {/* Right Side: Leaderboard */}
        <section className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 border-l-4 border-white p-4">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-2 flex justify-between items-center">
              Líderes de Hoje
              <button 
                onClick={() => setIsRankingOpen(true)}
                className="text-[9px] text-blue-400 hover:text-white transition-colors underline underline-offset-4"
              >
                VER TUDO
              </button>
            </h3>
            <Leaderboard topThree={topThree} />
            <button 
              onClick={() => setIsRankingOpen(true)}
              className="w-full mt-6 py-2 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all italic"
            >
              Ver Ranking Oficial Completo
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setIsVoteListOpen(true)}
              disabled={!canVote}
              className={`
                w-full py-8 flex items-center justify-center gap-4 font-black italic text-3xl uppercase tracking-widest transition-all transform skew-x-[-2deg]
                ${canVote 
                  ? 'bg-blue-600 text-white hover:bg-white hover:text-brand-dark shadow-2xl active:scale-95 cursor-pointer' 
                  : 'bg-white/10 text-white/20 cursor-not-allowed border border-white/10'}
              `}
            >
              {canVote ? (
                <>VOTAR <TrendingUp className="w-8 h-8" /></>
              ) : (
                <>VOTO REGISTADO <Check className="w-8 h-8" /></>
              )}
            </button>
            
            <p className="text-center font-mono text-[9px] opacity-30 tracking-[0.2em] uppercase">
              {canVote 
                ? 'Referendo Aberto // Seleciona a tua barraca favorita' 
                : 'Próxima votação disponível às 22h'}
            </p>
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 py-10 flex flex-col justify-center items-center gap-4 text-[10px] font-mono opacity-40 uppercase border-t border-white/10">
        <p>para mais informações contactar: faiscamcquack@gmail.com</p>
        
        <div className="flex gap-4">
          {!user ? (
            <button onClick={() => signInWithGoogle()} className="hover:text-blue-400 transition-colors">Admin Login</button>
          ) : (
            <div className="flex items-center gap-4">
              <span>{user.email}</span>
              {isAdmin && (
                <button 
                  onClick={handleRecalculate}
                  className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                >
                  Recalcular Votos
                </button>
              )}
              <button onClick={() => auth.signOut()} className="hover:text-red-400">Sair</button>
            </div>
          )}
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedBarraca && (
          <BarracaModal 
            barraca={selectedBarraca} 
            onClose={() => setSelectedBarraca(null)}
            onVote={handleVote}
            canVote={canVote}
          />
        )}
        {isVoteListOpen && (
          <VoteListModal 
            isOpen={isVoteListOpen}
            onClose={() => setIsVoteListOpen(false)}
            barracas={barracas}
            onSelect={setSelectedBarraca}
          />
        )}
        {isRankingOpen && (
          <RankingModal 
            isOpen={isRankingOpen}
            onClose={() => setIsRankingOpen(false)}
            barracas={barracas}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
