import { motion, AnimatePresence } from 'motion/react';
import { X, Search } from 'lucide-react';
import { useState } from 'react';
import { Barraca } from '../types';

interface VoteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  barracas: Barraca[];
  onSelect: (barraca: Barraca) => void;
}

export default function VoteListModal({ isOpen, onClose, barracas, onSelect }: VoteListModalProps) {
  const [search, setSearch] = useState('');

  const filteredBarracas = barracas.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.course.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/95 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-brand-surface border-4 border-white shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-400 block mb-1">Referendo Inter-Barracas</span>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Escolher Barraca</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 bg-white text-brand-dark hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input 
                  type="text"
                  placeholder="PROCURAR POR NOME OU NÚCLEO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 py-4 pl-12 pr-4 font-black italic uppercase tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredBarracas.map((barraca) => (
                  <motion.button
                    key={barraca.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(barraca);
                      onClose();
                    }}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:bg-blue-600 hover:border-white transition-all group text-left"
                  >
                    <div>
                      <div className="text-lg font-black italic uppercase tracking-tighter text-white">{barraca.name}</div>
                      {barraca.course && barraca.course !== 'Núcleo Estudantil' && (
                        <div className="text-[10px] font-mono opacity-50 uppercase tracking-tight">{barraca.course}</div>
                      )}
                    </div>
                    <div className="text-[10px] font-black bg-white/10 px-2 py-1 group-hover:bg-white group-hover:text-brand-dark transition-colors">
                      {barraca.row}-{barraca.col}
                    </div>
                  </motion.button>
                ))}
              </div>

              {filteredBarracas.length === 0 && (
                <div className="py-20 text-center opacity-30 italic font-mono uppercase tracking-widest">
                  Nenhuma barraca encontrada
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 text-[9px] font-mono opacity-40 uppercase tracking-[0.2em] text-center">
              Total: {filteredBarracas.length} Barracas Registadas
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
