import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

function Bar({ label, value, color }) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setInterval(() => {
      // gentle oscillation around target value
      setV((prev) => {
        const noise = (Math.random() - 0.5) * 2;
        const target = value + noise;
        return Math.max(0, Math.min(100, prev + (target - prev) * 0.08));
      });
    }, 900);
    return () => clearInterval(t);
  }, [value]);

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" color="text.primary">{Math.round(v)}%</Typography>
      </Box>
      <Box sx={{ height: 8, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow:'hidden' }}>
        <Box sx={{ width: `${v}%`, height: '100%', background: color, boxShadow: `0 0 16px ${color}` }} />
      </Box>
    </Box>
  );
}

export default function VitalsBars({ hr=72, o2=98, temp=37 }) {
  return (
    <Box>
      <Bar label="Heart Rate" value={hr} color="#00E5FF" />
      <Bar label="Oxygen" value={o2} color="#00E676" />
      <Bar label="Temperature" value={temp} color="#FFC400" />
    </Box>
  );
}
