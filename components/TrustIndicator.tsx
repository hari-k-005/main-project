
import React from 'react';
import { motion } from 'framer-motion';
import { TrustLevel } from '../types';

interface Props {
  level: TrustLevel;
}

const TrustIndicator: React.FC<Props> = ({ level }) => {
  const getLevelConfig = () => {
    switch (level) {
      case TrustLevel.HIGH:
        return {
          color: 'text-emerald-600',
          bg: 'bg-emerald-500',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          label: 'HIGH FIDELITY / SECURE',
          segments: 3,
          description: 'The source data exhibits highly consistent pixel signatures and temporal alignment.'
        };
      case TrustLevel.MEDIUM:
        return {
          color: 'text-amber-500',
          bg: 'bg-amber-500',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          label: 'MEDIUM FIDELITY / WARNING',
          segments: 2,
          description: 'Minor inconsistencies detected in noise profile. May be due to re-compression.'
        };
      case TrustLevel.LOW:
        return {
          color: 'text-rose-600',
          bg: 'bg-rose-500',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
          label: 'LOW FIDELITY / BREACHED',
          segments: 1,
          description: 'Significant signal deviation found. High probability of artificial data injection.'
        };
    }
  };

  const config = getLevelConfig();

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-[900] uppercase tracking-[0.3em] text-slate-400">Forensic Trust Index</span>
        <div className={`px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 font-black text-[10px] tracking-widest ${config.color}`}>
          {config.label}
        </div>
      </div>
      
      <div className="flex gap-2.5 h-4">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className={`flex-grow rounded-sm transition-all duration-700 origin-left ${
              i <= config.segments 
                ? `${config.bg} ${config.glow}` 
                : 'bg-slate-100'
            }`}
          />
        ))}
      </div>
      
      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
        {config.description}
      </p>
    </div>
  );
};

export default TrustIndicator;
