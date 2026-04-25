import { motion } from 'motion/react';
import { Barraca } from '../types';

interface LeaderboardProps {
  topThree: Barraca[];
}

export default function Leaderboard({ topThree }: LeaderboardProps) {
  if (topThree.length === 0) return null;

  const maxVotes = topThree[0]?.voteCount || 1;

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-400 bg-yellow-400';
      case 1: return 'text-slate-400 bg-slate-400';
      case 2: return 'text-amber-600 bg-amber-600';
      default: return 'text-white bg-white';
    }
  };

  return (
    <div className="space-y-6">
      {topThree.map((barraca, index) => {
        const colorClass = getRankColor(index);
        const percentage = Math.max(10, (barraca.voteCount / maxVotes) * 100);
        const rank = (index + 1).toString().padStart(2, '0');

        return (
          <div key={barraca.id} className="flex items-center gap-4 group">
            <span className={`text-4xl font-black italic ${colorClass.split(' ')[0]}`}>
              {rank}
            </span>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="font-bold uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  {barraca.name}
                </span>
                <span className="text-[10px] font-mono opacity-50">{barraca.voteCount}V</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${colorClass.split(' ')[1]}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
