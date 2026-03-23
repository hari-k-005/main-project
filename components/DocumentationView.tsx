
import React from 'react';
import { motion } from 'framer-motion';

const DocumentationView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <div className="space-y-6 mb-20">
        <span className="text-sky-600 font-black text-sm uppercase tracking-[0.5em]">Field Manual</span>
        <h2 className="text-6xl font-[900] text-slate-950 tracking-tight">System Documentation</h2>
        <p className="text-2xl text-slate-500 font-light max-w-2xl">Operational guide for certified forensic analysts and digital investigators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <DocCard 
          title="Evidence Ingestion Protocols"
          steps={[
            "Always utilize high-resolution original source files.",
            "Avoid derivative assets (screenshots/social media compressed).",
            "Maintain chain of custody by noting Evidence ID hash."
          ]}
        />
        <DocCard 
          title="Anomaly Map Interpretation"
          steps={[
            "Red spectrum zones indicate >85% manipulation probability.",
            "Cross-verify with Noise Density bar in Metrics section.",
            "Focus on high-contrast edges and object boundaries."
          ]}
        />
        <DocCard 
          title="Archival Reporting"
          steps={[
            "Export Audit Reports for legal and archival records.",
            "Each report contains a unique cryptographic Case ID.",
            "Utilize 'Auditor Insights' for plain-language summaries."
          ]}
        />
        <DocCard 
          title="Confidence Calibration"
          steps={[
            "Scores >95% : Definite artificial intervention.",
            "Scores 70-95% : High suspicion; check for re-saving.",
            "Scores <50% : Likely authentic or low-confidence scan."
          ]}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 p-12 bg-slate-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
        </div>
        <h3 className="text-3xl font-black mb-6 tracking-tight">Forensic Liability Protocol</h3>
        <p className="text-slate-400 text-lg leading-relaxed font-medium">
          DeepScan operates as a decision-support architecture. Findings are probabilistic indicators based on 
          pixel-level statistical variance. Final determinations must be made by human subject matter experts 
          cross-referencing metadata and contextual evidence. The 'Trust Score' index reflects signal reliability 
          rather than absolute moral truth.
        </p>
      </motion.div>
    </div>
  );
};

const DocCard = ({ title, steps }: { title: string, steps: string[] }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl hover:shadow-2xl transition-shadow group">
    <h3 className="text-2xl font-[900] text-slate-950 mb-8 flex items-center gap-4">
      <span className="w-2 h-8 bg-sky-500 rounded-full group-hover:scale-y-125 transition-transform"></span>
      {title}
    </h3>
    <ul className="space-y-6">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-6 text-slate-600 text-base leading-relaxed font-medium">
          <span className="font-black text-slate-200 text-xl shrink-0">0{i+1}</span>
          {step}
        </li>
      ))}
    </ul>
  </div>
);

export default DocumentationView;
