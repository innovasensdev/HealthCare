import React from 'react';
import { Box } from '@mui/material';

export default function PhoneStage({ children ,sx}) {
  return (
    <Box sx={{
      position:'relative',
      height: 560,
      borderRadius: '16px',
      // background: '#050912',
      border: '1px solid rgba(0,229,255,0.20)',
      overflow: 'hidden',
      // boxShadow: 'inset 0 0 40px rgba(124,77,255,.15), 0 0 40px rgba(0,229,255,.15)',
      ...sx,

    }}>
      <Box sx={{ position:'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 120, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ position:'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 80, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ position:'absolute', inset: 0, p: 1.5 }}>
        {children}
      </Box>
    </Box>
  );
}
