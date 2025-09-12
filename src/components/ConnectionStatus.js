import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  PlayArrow,
  Stop,
} from '@mui/icons-material';

const ConnectionStatus = ({ 
  isConnected, 
  isConnecting, 
  error, 
  onConnect, 
  onDisconnect 
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Connection Status</Typography>
            <Chip
              icon={isConnected ? <Wifi /> : <WifiOff />}
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'default'}
              variant={isConnected ? 'filled' : 'outlined'}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isConnected ? (
              <Button
                variant="contained"
                startIcon={isConnecting ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={onConnect}
                disabled={isConnecting}
                sx={{ minWidth: 120 }}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Stop />}
                onClick={onDisconnect}
                color="error"
              >
                Disconnect
              </Button>
            )}
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {isConnected && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Successfully connected to Pipecat bot. You can now start your video call!
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
