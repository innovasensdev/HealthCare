import React, { useEffect, useRef } from 'react';

// Lightweight starfield/particle background (GPU-friendly)
export default function ParticleLayer({ density = 0.00015, speed = 0.05, color = 'rgba(0,229,255,0.4)' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const num = Math.max(50, Math.floor(width * height * density));
    const stars = new Array(num).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.2 + 0.4,
      r: Math.random() * 1.0 + 0.3,
      vx: (Math.random() - 0.7) * speed,
      vy: (Math.random() - 0.6) * speed,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < -5) s.x = width + 5; if (s.x > width + 5) s.x = -5;
        if (s.y < -5) s.y = height + 5; if (s.y > height + 5) s.y = -5;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3 * s.z, 0, Math.PI * 2);
        ctx.fill();
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    draw();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animationRef.current); window.removeEventListener('resize', onResize); };
  }, [density, speed, color]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{ position:'absolute', inset:0, background: 'radial-gradient(1200px 400px at 50% 20%, rgba(0,229,255,0.04), transparent)'}} />
    </div>
  );
}
