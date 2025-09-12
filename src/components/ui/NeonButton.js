import React from 'react';
import { Button } from '@mui/material';

export default function NeonButton({ children, ...props }) {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        background: 'linear-gradient(90deg,#7C4DFF, #00E5FF)',
        color: '#0a0f1c',
        fontWeight: 700,
        // border: '1px solid rgba(0,229,255,.25)',
        boxShadow: '0 0 24px rgba(0,229,255,.25)',
        textTransform: 'none',
        '&:hover': {
          background: 'linear-gradient(90deg,#8D5BFF, #19EBFF)',
          boxShadow: '0 0 36px rgba(124,77,255,.35)'
        }
      }}
    >
      {children}
    </Button>
  );
}
