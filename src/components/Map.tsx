import { motion } from 'motion/react';
import { Barraca } from '../types';

interface MapProps {
  barracas: Barraca[];
  onSelect: (barraca: Barraca) => void;
}

export default function Map({ barracas, onSelect }: MapProps) {
  const rows = 22;
  const cols = 6;

  const getBarraca = (r: number, c: number) => {
    return barracas.find(b => b.row === r && b.col === c);
  };

  return (
    <div className="relative border border-white/10 rounded-sm p-1 bg-brand-surface shadow-2xl overflow-hidden">
      <div 
        className="grid gap-1"
        style={{ 
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: `repeat(${rows}, minmax(35px, auto))`
        }}
      >
        {/* PALCO Header */}
        <div className="col-span-6 h-16 border-2 border-white/20 bg-white/5 flex items-center justify-center mb-2">
          <span className="font-black italic text-3xl uppercase tracking-tighter opacity-70">PALCO</span>
        </div>

        {Array.from({ length: rows }).map((_, rowIndex) => {
          const r = rowIndex + 1;
          const isRegieZone = r === 5;
          const isPostoZone = r === 20;

          return Array.from({ length: cols }).map((_, colIndex) => {
            const c = colIndex + 1;
            const barraca = getBarraca(r, c);
            const isCorridor = c === 2 || c === 5;
            const isCenter = c === 3 || c === 4;

            if (isRegieZone && isCenter && c === 3) {
              return (
                <div key={`regie-${r}`} className="col-span-2 row-span-2 border border-white/30 bg-blue-600/10 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">REGIE</span>
                </div>
              );
            }
            if (isRegieZone && isCenter && c === 4) return null; // spanned
            if ((r === 6) && isCenter) return null; // spanned from row 5

            if (isPostoZone && isCenter && c === 3) {
              return (
                <div key={`posto-${r}`} className="col-span-2 border border-white/30 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">POSTO</span>
                </div>
              );
            }
            if (isPostoZone && isCenter && c === 4) return null; // spanned

            if (isCorridor) {
              return (
                <div key={`${r}-${c}`} className="flex items-center justify-center pointer-events-none" />
              );
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                whileTap={{ scale: 0.95 }}
                onDoubleClick={() => barraca && onSelect(barraca)}
                className={`
                  aspect-square rounded-sm flex items-center justify-center text-[7px] font-black uppercase text-center p-0.5 transition-all
                  ${barraca 
                    ? 'bg-white/10 border border-white/20 text-white cursor-pointer hover:bg-blue-600 hover:border-white transition-all duration-200' 
                    : 'bg-white/5 border border-dashed border-white/5'}
                `}
              >
                {barraca && (
                  <div className="flex flex-col gap-0.5 transform scale-90">
                    <span className="leading-tight">{barraca.name}</span>
                    <div className="w-full h-[1px] bg-white/20" />
                  </div>
                )}
              </motion.div>
            );
          });
        })}
      </div>

      {/* Corridor Visual Lines */}
      <div className="absolute inset-y-0 left-[16.6%] w-[1px] bg-white/5 pointer-events-none" />
      <div className="absolute inset-y-0 left-[33.3%] w-[1px] bg-white/5 pointer-events-none" />
      <div className="absolute inset-y-0 left-[66.6%] w-[1px] bg-white/5 pointer-events-none" />
      <div className="absolute inset-y-0 left-[83.3%] w-[1px] bg-white/5 pointer-events-none" />
    </div>
  );
}
