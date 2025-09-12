import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Paper, Typography, Box, Tabs, Tab } from '@mui/material';
import VideoCall from './components/VideoCall';
import CameraControls from './components/CameraControls';
import AdvancedCameraControls from './components/AdvancedCameraControls';
import CameraPresets from './components/CameraPresets';
import ConnectionStatus from './components/ConnectionStatus';
import { PipecatService } from './services/pipecatService';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
  },
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [cameraSettings, setCameraSettings] = useState({
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
  });
  const [error, setError] = useState(null);
  const pipecatService = useRef(new PipecatService());

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await pipecatService.current.connect();
      setIsConnected(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    pipecatService.current.disconnect();
    setIsConnected(false);
  };

  const handleCameraSettingsChange = (newSettings) => {
    setCameraSettings(prev => ({ ...prev, ...newSettings }));
    // Apply camera settings to the video element
    pipecatService.current.updateCameraSettings(newSettings);
  };

  const handlePresetApply = (presetSettings) => {
    setCameraSettings(prev => ({ ...prev, ...presetSettings }));
    pipecatService.current.updateCameraSettings(presetSettings);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    return () => {
      pipecatService.current.disconnect();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Pipecat React Frontend
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ConnectionStatus 
              isConnected={isConnected}
              isConnecting={isConnecting}
              error={error}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
            
            {isConnected && (
              <>
                <VideoCall 
                  cameraSettings={cameraSettings}
                  pipecatService={pipecatService.current}
                />
                
                <CameraPresets onApplyPreset={handlePresetApply} />
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="camera controls tabs">
                    <Tab label="Basic Controls" />
                    <Tab label="Advanced Controls" />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  <CameraControls 
                    settings={cameraSettings}
                    onSettingsChange={handleCameraSettingsChange}
                  />
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <AdvancedCameraControls 
                    settings={cameraSettings}
                    onSettingsChange={handleCameraSettingsChange}
                  />
                </TabPanel>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
