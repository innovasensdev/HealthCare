import React from 'react';
import { Paper, Box } from '@mui/material';

const NeonCard = ({ children, glow = '#00E5FF', ...props }) => (
  <Paper
    elevation={0}
    sx={{
      position: 'relative',
      p: 3,
      borderRadius: 3,
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        padding: '1px',
        background: `linear-gradient(135deg, ${glow}, transparent)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        pointerEvents: 'none',
      },
    }}
    {...props}
  >
    <Box>{children}</Box>
  </Paper>
);

export default NeonCard;
