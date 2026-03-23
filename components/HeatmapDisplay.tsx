
import React, { useEffect, useRef } from 'react';
import { Hotspot } from '../types';

interface HeatmapDisplayProps {
  imageUrl: string;
  hotspots: Hotspot[];
}

const HeatmapDisplay: React.FC<HeatmapDisplayProps> = ({ imageUrl, hotspots }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Draw heat regions with refined blend
      ctx.globalCompositeOperation = 'screen';
      hotspots.forEach(spot => {
        const x = (spot.x / 100) * canvas.width;
        const y = (spot.y / 100) * canvas.height;
        const w = (spot.width / 100) * canvas.width;
        const h = (spot.height / 100) * canvas.height;

        const gradient = ctx.createRadialGradient(
          x + w / 2, y + h / 2, 0,
          x + w / 2, y + h / 2, Math.max(w, h) * 1.5
        );
        gradient.addColorStop(0, `rgba(244, 63, 94, ${spot.severity * 0.7})`);
        gradient.addColorStop(0.5, `rgba(244, 63, 94, ${spot.severity * 0.2})`);
        gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x - w, y - h, w * 3, h * 3);

        // HUD marker
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.lineWidth = Math.max(2, canvas.width / 400);
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, w, h);
        
        // Precise corner accents
        const cornerSize = Math.max(10, w * 0.2);
        ctx.lineWidth = Math.max(4, canvas.width / 200);
        ctx.beginPath();
        // Top Left
        ctx.moveTo(x, y + cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerSize, y);
        // Bottom Right
        ctx.moveTo(x + w, y + h - cornerSize);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w - cornerSize, y + h);
        ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(x, y - 25, 80, 20);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('ANOMALY_' + (spot.severity * 100).toFixed(0), x + 5, y - 11);
      });
    };
    img.src = imageUrl;
  }, [imageUrl, hotspots]);

  return (
    <div className="relative overflow-hidden rounded-2xl group shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/50 blur-[2px] animate-scan z-20"></div>
      <canvas 
        ref={canvasRef} 
        className="max-w-full h-auto mx-auto block bg-slate-100"
      />
      {/* HUD Frame */}
      <div className="absolute inset-0 border-[32px] border-slate-950/5 pointer-events-none rounded-2xl z-10"></div>
      <div className="absolute bottom-4 right-4 z-10 mono text-[10px] text-white/40 bg-black/20 backdrop-blur-sm px-3 py-1 rounded border border-white/5">
        AUDIT_PROJECTION_V4.2
      </div>
    </div>
  );
};

export default HeatmapDisplay;
