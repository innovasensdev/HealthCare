import React from 'react';
import { Box, Chip } from '@mui/material';

export default function SuggestionChips({ onPick }) {
  const suggestions = ['Headache', 'Fever', 'Medication', 'Follow-up', 'Diet advice'];
  return (
    <Box sx={{ display:'flex', gap: 1, flexWrap:'wrap', mb: 1 }}>
      {suggestions.map(s => (
        <Chip key={s} label={s} size="small" onClick={() => onPick?.(s)} variant="outlined" />
      ))}
    </Box>
  );
}
