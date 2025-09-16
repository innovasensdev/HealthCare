import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Fullscreen,
  FullscreenExit,
  VolumeUp,
  VolumeOff,
  CallEnd,
  GridOn,
  GridOff,
  FlipCameraIos,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
} from '@mui/icons-material';

const VideoCall = ({ stream, isRemote = false, sx, pipecatService, ...props }) => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);

  // Handle external stream (from parent component)
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log(`🎥 Setting up ${isRemote ? 'remote' : 'local'} video stream:`, stream);
      
      videoRef.current.srcObject = stream;
      
      // Handle autoplay restrictions
      const playVideo = async () => {
        try {
          await videoRef.current.play();
          console.log(`✅ ${isRemote ? 'Remote' : 'Local'} video started playing`);
          setIsLoading(false);
        } catch (error) {
          console.warn(`⚠️ ${isRemote ? 'Remote' : 'Local'} video autoplay failed:`, error);
          setIsLoading(false);
          
          // For remote streams, try to enable audio on user interaction
          if (isRemote) {
            const enableAudio = () => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.volume = 1.0;
                videoRef.current.play().catch(console.warn);
              }
              document.removeEventListener('click', enableAudio);
              document.removeEventListener('touchstart', enableAudio);
            };
            
            document.addEventListener('click', enableAudio);
            document.addEventListener('touchstart', enableAudio);
          }
        }
      };
      
      playVideo();
    } else if (!stream && !isRemote) {
      // No stream provided and it's local - get camera access
      getLocalCamera();
    } else if (!stream) {
      setIsLoading(false);
    }
  }, [stream, isRemote]);

  // Get local camera access
  const getLocalCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎥 Requesting local camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: { 
          sampleRate: { ideal: 16000 },
          channelCount: { ideal: 1 },
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      console.log('✅ Local camera access granted:', stream);
      setLocalStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
          console.log('✅ Local video started playing');
        } catch (playError) {
          console.warn('⚠️ Local video autoplay failed:', playError);
        }
      }
      
      // Set up audio analysis for speaking detection
      setupAudioAnalyser(stream);
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ Failed to access local camera:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Handle track changes
  useEffect(() => {
    const currentStream = stream || localStream;
    if (currentStream) {
      const handleTrackChange = () => {
        console.log(`📊 ${isRemote ? 'Remote' : 'Local'} stream tracks updated:`, {
          audio: currentStream.getAudioTracks().length,
          video: currentStream.getVideoTracks().length
        });
      };

      currentStream.addEventListener('addtrack', handleTrackChange);
      currentStream.addEventListener('removetrack', handleTrackChange);

      return () => {
        currentStream.removeEventListener('addtrack', handleTrackChange);
        currentStream.removeEventListener('removetrack', handleTrackChange);
      };
    }
  }, [stream, localStream, isRemote]);

  // Audio level detection for local streams
  useEffect(() => {
    if (!isRemote && (stream || localStream)) {
      const currentStream = stream || localStream;
      const audioTracks = currentStream.getAudioTracks();
      if (audioTracks.length > 0) {
        setupAudioAnalyser(currentStream);
      }
    }
  }, [stream, localStream, isRemote]);

  const setupAudioAnalyser = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
    
      analyser.fftSize = 512;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
    
      let silenceTimeout = null;
    
      const detectVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let values = 0;
        for (let i = 0; i < dataArray.length; i++) {
          values += dataArray[i];
        }
        const average = values / dataArray.length;
    
        if (average > 20) {
          setIsSpeaking(true);
    
          if (silenceTimeout) clearTimeout(silenceTimeout);
          silenceTimeout = setTimeout(() => {
            setIsSpeaking(false);
          }, 800);
        }
    
        requestAnimationFrame(detectVolume);
      };
    
      detectVolume();
    } catch (error) {
      console.warn('Failed to setup audio analyser:', error);
    }
  };

  // Toggle video (camera on/off) - use PipecatService for local streams
  const toggleVideo = () => {
    if (!isRemote && pipecatService) {
      // Use PipecatService to control the track sent to bot
      const isVideoMuted = pipecatService.toggleVideo();
      setIsVideoEnabled(!isVideoMuted);
    } else {
      // Fallback for local streams without PipecatService
      const currentStream = stream || localStream;
      if (currentStream) {
        const videoTracks = currentStream.getVideoTracks();
        videoTracks.forEach(track => {
          track.enabled = !track.enabled;
          setIsVideoEnabled(track.enabled);
        });
      }
    }
  };

  // Toggle audio (microphone on/off) - use PipecatService for local streams
  const toggleAudio = () => {
    if (!isRemote && pipecatService) {
      // Use PipecatService to control the track sent to bot
      const isAudioMuted = pipecatService.toggleAudio();
      setIsMuted(isAudioMuted);
    } else {
      // Fallback for local streams without PipecatService
      const currentStream = stream || localStream;
      if (currentStream) {
        const audioTracks = currentStream.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = !track.enabled;
          setIsMuted(!track.enabled);
        });
      }
    }
  };

  // Wave animation for speaking detection
  const renderWaves = () => {
    if (!isSpeaking || isRemote) return null;
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          gap: 1,
          zIndex: 5,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 3,
              height: 20,
              backgroundColor: '#00e5ff',
              borderRadius: 2,
              animation: 'waveAnim 1s infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </Box>
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const currentStream = stream || localStream;

  return (
    <Box sx={{ 
      position: 'relative', 
      height: sx?.height || '100%',
      width: sx?.width || '100%',
      overflow: 'hidden',
      borderRadius: sx?.borderRadius || '16px',
      backgroundColor: '#000',
      ...sx
    }}>
      {isLoading ? (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666'
        }}>
          <CircularProgress size={60} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            {isRemote ? 'Loading AI Doctor...' : 'Initializing camera...'}
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#ff4444',
          textAlign: 'center',
          p: 2
        }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Camera Error
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={getLocalCamera}
            sx={{ 
              backgroundColor: '#00ff88',
              color: '#000',
              '&:hover': { backgroundColor: '#00cc6a' }
            }}
          >
            Retry Camera Access
          </Button>
        </Box>
      ) : currentStream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isRemote ? false : true} // Always mute local video to prevent echo
            style={{
              width: '100%',
              height: '100%',
              objectFit: !isRemote ? "contain" : "cover" ,
              position: 'relative',
              zIndex: 1,
            }}
          />
          
          {/* Camera disabled overlay */}
          {!isVideoEnabled && !isRemote && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <VideocamOff sx={{ fontSize: 60, color: '#666' }} />
            </Box>
          )}
          
          {renderWaves()}
          
          {/* Control buttons for local camera */}
          {!isRemote && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                zIndex: 10,
              }}
            >
              {/* Video toggle */}
              <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                <IconButton
                  onClick={toggleVideo}
                  sx={{
                    backgroundColor: isVideoEnabled ? 'rgba(5 ,215, 255,0.4)' : 'rgba(255, 68, 68, 0.2)',
                    color: isVideoEnabled ? 'rgb(5, 215, 255)' : '#ff4444',
                    '&:hover': {
                      backgroundColor: isVideoEnabled ? 'rgba(5 ,215, 255,0.6)' : 'rgba(255, 68, 68, 0.3)',
                    },
                  }}
                >
                  {isVideoEnabled ? <Videocam /> : <VideocamOff />}
                </IconButton>
              </Tooltip>
              
              {/* Audio toggle */}
              <Tooltip title={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
                <IconButton
                  onClick={toggleAudio}
                  sx={{
                    backgroundColor: !isMuted ? 'rgba(5 ,215, 255,0.4)' : 'rgba(255, 68, 68, 0.2)',
                    color: !isMuted ? 'rgb(5, 215, 255)' : '#ff4444',
                    '&:hover': {
                      backgroundColor: !isMuted ? 'rgba(5 ,215 ,255,0.6)' : 'rgba(255, 68, 68, 0.3)',
                    },
                  }}
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666'
        }}>
          <Typography variant="body2">
            {isRemote ? 'Waiting for AI Doctor...' : 'No camera stream'}
          </Typography>
        </Box>
      )}

      {/* CSS for wave animation */}
      <style jsx>{`
        @keyframes waveAnim {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
    </Box>
  );
};

export default VideoCall;
