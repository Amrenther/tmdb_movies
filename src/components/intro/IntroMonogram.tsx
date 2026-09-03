import React from 'react';

interface IntroMonogramProps {
  theme?: 'default' | 'red';
}

const IntroMonogram: React.FC<IntroMonogramProps> = ({ theme = 'default' }) => {
  const red = theme === 'red';
  const uid = red ? 'red' : 'default';

  const gradM = red
    ? { a: '#FF3333', b: '#FF0000', c: '#8B0000' }
    : { a: '#38bdf8', b: '#a78bfa', c: '#ec4899' };
  const gradV = red
    ? { a: '#FF0000', b: '#8B0000', c: '#FF3333' }
    : { a: '#a78bfa', b: '#ec4899', c: '#8b5cf6' };

  const shadowM = red ? 'rgba(139,0,0,0.55)' : 'rgba(109,40,217,0.4)';
  const shadowV = red ? 'rgba(255,0,0,0.4)' : 'rgba(236,72,153,0.4)';
  const connector = red ? 'rgba(255,0,0,0.75)' : 'rgba(167,139,250,0.6)';

  return (
    <svg
      width="140"
      height="120"
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-M-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradM.a} />
          <stop offset="50%" stopColor={gradM.b} />
          <stop offset="100%" stopColor={gradM.c} />
        </linearGradient>
        <linearGradient id={`grad-V-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradV.a} />
          <stop offset="50%" stopColor={gradV.b} />
          <stop offset="100%" stopColor={gradV.c} />
        </linearGradient>
        <filter id={`glow-filt-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d="M8 100 L8 20 L35 65 L62 20 L62 100"
        stroke={shadowM} strokeWidth="9"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        transform="translate(2,2)" />
      <path className="mv-stroke-M"
        d="M8 100 L8 20 L35 65 L62 20 L62 100"
        stroke={`url(#grad-M-${uid})`} strokeWidth="7"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        filter={`url(#glow-filt-${uid})`} />
      <path className="mv-stroke-M"
        d="M8 100 L8 20 L35 65 L62 20 L62 100"
        stroke="rgba(255,255,255,0.35)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <path d="M76 20 L103 100 L130 20"
        stroke={shadowV} strokeWidth="9"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        transform="translate(2,2)" />
      <path className="mv-stroke-V"
        d="M76 20 L103 100 L130 20"
        stroke={`url(#grad-V-${uid})`} strokeWidth="7"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        filter={`url(#glow-filt-${uid})`} />
      <path className="mv-stroke-V"
        d="M76 20 L103 100 L130 20"
        stroke="rgba(255,255,255,0.35)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <circle cx="70" cy="60" r="3" fill={connector} />
    </svg>
  );
};

export default IntroMonogram;
