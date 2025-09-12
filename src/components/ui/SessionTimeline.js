import React from 'react';
import { Box, Chip } from '@mui/material';

const steps = ['Ringing', 'Connected', 'Speaking', 'Ended'];

export default function SessionTimeline({ stage = 'Ringing' }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {steps.map((s) => (
        <Chip
          key={s}
          label={s}
          color={s === stage ? 'primary' : 'default'}
          variant={s === stage ? 'filled' : 'outlined'}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Box>
  );
}
