import React, { useState, useRef,useEffect } from 'react';
import { Box, Grid, Button, Typography, Chip, Stack, Divider, TextField, IconButton } from '@mui/material';
import NeonCard from '../components/ui/NeonCard';
import VideoCall from '../components/VideoCall';
import { PipecatService } from '../services/pipecatService';
import { PlayArrow, Stop, Send } from '@mui/icons-material';
import ParticleLayer from '../components/ui/ParticleLayer';
import MetricDial from '../components/ui/MetricDial';
import EKGLine from '../components/ui/EKGLine';
import VitalsBars from '../components/ui/VitalsBars';
import SessionTimeline from '../components/ui/SessionTimeline';
import HUDBar from '../components/ui/HUDBar';
import NeonButton from '../components/ui/NeonButton';
import SuggestionChips from '../components/ui/SuggestionChips';
import DiseasesGrid from '../components/clinic/DiseasesGrid';
import PhoneStage from '../components/clinic/PhoneStage';
import StatsPanel from '../components/clinic/StatsPanel';
import HumanSilhouette from '../components/clinic/HumanSilhouette';
import RightAnalytics from '../components/clinic/RightAnalytics';

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const service = useRef(new PipecatService());
  const patient = useRef(new PipecatService());
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        // Attach to patient
        await patient.current.connect(stream);
      } catch (err) {
        console.error("Camera init failed:", err);
      }
    };
    startCamera();
  
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      patient.current.disconnect();
    };
  }, []);


  const connect = async () => {
    await service.current.connect();
    setConnected(true);
    setMessages((m)=>[...m, { role: 'system', text: 'Connecting you to AI Doctor...' }]);
  };

  const disconnect = () => {
    service.current.disconnect();
    setConnected(false);
    setMessages((m)=>[...m, { role: 'system', text: 'Call ended.' }]);
  };

  const sendMessage = (preset) => {
    const text = typeof preset === 'string' && !input ? preset : input;
    if (!text) return;
    setMessages((m)=>[...m, { role: 'user', text }]);
    setInput('');
    setTimeout(()=>{
      setMessages((m)=>[...m, { role: 'assistant', text: 'Thanks for sharing. How long has this been happening?' }]);
    }, 600);
  };



  return (
    <Box sx={{ p: 3, position: 'relative',height:"100vh" }}>
      {/* <HUDBar title="AI Doctor" status={connected ? 'In call' : 'Idle'} /> */}
      <ParticleLayer />
      <Grid container spacing={3} sx={{justifyContent:"center",height:"100vh"}} >
        {/* LEFT: diseases grid */}
        {/* <Grid item xs={12} md={4}>
          <NeonCard sx={{ mb: 3 ,p:3}}>
           
            <DiseasesGrid onSelect={(name)=>setMessages(m=>[...m,{ role:'system', text:`Opening ${name}` }])} />
              <Box sx={{ mt:8,mb:4 }}>
              <EKGLine />
              </Box>
             
          </NeonCard>
        </Grid> */}

        {/* CENTER: phone stage with entire consultation */}
        <Grid item xs={12} md={6}>
       

          <PhoneStage sx={{ height: "60vh", display: "flex", flexDirection: "column" }}>
  {/* Header controls */}
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end',  }}>
    <Stack direction="row" spacing={1}>
      {!connected ? (
        <NeonButton onClick={connect}>Call AI Doctor</NeonButton>
      ) : (
        <Button
          variant="outlined"
          color="error"
          startIcon={<Stop />}
          onClick={disconnect}
          sx={{ width: "max-content" }}
        >
          End
        </Button>
      )}
    </Stack>
  </Box>

  {/* Video area takes the rest */}
  <Box sx={{ flex: 1, mt: 1 }}>
    {connected ? (
      <VideoCall
        cameraSettings={{
          videoEnabled: true,
          audioEnabled: true,
          resolution: '720p',
          frameRate: 30,
          brightness: 50,
          contrast: 50,
          saturation: 50,
          blur: 0,
          exposure: 0,
          hue: 0,
          sepia: 0,
          invert: false,
          grayscale: false,
          flipHorizontal: false,
          showGrid: false,
          backgroundImage: null,
        }}
        pipecatService={service.current}
        sx={{height:"53vh"}}
      />
    ) : (
      <Box
        sx={{
          height: "100%",
          display: "grid",
          placeItems: "center",
          color: "text.secondary",
        }}
      >
        {/* <Typography>Press "Start" to connect with the AI Doctor</Typography> */}
      </Box>
    )}
  </Box>
</PhoneStage>

          <Grid container spacing={3} sx={{mt:1,height:"36vh"}}>
            <Grid item xs={12} md={4} >
            <NeonCard sx={{ mb: 3,p:2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Patient Camera</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{  overflow: 'auto', }}>
            <Box sx={{  }}>
            {/* <VideoCall localStream={localStream} pipecatService={patient.current} /> */}


            <VideoCall 
            localStream={localStream}
            cameraSettings={{
                      videoEnabled: true,
                      audioEnabled: true,
                      resolution: '720p',
                      frameRate: 30,
                      brightness: 50,
                      contrast: 50,
                      saturation: 50,
                      blur: 0,
                      exposure: 0,
                      hue: 0,
                      sepia: 0,
                      invert: false,
                      grayscale: false,
                      flipHorizontal: false,
                      showGrid: false,
                      backgroundImage: null,
                    }} pipecatService={patient.current}
                    sx={{height:"20vh"}}
                     />
                </Box>
            </Box>
            {/* <SuggestionChips onPick={(s)=>sendMessage(s)} /> */}
            {/* <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <TextField
                placeholder="Type a question or symptom..."
                size="small"
                fullWidth
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ sendMessage(); } }}
              />
              <IconButton color="primary" onClick={()=>sendMessage()}><Send /></IconButton>
            </Stack> */}
          </NeonCard>
            </Grid>
            <Grid item xs={12} md={4}>
            <NeonCard sx={{ mb: 3,p:2 }}>
            <RightAnalytics />
          </NeonCard>
            </Grid>
          </Grid>
         
          
         
        </Grid>

        {/* RIGHT: analytics + conversation */}
        <Grid item xs={12} md={3}>
        <NeonCard sx={{ mb: 3,p:2, }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                placeholder="Type your question.."
                size="small"
                fullWidth
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ sendMessage(); } }}
              />
              <IconButton color="primary" onClick={()=>sendMessage()}><Send /></IconButton>
            </Stack>
            {/* <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Conversation</Typography> */}
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: "auto", overflow: 'auto', pr: 1 }}>
              <Stack spacing={1}>
                {messages.map((m, i) => (
                  <Box key={i} sx={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>
                    <Chip
                      label={m.text}
                      color={m.role === 'user' ? 'primary' : (m.role === 'assistant' ? 'secondary' : 'default')}
                      variant={m.role === 'system' ? 'outlined' : 'filled'}
                      sx={{ maxWidth: '100%', whiteSpace: 'normal' }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
            {/* <SuggestionChips onPick={(s)=>sendMessage(s)} /> */}
           
          </NeonCard>
      
        </Grid>
      </Grid>
    </Box>
  );
}
