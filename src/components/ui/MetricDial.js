import React from 'react';
import { Box, Typography } from '@mui/material';

function arcPath(cx, cy, r, start, end) {
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = end - start <= Math.PI ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function polar(cx, cy, r, a) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }

export default function MetricDial({
  size = 140,
  value = 70,
  label = 'Readiness',
  color = '#00E5FF',
  trail = 'rgba(255,255,255,0.08)'
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const start = -Math.PI * 0.75;
  const end = Math.PI * 0.75;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const sweep = start + (end - start) * pct;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ filter: 'drop-shadow(0 0 12px rgba(0,229,255,.25))' }}>
        <path d={arcPath(cx, cy, r, start, end)} stroke={trail} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        <path d={arcPath(cx, cy, r, start, sweep)} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r - 16} fill="rgba(15,22,41,.65)" stroke="rgba(255,255,255,.06)" />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{Math.round(value)}%</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
