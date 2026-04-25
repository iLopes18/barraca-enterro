import { motion } from 'motion/react';
import { X, Wine, Gift, Image as ImageIcon, Heart, Check, TrendingUp } from 'lucide-react';
import { Barraca } from '../types';

interface BarracaModalProps {
  barraca: Barraca;
  onClose: () => void;
  onVote: (id: string) => void;
  canVote: boolean;
}

export default function BarracaModal({ barraca, onClose, onVote, canVote }: BarracaModalProps) {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 max-h-[95vh] bg-brand-dark border-t-4 border-white z-50 overflow-y-auto"
      >
        <div className="absolute top-6 right-6">
          <button 
            onClick={onClose}
            className="p-3 bg-white text-brand-dark hover:bg-blue-400 rounded-none transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <header className="mb-12 border-b-2 border-white/10 pb-6 pr-16 bg-white/5 -mx-8 px-8">
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-blue-400 block mb-2">Detalhes da Barraca</span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4">
              {barraca.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-mono text-sm uppercase opacity-50">
                Lote {barraca.row}-{barraca.col}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


            {/* Shots Menu */}
            {(barraca.shotsUrls && barraca.shotsUrls.length > 0) && (
              <section className="bg-white/5 p-8 border border-white/10 relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-8 bg-blue-500" />
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Menu de Shots</h3>
                 </div>
                 <div className="w-full flex flex-col gap-1 bg-brand-surface border border-white/10 p-1">
                   {barraca.shotsUrls.map((url, idx) => (
                     <img 
                       key={idx}
                       src={url} 
                       alt={`Shots Menu ${idx + 1}`}
                       className="w-full object-contain"
                       referrerPolicy="no-referrer"
                     />
                   ))}
                 </div>
              </section>
            )}

            {/* Gifts / Caça ao Brinde */}
            {(barraca.giftsUrls && barraca.giftsUrls.length > 0) && (
              <section className="bg-white/5 p-8 border border-white/10 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-8 bg-white" />
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Caça ao Brinde</h3>
                  </div>
                  <div className="w-full flex flex-col gap-1 bg-brand-surface border border-white/10 p-1">
                    {barraca.giftsUrls.map((url, idx) => (
                      <img 
                        key={idx}
                        src={url} 
                        alt={`Gifts Menu ${idx + 1}`}
                        className="w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
              </section>
            )}

            {/* Voting Action - Full Width Below */}
            <section className="md:col-span-2 pt-4">
              <button
                disabled={!canVote}
                onClick={() => onVote(barraca.id)}
                className={`
                  w-full py-8 flex items-center justify-center gap-6 font-black italic text-3xl uppercase tracking-widest transition-all
                  ${canVote 
                    ? 'bg-blue-600 text-white hover:bg-white hover:text-brand-dark shadow-2xl active:scale-95' 
                    : 'bg-white/10 text-white/20 cursor-not-allowed border border-white/10'}
                `}
              >
                {canVote ? (
                  <>VOTAR AGORA <TrendingUp className="w-8 h-8" /></>
                ) : (
                  <>VOTO REGISTADO <Check className="w-8 h-8" /></>
                )}
              </button>
              <p className="text-center font-mono text-[10px] mt-6 opacity-30 tracking-[0.3em] uppercase">
                {canVote 
                  ? 'Referendo Aveiro \'26 // Auditoria em Tempo Real' 
                  : 'Próxima votação disponível no próximo dia académico'}
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
