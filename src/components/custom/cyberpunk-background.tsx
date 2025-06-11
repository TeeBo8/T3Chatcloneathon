"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Zap, Code, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface CyberpunkBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

interface GridParticle {
  x: number;
  y: number;
  opacity: number;
  glitchIntensity: number;
  pulsePhase: number;
}

interface DataStream {
  x: number;
  y: number;
  speed: number;
  characters: string[];
  opacity: number;
  color: string;
}

const CyberpunkBackground: React.FC<CyberpunkBackgroundProps> = ({
  className,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridParticlesRef = useRef<GridParticle[]>([]);
  const dataStreamsRef = useRef<DataStream[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  const [showControls, setShowControls] = useState(false);
  const [intensity, setIntensity] = useState(0.2);
  const [speed, setSpeed] = useState(0.6);
  const [gridDensity, setGridDensity] = useState(1.0);

  useEffect(() => {
    const cyberpunkChars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const neonColors = [
      "#00ffff", // Cyan
      "#ff00ff", // Magenta
      "#00ff00", // Green
      "#ffff00", // Yellow
      "#ff0080", // Pink
      "#8000ff", // Purple
    ];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initializeParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 8000 * gridDensity);
      gridParticlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.8 + 0.2,
        glitchIntensity: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
      }));

      const streamCount = Math.floor(canvas.width / 80);
      dataStreamsRef.current = Array.from({ length: streamCount }, () => ({
        x: Math.random() * canvas.width,
        y: -Math.random() * 200,
        speed: Math.random() * 3 + 1,
        characters: Array.from({ length: 20 }, () => 
          cyberpunkChars[Math.floor(Math.random() * cyberpunkChars.length)]
        ),
        opacity: Math.random() * 0.8 + 0.2,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
      }));
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles();
    };

    const drawHexGrid = () => {
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * intensity})`;
      ctx.lineWidth = 1;
      
      const hexSize = 40;
      const hexWidth = hexSize * Math.sqrt(3);
      const hexHeight = hexSize * 2;
      
      for (let row = 0; row < canvas.height / (hexHeight * 0.75) + 2; row++) {
        for (let col = 0; col < canvas.width / hexWidth + 2; col++) {
          const x = col * hexWidth + (row % 2) * (hexWidth / 2);
          const y = row * (hexHeight * 0.75);
          
          if (Math.random() < 0.3 * intensity) {
            drawHexagon(ctx, x, y, hexSize);
          }
        }
      }
    };

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const drawGlitchLines = () => {
      if (Math.random() < 0.02 * intensity) {
        const lineCount = Math.floor(Math.random() * 5 + 1);
        for (let i = 0; i < lineCount; i++) {
          const y = Math.random() * canvas.height;
          const height = Math.random() * 3 + 1;
          const glitchOffset = (Math.random() - 0.5) * 20;
          
          ctx.fillStyle = `rgba(255, 0, 255, ${Math.random() * 0.5})`;
          ctx.fillRect(glitchOffset, y, canvas.width, height);
          
          ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.3})`;
          ctx.fillRect(-glitchOffset, y + 1, canvas.width, height);
        }
      }
    };

    const drawDataStreams = () => {
      dataStreamsRef.current.forEach((stream) => {
        stream.y += stream.speed * speed;
        
        if (stream.y > canvas.height + 100) {
          stream.y = -Math.random() * 200;
          stream.x = Math.random() * canvas.width;
          stream.color = neonColors[Math.floor(Math.random() * neonColors.length)];
        }

        ctx.font = "12px monospace";
        stream.characters.forEach((char, charIndex) => {
          const charY = stream.y - charIndex * 15;
          if (charY > -20 && charY < canvas.height + 20) {
            const alpha = Math.max(0, 1 - charIndex / stream.characters.length) * stream.opacity * intensity;
            ctx.fillStyle = `${stream.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fillText(char, stream.x, charY);
            
            if (charIndex === 0) {
              ctx.shadowColor = stream.color;
              ctx.shadowBlur = 10;
              ctx.fillText(char, stream.x, charY);
              ctx.shadowBlur = 0;
            }
          }
        });

        if (Math.random() < 0.1) {
          const randomIndex = Math.floor(Math.random() * stream.characters.length);
          stream.characters[randomIndex] = cyberpunkChars[Math.floor(Math.random() * cyberpunkChars.length)];
        }
      });
    };

    const drawGridParticles = () => {
      gridParticlesRef.current.forEach((particle) => {
        particle.pulsePhase += 0.05 * speed;
        const pulse = Math.sin(particle.pulsePhase) * 0.5 + 0.5;
        const finalOpacity = particle.opacity * pulse * intensity;
        
        if (Math.random() < 0.01 * particle.glitchIntensity) {
          particle.x += (Math.random() - 0.5) * 4;
          particle.y += (Math.random() - 0.5) * 4;
        }
        
        const size = 2 + pulse * 2;
        const color = neonColors[Math.floor(timeRef.current * 0.01 + particle.x * 0.01) % neonColors.length];
        
        ctx.fillStyle = `${color}${Math.floor(finalOpacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
        
        if (finalOpacity > 0.5) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
          ctx.shadowBlur = 0;
        }
      });
    };

    const drawScanlines = () => {
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 * intensity})`;
      ctx.lineWidth = 1;
      
      for (let y = 0; y < canvas.height; y += 4) {
        if (Math.random() < 0.3) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    };

    const animate = () => {
      timeRef.current += 1;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawHexGrid();
      drawScanlines();
      drawDataStreams();
      drawGridParticles();
      drawGlitchLines();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity, speed, gridDensity]);

  return (
    <div className={cn("relative w-full h-screen overflow-hidden bg-black", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "linear-gradient(45deg, #000011 0%, #001122 50%, #000033 100%)" }}
      />
      
      {/* Animated background beams */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#00ffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M${i * 25},0 Q${50 + i * 10},50 ${i * 25 + 25},100`}
              stroke="url(#beam1)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-50">
        <motion.button
          onClick={() => setShowControls(!showControls)}
          className="bg-black/80 border border-cyan-500/50 text-cyan-400 p-3 rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 right-0 bg-black/90 border border-cyan-500/30 rounded-lg p-4 w-64 backdrop-blur-sm"
          >
            <h3 className="text-cyan-400 font-mono text-sm mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              CYBERPUNK CONTROLS
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-cyan-300 text-xs block mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Intensity: {intensity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
              
              <div>
                <label className="text-cyan-300 text-xs block mb-2 flex items-center gap-2">
                  <Code className="w-3 h-3" />
                  Speed: {speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
              
              <div>
                <label className="text-cyan-300 text-xs block mb-2">
                  Grid Density: {gridDensity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={gridDensity}
                  onChange={(e) => setGridDensity(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>

      {/* Cyberpunk overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-magenta-500 to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-30" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-magenta-500 to-transparent opacity-30" />
      </div>
    </div>
  );
};

export default CyberpunkBackground; 