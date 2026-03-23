import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ForensicMetrics as MetricsType } from '../types';

interface Props {
  metrics: MetricsType;
}

const ForensicMetrics: React.FC<Props> = ({ metrics }) => {
  const data = [
    { subject: 'COLOR_DOMAIN', A: metrics.colorConsistency * 100 },
    { subject: 'EDGE_CONTINUITY', A: metrics.edgeContinuity * 100 },
    { subject: 'NOISE_DENSITY', A: metrics.noiseUniformity * 100 },
    { subject: 'COMPRESSION', A: metrics.compressionPatterns * 100 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      {/* Visual Charts */}
      <div className="md:col-span-7 h-[350px] relative group no-print">
        <div className="absolute inset-0 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-95 blur-2xl"></div>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Evidence"
              dataKey="A"
              stroke="#0ea5e9"
              strokeWidth={4}
              fill="#0ea5e9"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen Bars & Labels */}
      <div className="md:col-span-5 space-y-8 no-print">
        {data.map((item, idx) => (
          <div key={item.subject}>
            <div className="flex justify-between items-end text-[10px] font-black tracking-widest text-slate-400 mb-3">
              <span className="flex items-center gap-2">
                <span className="text-sky-500 font-bold">0{idx + 1}</span> {item.subject}
              </span>
              <span className="mono text-slate-950 text-base leading-none">{(item.A).toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.A}%` }}
                transition={{ duration: 1.5, delay: idx * 0.1, ease: "circOut" }}
                className={`h-full ${item.A < 45 ? 'bg-rose-500' : 'bg-slate-950'}`}
              />
            </div>
          </div>
        ))}
        <div className="pt-6 border-t border-slate-100">
          <p className="text-[11px] leading-relaxed text-slate-400 font-bold uppercase tracking-tight">
            *Critical Variance: Values &lt; 45.0 signify potential pixel injection or cloning artifacts.
          </p>
        </div>
      </div>

      {/* Print-Only Data Table for Professional PDF Output */}
      <div className="print-only col-span-12">
        <h4 className="text-sm font-black uppercase tracking-widest mb-4">Signal Domain Metrics</h4>
        <table className="print-data-table">
          <thead>
            <tr>
              <th>Metric ID</th>
              <th>Parameter Name</th>
              <th>Measured Value (0-100)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.subject}>
                <td>0{idx + 1}</td>
                <td>{item.subject}</td>
                <td>{item.A.toFixed(4)}</td>
                <td>{item.A < 45 ? 'CRITICAL_VAR' : 'NORMAL'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[8px] font-bold mt-4 italic">
          Note: Low values in the signal domain indicate a loss of organic sensor noise or edge discontinuity, correlating with digital manipulation or synthetic generation.
        </p>
      </div>
    </div>
  );
};

export default ForensicMetrics;