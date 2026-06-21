import React, { useRef, useState, useEffect } from 'react';

interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  stage: string;
}

export default function StatusGenerator({ match }: { match: Match }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState<'A' | 'B'>('B');

  const generateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Instagram Story dimensions: 1080 x 1920
    canvas.width = 1080;
    canvas.height = 1920;

    // Background - Pastel Pink
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    if (template === 'B') {
      gradient.addColorStop(0, '#ffd6e0'); 
      gradient.addColorStop(1, '#fbcfe8');
    } else {
      gradient.addColorStop(0, '#bbf7d0'); 
      gradient.addColorStop(1, '#fef08a');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative Elements
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.font = 'bold 200px Anton, sans-serif';
    ctx.fillText('WORLD CUP', 540, 300);
    ctx.fillText('2026', 540, 500);
    ctx.fillText('WORLD CUP', 540, 1500);
    ctx.fillText('2026', 540, 1700);

    // Top Branding
    ctx.fillStyle = '#000000';
    ctx.font = '80px Anton, sans-serif';
    ctx.textAlign = 'center';
    
    // Draw thick bordered box for SUMMER 26
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(340, 80, 400, 100);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(340, 80, 400, 100);
    
    ctx.fillStyle = '#000000';
    ctx.fillText('SUMMER 26', 540, 155);
    
    ctx.font = '60px Anton, sans-serif';
    ctx.fillText(match.stage.toUpperCase(), 540, 260);

    if (template === 'B') {
      // MATCH DAY TEMPLATE
      ctx.fillStyle = '#000000';
      ctx.font = '160px Anton, sans-serif';
      ctx.fillText(match.homeTeam.toUpperCase(), 540, 500);
      
      ctx.font = '120px Anton, sans-serif';
      ctx.fillStyle = '#ec4899'; // Pink VS
      ctx.fillText('VS', 540, 650);

      ctx.fillStyle = '#000000';
      ctx.font = '160px Anton, sans-serif';
      ctx.fillText(match.awayTeam.toUpperCase(), 540, 800);

      // Match Info Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(140, 1000, 800, 350);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 15;
      ctx.strokeRect(140, 1000, 800, 350);
      // Drop shadow for box
      ctx.fillStyle = '#000000';
      ctx.fillRect(160, 1350, 800, 20);
      ctx.fillRect(940, 1020, 20, 350);

      const localDate = new Date(match.date);
      const timeStr = localDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const dateStr = localDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

      ctx.fillStyle = '#000000'; 
      ctx.font = '140px Anton, sans-serif';
      ctx.fillText(timeStr, 540, 1150);

      ctx.font = '50px Anton, sans-serif';
      ctx.fillText(dateStr.toUpperCase(), 540, 1230);
      
      ctx.font = '40px Anton, sans-serif';
      ctx.fillStyle = '#ec4899';
      ctx.fillText(match.venue.toUpperCase(), 540, 1310);

    } else {
      // GUESS THE SCORE TEMPLATE
      ctx.fillStyle = '#000000';
      ctx.font = '140px Anton, sans-serif';
      ctx.fillText('WHO WILL WIN?', 540, 400);

      // Boxes for guessing
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(100, 550, 350, 350);
      ctx.fillRect(630, 550, 350, 350);
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 10;
      ctx.strokeRect(100, 550, 350, 350);
      ctx.strokeRect(630, 550, 350, 350);

      ctx.fillStyle = '#000000';
      ctx.font = '70px Anton, sans-serif';
      
      // Wrap text helper
      const wrapText = (text: string, x: number, y: number, maxWidth: number) => {
        let words = text.split(' ');
        let line = '';
        let currentY = y;
        for(let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if(metrics.width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, currentY);
            line = words[n] + ' ';
            currentY += 80;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), x, currentY);
      };

      wrapText(match.homeTeam.toUpperCase(), 275, 700, 300);
      wrapText(match.awayTeam.toUpperCase(), 805, 700, 300);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(175, 830, 200, 20);
      ctx.fillRect(705, 830, 200, 20);

      ctx.font = '120px Anton, sans-serif';
      ctx.fillStyle = '#ec4899';
      ctx.fillText('VS', 540, 750);
    }

    // Bottom Branding
    ctx.fillStyle = '#000000';
    ctx.font = '60px Anton, sans-serif';
    ctx.fillText('CUPCAL.ONLINE', 540, 1800);
    ctx.font = '40px Anton, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('SCAN OR VISIT TO GET YOUR LOCAL SCHEDULE', 540, 1860);
  };

  const downloadImage = () => {
    generateCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.9);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WCCal_Story_${match.homeTeam.replace(/\s+/g, '_')}_vs_${match.awayTeam.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    const timer = setTimeout(generateCanvas, 100);
    return () => clearTimeout(timer);
  }, [template, match]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border-[4px] border-black mt-8 shadow-[8px_8px_0px_#000]">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-anton text-black tracking-widest uppercase mb-2">Match Story Asset</h2>
        <p className="text-black font-anton uppercase text-sm md:text-base tracking-widest">Download a high-quality graphic for social media.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/2 flex flex-col gap-3">
          <button 
            onClick={() => setTemplate('B')}
            className={`p-4 rounded-xl text-left transition-all border-[3px] shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] ${template === 'B' ? 'border-black bg-pink-300' : 'border-black bg-white'}`}
          >
            <h3 className="font-anton text-xl text-black uppercase tracking-wider">Template: Match Day</h3>
            <p className="text-sm text-black font-medium mt-1">Rich contrast card with kick-off & stadium.</p>
          </button>
          
          <button 
            onClick={() => setTemplate('A')}
            className={`p-4 rounded-xl text-left transition-all border-[3px] shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] ${template === 'A' ? 'border-black bg-pink-300' : 'border-black bg-white'}`}
          >
            <h3 className="font-anton text-xl text-black uppercase tracking-wider">Template: Predictions</h3>
            <p className="text-sm text-black font-medium mt-1">Interactive "Who will win?" engagement overlay.</p>
          </button>

          <button 
            onClick={downloadImage}
            className="mt-4 w-full py-4 bg-yellow-300 text-black font-anton text-xl rounded-xl hover:bg-pink-500 transition-all border-[4px] border-black shadow-[6px_6px_0px_#000] flex items-center justify-center gap-2 uppercase tracking-widest hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#000]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Story
          </button>
        </div>

        <div className="w-full md:w-1/2 flex justify-center bg-black p-4 rounded-2xl overflow-hidden border-[4px] border-black shadow-[6px_6px_0px_#000]">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto shadow-2xl bg-black border-[2px] border-white" 
            style={{ maxHeight: '400px', width: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}
