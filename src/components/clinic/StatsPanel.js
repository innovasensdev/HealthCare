import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';

function VUBar({ color='#00E5FF' }) {
  const [h, setH] = useState(20);
  useEffect(() => {
    const t = setInterval(()=>{
      setH(10 + Math.random()*90);
    }, 120);
    return () => clearInterval(t);
  }, []);
  return (
    <Box sx={{ width: 8, height: 100, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow:'hidden' }}>
      <Box sx={{ width:'100%', height: `${h}%`, background: color, boxShadow:`0 0 12px ${color}`, transition: 'height .1s linear' }} />
    </Box>
  );
}

export default function StatsPanel() {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Stats</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display:'flex', gap: 1, alignItems:'flex-end', mb: 3 }}>
        <VUBar color="#00E5FF" />
        <VUBar color="#7C4DFF" />
        <VUBar color="#00E5FF" />
        <VUBar color="#7C4DFF" />
        <VUBar color="#00E5FF" />
      </Box>
      <Typography variant="body2" color="text.secondary">Live voice level</Typography>
    </Box>
  );
}
