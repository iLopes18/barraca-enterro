import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Medal } from 'lucide-react';
import { Barraca } from '../types';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  barracas: Barraca[];
}

export default function RankingModal({ isOpen, onClose, barracas }: RankingModalProps) {
  const sortedBarracas = [...barracas].sort((a, b) => b.voteCount - a.voteCount);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-mono text-xs opacity-40">{(index + 1).toString().padStart(2, '0')}</span>;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-neutral-900 border-2 border-white/20 shadow-2xl flex flex-col overflow-hidden rounded-lg"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-transparent">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-400">Classificação Oficial</span>
                  </div>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-white">Ranking <span className="text-blue-500">Geral</span></h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                >
                  <X className="w-8 h-8 text-white/50 group-hover:text-white" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <div className="divide-y divide-white/5">
                {sortedBarracas.map((barraca, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={barraca.id}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-12 flex justify-center shrink-0">
                      {getRankIcon(index)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black italic uppercase tracking-tight text-white truncate max-w-[200px] sm:max-w-none group-hover:text-blue-400 transition-colors">
                          {barraca.name}
                        </h3>
                        {index < 3 && (
                          <span className="shrink-0 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-widest border border-blue-500/20">
                            Podium
                          </span>
                        )}
                      </div>
                      {barraca.course && (
                        <p className="text-[10px] font-mono text-white/30 uppercase truncate">{barraca.course}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black italic text-blue-500">{barraca.voteCount}</div>
                      <div className="text-[8px] font-mono opacity-30 uppercase tracking-tighter">Votos Totais</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center px-8">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase font-mono">Dataset size</span>
                  <span className="text-xs font-bold text-white/70">{barracas.length} Barracas</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-4">
                  <span className="text-[8px] text-white/30 uppercase font-mono">Total Activity</span>
                  <span className="text-xs font-bold text-white/70">
                    {barracas.reduce((acc, b) => acc + b.voteCount, 0)} Votos
                  </span>
                </div>
              </div>
              <p className="text-[8px] font-mono text-blue-500/50 uppercase tracking-widest italic">Live Feed Updated - T+0ms</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
