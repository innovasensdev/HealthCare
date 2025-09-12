import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Link } from '@mui/material';
import NeonCard from '../components/ui/NeonCard';

export default function Signup({ onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignup?.({ name, email });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(1200px 400px at 50% -20%, rgba(124,77,255,0.18), transparent), #0a0f1c' }}>
      <NeonCard sx={{ width: 480 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Create account</Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>Start your AI healthcare journey</Typography>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField label="Full name" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
          <TextField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} fullWidth />
          <Button type="submit" variant="contained" size="large">Create account</Button>
        </Stack>
        <Typography sx={{ mt: 2 }} variant="body2">Have an account? <Link href="/" underline="hover">Log in</Link></Typography>
      </NeonCard>
    </Box>
  );
}
