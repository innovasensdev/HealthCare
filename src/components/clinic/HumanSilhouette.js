import React from 'react';

export default function HumanSilhouette() {
  return (
    <svg viewBox="0 0 200 480" width="100%" height="100%" style={{ opacity:.7, filter:'drop-shadow(0 0 12px rgba(0,240,255,.35))' }}>
      <defs>
        <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path d="M100 30c18 0 32 14 32 32s-14 32-32 32-32-14-32-32 14-32 32-32z m-8 82c-14 0-26 10-28 24l-8 52c-2 12 6 22 18 24l4 64-24 76c-3 10 2 20 12 23 10 3 20-2 23-12l22-70 22 70c3 10 13 15 23 12 10-3 15-13 12-23l-24-76 4-64c12-2 20-12 18-24l-8-52c-2-14-14-24-28-24h-38z" fill="url(#teal)" stroke="#00F0FF" strokeOpacity="0.3" />
    </svg>
  );
}
