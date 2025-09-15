import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Button, Typography, Chip, Stack, Divider, TextField, IconButton } from '@mui/material';
import NeonCard from '../components/ui/NeonCard';
import VideoCall from '../components/VideoCall';
import { PipecatService } from '../services/pipecatService';
import { PlayArrow, Stop, Send, Mic, MicOff, VolumeUp, VolumeOff } from '@mui/icons-material';
import NeonButton from '../components/ui/NeonButton';
import DiseasesGrid from '../components/clinic/DiseasesGrid';
import PhoneStage from '../components/clinic/PhoneStage';
import StatsPanel from '../components/clinic/StatsPanel';
import HumanSilhouette from '../components/clinic/HumanSilhouette';
import RightAnalytics from '../components/clinic/RightAnalytics';

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [conversationLogs, setConversationLogs] = useState([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const service = useRef(new PipecatService());
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    // Set up conversation update handler
    service.current.setOnConversationUpdate((message) => {
      console.log('📨 Received conversation update:', message);
      handleConversationUpdate(message);
    });

    // Set up remote stream handler
    service.current.setOnRemoteStream((stream) => {
      console.log('🎥 Received remote stream in Dashboard:', stream);
      setRemoteStream(stream);
      
      // Set up audio playback for remote stream
      setupRemoteAudio(stream);
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      service.current.endCall();
    };
  }, []);

  // Set up remote audio playback
  const setupRemoteAudio = (stream) => {
    try {
      // Create audio element for remote stream
      const audio = new Audio();
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.volume = 1.0;
      audio.muted = false;
      
      remoteAudioRef.current = audio;
      
      // Handle autoplay restrictions
      const playAudio = async () => {
        try {
          await audio.play();
          console.log('🔊 Remote audio started playing');
        } catch (error) {
          console.warn('⚠️ Remote audio autoplay failed:', error);
          
          // Show user interaction prompt
          const enableAudio = () => {
            if (audio) {
              audio.muted = false;
              audio.volume = 1.0;
              audio.play().catch(console.warn);
            }
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
          };
          
          document.addEventListener('click', enableAudio);
          document.addEventListener('touchstart', enableAudio);
        }
      };
      
      playAudio();
      
      // Monitor audio track
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        console.log('🔊 Remote audio track detected:', audioTracks[0].label);
        
        audioTracks[0].addEventListener('ended', () => {
          console.log('🔊 Remote audio track ended');
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to setup remote audio:', error);
    }
  };

  // Handle conversation updates from the bot
  const handleConversationUpdate = (message) => {
    console.log('🔄 Processing conversation update:', message);
    
    // Handle different types of messages from the bot
    if (message.type === 'user-transcription') {
      // User speech was transcribed
      setConversationLogs(prev => [{
        role: 'user',
        text: message.data?.text || message.text || 'User spoke',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);
    } else if (message.type === 'user-text') {
      // User sent a text message (echo back)
      setConversationLogs(prev => [{
        role: 'user',
        text: message.data?.text || message.text || 'User sent message',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);
    } else if (message.type === 'bot-llm-text') {
      // Bot is generating response text - accumulate words into complete message
      const newText = message.data?.text || message.text || '';
      
      if (newText) {
        setCurrentAssistantMessage(prev => {
          const updatedMessage = prev + newText;
          
          // Check if this looks like a complete sentence or phrase
          if (newText.includes('.') || newText.includes('!') || newText.includes('?') || 
              newText.includes('\n') || message.data?.isComplete) {
            // Complete message - add to conversation logs at the top
            setConversationLogs(prevLogs => [{
              role: 'assistant',
              text: updatedMessage.trim(),
              timestamp: new Date().toLocaleTimeString()
            }, ...prevLogs]);
            return ''; // Reset current message
          } else {
            // Partial message - keep accumulating
            return updatedMessage;
          }
        });
      }
    } else if (message.type === 'bot-transcription') {
      // Bot finished speaking
      console.log('🔊 Bot finished speaking');
      setIsAssistantSpeaking(false);
      
      // If there's a partial message, complete it
      if (currentAssistantMessage.trim()) {
        setConversationLogs(prevLogs => [{
          role: 'assistant',
          text: currentAssistantMessage.trim(),
          timestamp: new Date().toLocaleTimeString()
        }, ...prevLogs]);
        setCurrentAssistantMessage('');
      }
    } else if (message.type === 'user-started-speaking') {
      console.log('🎤 User started speaking');
    } else if (message.type === 'user-stopped-speaking') {
      console.log('🎤 User stopped speaking');
    } else if (message.type === 'bot-llm-started') {
      console.log('🧠 Bot started thinking');
      setIsAssistantSpeaking(true);
    } else if (message.type === 'bot-tts-started') {
      console.log('🔊 Bot started speaking');
      setIsAssistantSpeaking(true);
    } else if (message.type === 'bot-tts-finished') {
      console.log('🔊 Bot finished speaking');
      setIsAssistantSpeaking(false);
    } else {
      // Handle any other message types
      console.log('📨 Unknown message type:', message.type, message);
    }
  };

  const startCall = async () => {
    try {
      console.log('🚀 Starting call...');
      setIsCallActive(true);
      
      // Start the call - VideoCall component will handle its own camera access
      await service.current.startCall();
      
      setConnected(true);
      console.log('✅ Call started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      setIsCallActive(false);
    }
  };

  const endCall = () => {
    console.log('🛑 Ending call...');
    setIsCallActive(false);
    setConnected(false);
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current = null;
    }
    
    setRemoteStream(null);
    service.current.endCall();
    
    // Clean up audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const toggleAudio = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsAudioEnabled(!remoteAudioRef.current.muted);
    }
  };

  const sendMessage = () => {
    if (input.trim() && isCallActive) {
      // Add user message to conversation logs immediately at the top
      setConversationLogs(prev => [{
        role: 'user',
        text: input.trim(),
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);
      
      // Send message to bot
      service.current.sendTextMessage(input.trim());
      
      // Clear input
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2,minHeight: '100vh',display:"flex",alignItems:"center",justifyContent:"center"
    
      }}>
      <Grid container spacing={3} sx={{ justifyContent:"center" }}>
        {/* Main Content Area - 8 columns */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2} sx={{  }}>
            {/* Call AI Doctor Section - 70vh */}
            <Grid item xs={12} sx={{ height: '65vh' }}>
              <NeonCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',p:"10px" }}>
                {!isCallActive ? (
                  <NeonButton
                    onClick={startCall}
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{ fontSize: '1.2rem', px: 4, py: 2 }}
                  >
                    Start Conversation
                  </NeonButton>
                ) : (
                  <Box sx={{ textAlign: 'center', width: '100%', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 ,mt:2}}>
                      <NeonButton
                        onClick={endCall}
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<Stop />}
                        sx={{ fontSize: '1.2rem', px: 4, py: 2 }}
                      >
                        Stop Call
                      </NeonButton>
                      
                      {/* Audio Toggle */}
                      {/* <IconButton
                        onClick={toggleAudio}
                        sx={{ 
                          color: isAudioEnabled ? '#00ff88' : '#ff4444',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                        }}
                      >
                        {isAudioEnabled ? <VolumeUp /> : <VolumeOff />}
                      </IconButton> */}
                    </Box>
                    
                    {/* HeyGen Avatar Video - Always show when call is active */}
                    <Box sx={{ width: "100vh", height: 'calc(100% - 80px)', position: 'relative' }}>
                      <VideoCall
                        ref={remoteVideoRef}
                        stream={remoteStream}
                        isRemote={true}
                        sx={{ width: '100%', height: '52vh', objectFit: 'cover' }}
                      />
                    </Box>
                  </Box>
                )}
              </NeonCard>
            </Grid>

            {/* Bottom Section - 30vh */}
            <Grid item xs={12} sx={{ height: '15vh' }}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Patient Camera */}
                <Grid item xs={6}>
                  <NeonCard sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                 
                    <VideoCall
                      ref={localVideoRef}
                      isRemote={false}
                      pipecatService={service.current}
                      sx={{ 
                        width: '100%', 
                        height: '22vh', 
                        objectFit: 'cover'
                      }}
                    />
                  </NeonCard>
                </Grid>

                {/* Equalizer Animation */}
                <Grid item xs={6}>
                  <NeonCard sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                     
                      <RightAnalytics />
                     
                    
                    
                    </Box>
                  </NeonCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Conversation Panel - 4 columns */}
        <Grid item xs={12} md={3} sx={{height:"90vh"}}>
          <NeonCard sx={{  display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid rgba(0,240,255,0.22)', color: 'rgba(0,240,255)' }}>
              Conversation
            </Typography>
             {/* Text Input */}
             <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(0,240,255,0.22)' },
                      '&:hover fieldset': { borderColor: 'rgba(0,240,255,1)' },
                      '&.Mui-focused fieldset': { borderColor: 'rgba(0,240,255,1)' }
                    }
                  }}
                />
                <IconButton onClick={sendMessage} sx={{ color: 'rgba(0,240,255,1)' }}>
                  <Send />
                </IconButton>
              </Box>
            </Box>
            {conversationLogs.length > 0 && 
            <Box sx={{ flex: 1, overflow: 'auto',height:"60vh", p: 2 }}>
              <Stack spacing={2}>
                {conversationLogs.map((log, index) => (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: log.role === 'user' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 150, 255, 0.1)',
                      border: `1px solid ${log.role === 'user' ? '#00ff88' : '#0096ff'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={log.role === 'user' ? 'You' : 'AI Doctor'}
                        size="small"
                        sx={{
                          backgroundColor: log.role === 'user' ? '#00ff88' : '#0096ff',
                          color: '#000',
                          fontWeight: 'bold'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        {log.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {log.text}
                    </Typography>
                  </Box>
                ))}
                
                {/* Show current assistant message being built */}
                {currentAssistantMessage && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 150, 255, 0.1)',
                      border: '1px solid #0096ff',
                      opacity: 0.7
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label="AI Doctor (typing...)"
                        size="small"
                        sx={{
                          backgroundColor: '#0096ff',
                          color: '#000',
                          fontWeight: 'bold'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        {new Date().toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {currentAssistantMessage}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          }
           
          </NeonCard>
        </Grid>
      </Grid>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
}