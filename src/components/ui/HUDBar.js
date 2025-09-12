import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Chip } from '@mui/material';
import { HelpOutline, Settings, AccountCircle } from '@mui/icons-material';

export default function HUDBar({ title = 'AI Doctor', status = 'Idle' }) {
  return (
    <AppBar position="static" elevation={0} sx={{
      background: 'linear-gradient(180deg, rgba(10,15,28,0.7) 0%, rgba(15,22,41,0.7) 100%)',
      border: '1px solid rgba(0,229,255,0.18)',
      backdropFilter: 'blur(8px)',
    }}>
      <Toolbar sx={{ display:'flex', justifyContent:'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
          <Chip label={status} color={status==='In call' ? 'success' : 'default'} size="small" />
          <IconButton color="inherit"><HelpOutline /></IconButton>
          <IconButton color="inherit"><Settings /></IconButton>
          <IconButton color="inherit"><AccountCircle /></IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
