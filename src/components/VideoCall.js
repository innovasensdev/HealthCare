import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
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
} from '@mui/icons-material';

const VideoCall = ({ cameraSettings, pipecatService,sx }) => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(cameraSettings.showGrid);

  // 🔊 speaking detection state
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const initializeVideo = async () => {
      try {
      
        setIsLoading(true);

        const constraints = {
          video: {
            width: getResolutionWidth(cameraSettings.resolution),
            height: getResolutionHeight(cameraSettings.resolution),
            frameRate: cameraSettings.frameRate,
          },
          audio: cameraSettings.audioEnabled,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // ✅ Start audio detection
        if (cameraSettings.audioEnabled) {
          setupAudioAnalyser(stream);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsLoading(false);
      }
    };

    initializeVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [cameraSettings]);

  const setupAudioAnalyser = (stream) => {
    const audioContext = new AudioContext();
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
        // 🎙️ user speaking → keep highlight on
        setIsSpeaking(true);
  
        // reset silence timeout
        if (silenceTimeout) clearTimeout(silenceTimeout);
        silenceTimeout = setTimeout(() => {
          setIsSpeaking(false);
        }, 800); // wait 800ms of silence before turning off
      }
  
      requestAnimationFrame(detectVolume);
    };
  
    detectVolume();
  };
  

  const getResolutionWidth = (res) => {
    switch (res) {
      case '480p': return 640;
      case '720p': return 1280;
      case '1080p': return 1920;
      default: return 1280;
    }
  };
  const getResolutionHeight = (res) => {
    switch (res) {
      case '480p': return 480;
      case '720p': return 720;
      case '1080p': return 1080;
      default: return 720;
    }
  };

  // 🎨 Wave animation
  const renderWaves = () => {
    if (!isSpeaking) return null;
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '90%',
          transform: 'translateX(-90%)',
          display: 'flex',
          gap: "5px",
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
        <style>
          {`
            @keyframes waveAnim {
              0%, 100% { transform: scaleY(0.3); }
              50% { transform: scaleY(1.5); }
            }
          `}
        </style>
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative', height:sx?.height ? sx?.height:"100%",overflow:"hidden",borderRadius:"16px"
      
     }}>
     
        {isLoading ? (
          <Box sx={{ textAlign: 'center',height: 'max-content',justifyContent:"center",display:"flex",flexDirection:"column",alignItems:"center" }}>
            <CircularProgress size={60} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Initializing camera...
            </Typography>
          </Box>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'relative',
                zIndex: 1,
              }}
            />
            {renderWaves()}
          </>
        )}

    </Box>
  );
};

export default VideoCall;
