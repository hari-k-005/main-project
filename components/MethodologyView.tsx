
import React from 'react';
import { motion } from 'framer-motion';

const MethodologyView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4 space-y-24">
      {/* Header Section */}
      <section className="text-center space-y-6">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sky-600 font-black text-sm uppercase tracking-[0.5em]"
        >
          Forensic Lab & Science
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-7xl font-[900] text-slate-950 tracking-tighter"
        >
          Detection <span className="text-slate-400">Architecture</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl text-slate-500 font-light max-w-3xl mx-auto leading-relaxed"
        >
          DeepScan utilizes a multi-layered analytical pipeline, combining classical signal processing with 
          advanced neural architectures to detect pixel-level inconsistencies.
        </motion.p>
      </section>

      {/* Main Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <DetailedMethodologyCard 
          id="ELA"
          title="Error Level Analysis"
          subtitle="Compression Variance Detection"
          description="JPEG images use lossy compression that averages pixel blocks. When an image is modified and re-saved, the modified area undergoes an additional compression cycle. ELA identifies these regions by measuring the 'error' (difference) introduced by a standard re-save pass."
          techSpecs={["Block Artifact Analysis", "8x8 Discrete Cosine Transform", "Quantization Table Mapping"]}
          visual={<ELAVisual />}
        />
        
        <DetailedMethodologyCard 
          id="NOISE"
          title="Noise Variance Profiling"
          subtitle="Sensor Signature Verification"
          description="Every camera sensor has a unique fixed-pattern noise (PRNU). In a spliced image, the manipulated region carries a different noise profile from the background. We use a high-pass filter to extract this noise 'fingerprint' and identify spatial anomalies."
          techSpecs={["High-Pass Residual Extraction", "PRNU Correlation Mapping", "Local Variance Estimation"]}
          visual={<NoiseVisual />}
        />

        <DetailedMethodologyCard 
          id="GRAD"
          title="Neural Saliency (Grad-CAM)"
          subtitle="Explainable AI Layer"
          description="DeepScan doesn't just classify; it explains. Gradient-weighted Class Activation Mapping (Grad-CAM) uses the gradients of the target class flowing into the final convolutional layer to produce a localization map highlighting important regions in the image."
          techSpecs={["Feature Map weighting", "Backpropagation Gradients", "Saliency Normalization"]}
          visual={<GradCAMVisual />}
        />

        <DetailedMethodologyCard 
          id="GAN"
          title="Generative Artifact Analysis"
          subtitle="AI Signature Detection"
          description="Synthetically generated images (GANs/Diffusion) leave behind specific 'checkered' artifacts in the frequency domain due to upsampling layers. DeepScan analyzes the Fourier Transform of image patches to catch these high-frequency signatures."
          techSpecs={["FFT Spectral Analysis", "Upsampling Artifact Scanning", "Latent Space Fingerprinting"]}
          visual={<GANVisual />}
        />
      </div>

      {/* Methodology Comparison Table */}
      <section className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        
        <div className="relative z-10 space-y-12">
          <div className="space-y-4">
            <h3 className="text-4xl font-black tracking-tight">Detection Matrix</h3>
            <p className="text-slate-400 text-lg max-w-2xl">A comparative look at which forensic methodologies are most effective against specific manipulation types.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left mono text-sm">
              <thead>
                <tr className="border-b border-white/10 text-sky-400 font-black tracking-widest uppercase">
                  <th className="py-6 px-4">Forgery Type</th>
                  <th className="py-6 px-4">Primary Method</th>
                  <th className="py-6 px-4">Secondary Method</th>
                  <th className="py-6 px-4">Detection Probability</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <MatrixRow type="Splicing / Compositing" primary="Noise Variance" secondary="ELA" prob="92%" />
                <MatrixRow type="Cloning / Healing" primary="Block Artifacts" secondary="PRNU Profiling" prob="88%" />
                <MatrixRow type="AI-Generated Faces" primary="GAN Artifacts" secondary="Spectral Analysis" prob="96%" />
                <MatrixRow type="Metadata Forgery" primary="Binary Analysis" secondary="Consistency Check" prob="99%" />
                <MatrixRow type="Deepfakes (Video)" primary="Temporal Stability" secondary="Optical Flow" prob="85%" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final Science Note */}
      <section className="max-w-3xl mx-auto text-center space-y-8 pb-20">
        <div className="w-16 h-1.5 bg-sky-500 mx-auto rounded-full"></div>
        <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
          "Digital forensics is a cat-and-mouse game. As generative models become more sophisticated, 
          the signal domain shifts. DeepScan's strength lies in ensemble analysis—viewing the evidence 
          through multiple mathematical lenses simultaneously."
        </p>
      </section>
    </div>
  );
};

const DetailedMethodologyCard = ({ title, subtitle, description, techSpecs, visual }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col group transition-all hover:shadow-2xl"
  >
    <div className="p-1 w-full h-64 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
      {visual}
    </div>
    <div className="p-10 space-y-6 flex-grow flex flex-col">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-3xl font-black text-slate-950 tracking-tight">{title}</h3>
          <span className="bg-sky-50 text-sky-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-sky-100">Lab-Ready</span>
        </div>
        <p className="text-sky-600 font-bold uppercase text-[11px] tracking-[0.2em]">{subtitle}</p>
      </div>
      <p className="text-slate-600 leading-relaxed text-base font-medium flex-grow">{description}</p>
      <div className="space-y-4 pt-6 border-t border-slate-50">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Parameters</h4>
        <div className="flex flex-wrap gap-2">
          {techSpecs.map((spec: string) => (
            <span key={spec} className="mono text-[10px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200">{spec}</span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const MatrixRow = ({ type, primary, secondary, prob }: any) => (
  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
    <td className="py-6 px-4 font-black text-white">{type}</td>
    <td className="py-6 px-4 text-sky-400 font-bold">{primary}</td>
    <td className="py-6 px-4">{secondary}</td>
    <td className="py-6 px-4">
      <div className="flex items-center gap-3">
        <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: prob }}></div>
        </div>
        <span className="text-emerald-400 font-black">{prob}</span>
      </div>
    </td>
  </tr>
);

/* Visual SVG Components for Methodologies */

const ELAVisual = () => (
  <svg width="200" height="120" viewBox="0 0 200 120" className="opacity-80">
    <rect x="20" y="20" width="160" height="80" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
    <g className="animate-pulse">
      <rect x="100" y="40" width="40" height="40" fill="#f43f5e" fillOpacity="0.2" stroke="#f43f5e" strokeWidth="2" />
      <circle cx="120" cy="60" r="10" fill="#f43f5e" fillOpacity="0.3" />
    </g>
    <path d="M40 30 H160 V90 H40 Z" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
    <text x="30" y="115" className="mono text-[8px] fill-slate-400 uppercase tracking-widest">Discrete Compression Grid</text>
  </svg>
);

const NoiseVisual = () => (
  <svg width="200" height="120" viewBox="0 0 200 120" className="opacity-80">
    <defs>
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
    </defs>
    <rect width="200" height="120" filter="url(#noiseFilter)" opacity="0.3" />
    <rect x="80" y="30" width="60" height="60" fill="#f8fafc" stroke="#0ea5e9" strokeWidth="2" />
    <rect x="85" y="35" width="50" height="50" filter="url(#noiseFilter)" opacity="0.8" fill="white" />
    <text x="30" y="115" className="mono text-[8px] fill-slate-400 uppercase tracking-widest">Local Pattern Variance</text>
  </svg>
);

const GradCAMVisual = () => (
  <svg width="200" height="120" viewBox="0 0 200 120" className="opacity-80">
    <circle cx="100" cy="60" r="40" fill="#0ea5e9" fillOpacity="0.1" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" />
    <circle cx="110" cy="50" r="25" fill="#f43f5e" fillOpacity="0.4">
      <animate attributeName="r" values="25;30;25" dur="3s" repeatCount="indefinite" />
    </circle>
    <path d="M20 60 H180" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
    <text x="30" y="115" className="mono text-[8px] fill-slate-400 uppercase tracking-widest">Backprop Heatmap Projection</text>
  </svg>
);

const GANVisual = () => (
  <svg width="200" height="120" viewBox="0 0 200 120" className="opacity-80">
    <g transform="translate(40, 20)">
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={i * 12} y1="0" x2={i * 12} y2="80" stroke="#cbd5e1" strokeWidth="1" />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1="0" y1={i * 12} x2="120" y2={i * 12} stroke="#cbd5e1" strokeWidth="1" />
      ))}
      <rect x="36" y="24" width="24" height="24" fill="#0ea5e9" fillOpacity="0.3" className="animate-pulse" />
      <text x="-10" y="95" className="mono text-[8px] fill-slate-400 uppercase tracking-widest">Frequency Grid Artifacts</text>
    </g>
  </svg>
);

export default MethodologyView;
