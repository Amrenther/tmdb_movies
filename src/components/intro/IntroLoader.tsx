import React, { useEffect, useRef, useState, useCallback } from 'react';
import IntroMonogram from './IntroMonogram';
import { playIntroSound, setIntroMuted, isIntroMuted } from './IntroSound';
import './intro.css';

interface IntroLoaderProps {
  onComplete: () => void;
}

type Phase = 'monogram' | 'explode' | 'assemble' | 'hold' | 'exit';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  size: number;
  w: number;
  h: number;
  opacity: number;
  color: string;
  kind: 'ember' | 'shard';
  role: 'core' | 'debris';
  letterIndex: number;
  angle: number;
  spin: number;
}

const TIMING = {
  monogram: 1000,
  explode: 1000,
  assemble: 1200,
  hold: 2100,
  exit: 800,
};

const PARTICLE_COUNT = 560;
const LETTER_COUNT = 10;
const COLORS = ['#FF0000', '#FF2A2A', '#CC0000', '#FF4444', '#8B0000', '#FF6666', '#FFD0D0'];
const GLITCH_COLORS = ['#00ffff', '#ff00ee', '#ffffff'];

const RAYS = [
  { deg: 0, w: 14, o: 0.38 },
  { deg: 9, w: 3, o: 0.22 },
  { deg: 18, w: 7, o: 0.32 },
  { deg: 28, w: 2, o: 0.18 },
  { deg: 38, w: 11, o: 0.34 },
  { deg: 49, w: 4, o: 0.24 },
  { deg: 58, w: 2, o: 0.16 },
  { deg: 70, w: 9, o: 0.3 },
  { deg: 82, w: 3, o: 0.2 },
  { deg: 90, w: 16, o: 0.4 },
  { deg: 102, w: 2, o: 0.18 },
  { deg: 112, w: 6, o: 0.28 },
  { deg: 124, w: 12, o: 0.36 },
  { deg: 136, w: 3, o: 0.2 },
  { deg: 148, w: 8, o: 0.3 },
  { deg: 158, w: 2, o: 0.16 },
  { deg: 168, w: 5, o: 0.24 },
];

const GLITCH_BITS = [
  { top: '38%', left: '18%', w: 54, h: 3, color: '#00ffff', delay: '0s' },
  { top: '44%', left: '72%', w: 38, h: 4, color: '#ff00ee', delay: '0.12s' },
  { top: '57%', left: '14%', w: 28, h: 3, color: '#ffffff', delay: '0.28s' },
  { top: '61%', left: '78%', w: 46, h: 2, color: '#00ffff', delay: '0.4s' },
  { top: '48%', left: '8%', w: 22, h: 5, color: '#ff3366', delay: '0.18s' },
  { top: '52%', left: '86%', w: 30, h: 3, color: '#ffffff', delay: '0.55s' },
  { top: '33%', left: '62%', w: 18, h: 2, color: '#00ffff', delay: '0.7s' },
  { top: '66%', left: '28%', w: 40, h: 3, color: '#ff00ee', delay: '0.33s' },
];

const LETTER_TIMES = [2000, 2240, 2480, 2720, 2960, 3000, 3080, 3160, 3220, 3280];
const MOVIE = ['M', 'O', 'V', 'I', 'E'];
const VERSE = ['V', 'E', 'R', 'S', 'E'];

export const SESSION_KEY = 'mv_intro_seen';

export function clearIntroSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function layoutLetters(w: number, h: number) {
  const fontSize = Math.max(54, Math.min(w * 0.12, 132));
  const movieGap = fontSize * 0.72;
  const verseGap = fontSize * 0.78;
  const cx = w / 2;
  const cy = h / 2;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) positions.push({ x: cx + (i - 2) * movieGap, y: cy - fontSize * 0.48 });
  for (let i = 0; i < 5; i++) positions.push({ x: cx + (i - 2) * verseGap, y: cy + fontSize * 0.48 });
  return { positions, fontSize };
}

function createParticles(w: number, h: number): Particle[] {
  const { positions, fontSize } = layoutLetters(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const letterIndex = i % LETTER_COUNT;
    const pos = positions[letterIndex];
    const edge = 0.55 + Math.random() * 0.55;
    const jitterX = (Math.random() - 0.5) * fontSize * edge;
    const jitterY = (Math.random() - 0.5) * fontSize * 0.7;
    const isShard = i % 5 === 0;
    const isDebris = i % 3 === 0;
    const glitch = i % 37 === 0;
    particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      targetX: pos.x + jitterX,
      targetY: pos.y + jitterY,
      size: isShard ? 0 : 0.5 + Math.random() * 2.6,
      w: 2 + Math.random() * 10,
      h: 1 + Math.random() * 3,
      opacity: 0,
      color: glitch ? GLITCH_COLORS[i % GLITCH_COLORS.length] : COLORS[i % COLORS.length],
      kind: isShard ? 'shard' : 'ember',
      role: isDebris ? 'debris' : 'core',
      letterIndex,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.12,
    });
  }
  return particles;
}

function burstFromCenter(particles: Particle[], w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  for (const p of particles) {
    p.x = cx;
    p.y = cy;
    const angle = Math.random() * Math.PI * 2;
    const speed = p.role === 'debris' ? 8 + Math.random() * 18 : 3 + Math.random() * 10;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.opacity = 0.5 + Math.random() * 0.5;
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  if (p.kind === 'shard') {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('monogram');
  const [shockwave, setShockwave] = useState(false);
  const [rayState, setRayState] = useState<'off' | 'fire' | 'linger'>('off');
  const [muted, setMuted] = useState(isIntroMuted());
  const [exiting, setExiting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const svgWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef<Phase>('monogram');
  const unlockedRef = useRef(0);
  const burstDoneRef = useRef(false);
  const doneRef = useRef(false);
  const rafRef = useRef(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('exit');
    phaseRef.current = 'exit';
    setExiting(true);
    setTimeout(onComplete, TIMING.exit);
  }, [onComplete]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(w, h);
      } else {
        const { positions, fontSize } = layoutLetters(w, h);
        for (const p of particlesRef.current) {
          const pos = positions[p.letterIndex];
          const edge = 0.55 + Math.random() * 0.55;
          p.targetX = pos.x + (Math.random() - 0.5) * fontSize * edge;
          p.targetY = pos.y + (Math.random() - 0.5) * fontSize * 0.7;
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const current = phaseRef.current;
      const particles = particlesRef.current;

      if (current === 'explode' && !burstDoneRef.current) {
        burstFromCenter(particles, w, h);
        burstDoneRef.current = true;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        p.angle += p.spin;

        if (current === 'explode') {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.988;
          p.vy *= 0.988;
        } else if (current === 'assemble') {
          if (p.letterIndex < unlockedRef.current) {
            if (p.role === 'core') {
              p.x += (p.targetX - p.x) * 0.1;
              p.y += (p.targetY - p.y) * 0.1;
              p.opacity = Math.min(1, p.opacity + 0.05);
            } else {
              p.x += p.vx * 0.55;
              p.y += p.vy * 0.55;
              p.vx *= 0.992;
              p.vy *= 0.992;
              p.opacity = Math.min(0.85, p.opacity + 0.02);
            }
          } else {
            p.x += p.vx * 0.4;
            p.y += p.vy * 0.4;
            p.vx *= 0.99;
            p.vy *= 0.99;
          }
        } else if (current === 'hold' || current === 'exit') {
          if (p.role === 'core') {
            p.x += (p.targetX - p.x) * 0.08 + p.vx * 0.04;
            p.y += (p.targetY - p.y) * 0.08 + p.vy * 0.04;
            p.x += Math.sin(p.angle) * 0.15;
            p.y += Math.cos(p.angle) * 0.15;
          } else {
            p.x += p.vx * 0.22;
            p.y += p.vy * 0.22;
            p.opacity *= 0.997;
            if (p.opacity < 0.12) {
              p.x = p.targetX;
              p.y = p.targetY;
              const a = Math.random() * Math.PI * 2;
              const s = 2 + Math.random() * 7;
              p.vx = Math.cos(a) * s;
              p.vy = Math.sin(a) * s;
              p.opacity = 0.55 + Math.random() * 0.4;
            }
          }
          if (current === 'exit') p.opacity *= 0.93;
        }

        if (p.opacity > 0.03) drawParticle(ctx, p);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    playIntroSound();
    const T: ReturnType<typeof setTimeout>[] = [];

    T.push(setTimeout(() => {
      if (doneRef.current) return;
      setPhase('explode');
      svgWrapRef.current?.classList.add('glow-pulse');
      setShockwave(true);
      setRayState('fire');
      setTimeout(() => svgWrapRef.current?.classList.add('shrink-out'), 180);
      setTimeout(() => setShockwave(false), 700);
      setTimeout(() => {
        if (!doneRef.current) setRayState('linger');
      }, 900);
    }, TIMING.monogram));

    T.push(setTimeout(() => {
      if (doneRef.current) return;
      setPhase('assemble');
    }, TIMING.monogram + TIMING.explode));

    LETTER_TIMES.forEach((t, i) => {
      T.push(setTimeout(() => {
        if (doneRef.current) return;
        unlockedRef.current = i + 1;
        setVisibleCount(i + 1);
      }, t));
    });

    T.push(setTimeout(() => {
      if (doneRef.current) return;
      setPhase('hold');
    }, TIMING.monogram + TIMING.explode + TIMING.assemble));

    T.push(setTimeout(() => finish(),
      TIMING.monogram + TIMING.explode + TIMING.assemble + TIMING.hold));

    return () => T.forEach(clearTimeout);
  }, [finish]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);
    setIntroMuted(next);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    finish();
  };

  const showMonogram = phase === 'monogram' || phase === 'explode';
  const showTitle = phase === 'assemble' || phase === 'hold' || phase === 'exit';
  const showFx = phase === 'explode' || phase === 'assemble' || phase === 'hold' || phase === 'exit';
  const rayClass = rayState === 'fire' ? ' fire' : rayState === 'linger' ? ' linger' : '';

  return (
    <div
      className={`intro-overlay${exiting ? ' exiting' : ''}`}
      onClick={finish}
      role="presentation"
    >
      <div className="intro-bg" />
      <div className="intro-grid intro-grid-ceil" />
      <div className="intro-grid intro-grid-floor" />
      <div className={`intro-bloom${showFx ? ' on' : ''}`} />
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
      <div className={`intro-shockwave${shockwave ? ' fire' : ''}`} />
      <div className={`intro-rays${rayClass}`}>
        {RAYS.map((ray) => (
          <div
            key={ray.deg}
            className="intro-ray"
            style={{
              transform: `rotate(${ray.deg}deg)`,
              width: ray.w,
              opacity: ray.o,
            }}
          />
        ))}
      </div>

      <div className={`intro-glitch-bits${phase === 'hold' ? ' on' : ''}`}>
        {GLITCH_BITS.map((bit, i) => (
          <div
            key={i}
            className="intro-glitch-bit"
            style={{
              top: bit.top,
              left: bit.left,
              width: bit.w,
              height: bit.h,
              background: bit.color,
              animationDelay: bit.delay,
            }}
          />
        ))}
      </div>

      <div className="intro-scanlines" />

      <div className="intro-content">
        {showMonogram && (
          <div ref={svgWrapRef} className="intro-svg-wrap">
            <IntroMonogram theme="red" />
          </div>
        )}

        {showTitle && (
          <div className={`intro-title${phase === 'hold' ? ' glitch' : ''}`}>
            <div className="intro-title-line movie">
              {MOVIE.map((ch, i) => (
                <span key={`m${i}`} className={`intro-letter${visibleCount > i ? ' on' : ''}`}>
                  <span className="intro-letter-bloom" aria-hidden="true">{ch}</span>
                  <span className="intro-letter-face">{ch}</span>
                </span>
              ))}
            </div>
            <div className="intro-title-line verse">
              {VERSE.map((ch, i) => (
                <span key={`v${i}`} className={`intro-letter${visibleCount > i + 5 ? ' on' : ''}`}>
                  <span className="intro-letter-bloom" aria-hidden="true">{ch}</span>
                  <span className="intro-letter-face">{ch}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="intro-controls">
        <button className="intro-mute-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button className="intro-skip-btn" onClick={handleSkip} aria-label="Skip intro">
          Skip Intro ›
        </button>
      </div>
    </div>
  );
};

export default IntroLoader;
