import React, { useRef, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Paper,
  CircularProgress,
  Tooltip,
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

const VideoCall = ({ cameraSettings, pipecatService }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(cameraSettings.showGrid);

  useEffect(() => {
    const initializeVideo = async () => {
      try {
        setIsLoading(true);
        
        // Get user media with camera settings
        const constraints = {
          video: {
            enabled: cameraSettings.videoEnabled,
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
          
          // Apply video effects
          applyVideoEffects(stream, cameraSettings);
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

  useEffect(() => {
    setShowGrid(cameraSettings.showGrid);
  }, [cameraSettings.showGrid]);

  const getResolutionWidth = (resolution) => {
    switch (resolution) {
      case '480p': return 640;
      case '720p': return 1280;
      case '1080p': return 1920;
      case '4k': return 3840;
      default: return 1280;
    }
  };

  const getResolutionHeight = (resolution) => {
    switch (resolution) {
      case '480p': return 480;
      case '720p': return 720;
      case '1080p': return 1080;
      case '4k': return 2160;
      default: return 720;
    }
  };

  const applyVideoEffects = (stream, settings) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Build CSS filter string
      let filters = [];
      
      if (settings.brightness !== 50) {
        filters.push(`brightness(${settings.brightness}%)`);
      }
      if (settings.contrast !== 50) {
        filters.push(`contrast(${settings.contrast}%)`);
      }
      if (settings.saturation !== 50) {
        filters.push(`saturate(${settings.saturation}%)`);
      }
      if (settings.blur > 0) {
        filters.push(`blur(${settings.blur}px)`);
      }
      if (settings.exposure !== 0) {
        filters.push(`brightness(${100 + settings.exposure}%)`);
      }
      if (settings.hue !== 0) {
        filters.push(`hue-rotate(${settings.hue}deg)`);
      }
      if (settings.sepia > 0) {
        filters.push(`sepia(${settings.sepia}%)`);
      }
      if (settings.invert) {
        filters.push('invert(1)');
      }
      if (settings.grayscale) {
        filters.push('grayscale(1)');
      }

      videoElement.style.filter = filters.join(' ');
      
      // Apply horizontal flip
      if (settings.flipHorizontal) {
        videoElement.style.transform = 'scaleX(-1)';
      } else {
        videoElement.style.transform = 'scaleX(1)';
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const endCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    pipecatService.disconnect();
  };

  const renderGrid = () => {
    if (!showGrid) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '33.33% 33.33%',
        }}
      />
    );
  };

  const renderBackgroundImage = () => {
    if (!cameraSettings.backgroundImage) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${cameraSettings.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: -1,
        }}
      />
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Video Call
        </Typography>
        
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Paper
            elevation={8}
            sx={{
              position: 'relative',
              width: '100%',
              height: '400px',
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Initializing camera...
                </Typography>
              </Box>
            ) : (
              <>
                {renderBackgroundImage()}
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
                {renderGrid()}
              </>
            )}
            
            {/* Video Controls Overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                gap: 1,
                zIndex: 2,
              }}
            >
              <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                <IconButton
                  onClick={toggleMute}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  {isMuted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={showGrid ? 'Hide Grid' : 'Show Grid'}>
                <IconButton
                  onClick={toggleGrid}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  {showGrid ? <GridOn /> : <GridOff />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Bottom Controls */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
                zIndex: 2,
              }}
            >
              <Tooltip title="End Call">
                <IconButton
                  onClick={endCall}
                  sx={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    '&:hover': { backgroundColor: '#d32f2f' },
                  }}
                >
                  <CallEnd />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Box>

        {/* Video Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Resolution: {cameraSettings.resolution.toUpperCase()} | 
            Frame Rate: {cameraSettings.frameRate} FPS
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {cameraSettings.videoEnabled ? 'Video On' : 'Video Off'} | 
              {cameraSettings.audioEnabled ? 'Audio On' : 'Audio Off'}
            </Typography>
            {cameraSettings.flipHorizontal && (
              <Typography variant="body2" color="primary">
                <FlipCameraIos sx={{ fontSize: 16, mr: 0.5 }} />
                Flipped
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoCall;
