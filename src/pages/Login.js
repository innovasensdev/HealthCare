import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Link } from '@mui/material';
import NeonCard from '../components/ui/NeonCard';
import ParticleLayer from '../components/ui/ParticleLayer';
import Avatar from "../assest/avaratr.png"

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin?.({ email });
  };

  return (
    <Box sx={{ minHeight: '100vh', width:" 100%",display: 'flex',gap:20, alignItems:"center", 
    // background: 'radial-gradient(1200px 400px at 50% -20%, rgba(0,229,255,0.20), transparent), #0a0f1c'
    
    }}>
            <ParticleLayer />
      <Box sx={{width:600,pl:"100px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <img src={Avatar} width="300" height="auto"/>
       
        {/* <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>Log in to consult the AI Doctor</Typography> */}
        <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{
          p:4,background:"red",    
          width:"100%",
        background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",borderRadius:"10px"}}>
          <TextField  placeholder='Enter Mobile Number' type="phone" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
         
          <Button type="submit" variant="contained" size="large" sx={{
                background: "linear-gradient(90deg,#7C4DFF, #00E5FF)",
                color:"white"
          }}>Log in</Button>
        </Stack>
        <Typography sx={{ mt: 2 }} variant="body2">No account? <Link href="/signup" underline="hover">Sign up</Link></Typography>
        </Box>
        <Box sx={{width:"800px"}}>
          <Typography
          sx={{
            fontFamily:"Orbitron, sans-serif",
            fontSize:"60px"
          }}
          >AI-Powered Self symptom Assessment</Typography>
          <Typography
          sx={{
            fontFamily:"Orbitron, sans-serif",
            fontSize:"22px",
            letterSpacing:"2px"
          }}
          >
            A clinical-grade AI platform allowing you to perform self-symptom
            assessment as an initial step in diagnosing your condition.
            </Typography>
        </Box>
    </Box>
  );
}
