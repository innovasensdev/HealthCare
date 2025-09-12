import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  Settings,
  HighQuality,
  Speed,
} from '@mui/icons-material';

const CameraControls = ({ settings, onSettingsChange }) => {
  const handleToggle = (setting) => {
    onSettingsChange({ [setting]: !settings[setting] });
  };

  const handleSliderChange = (setting) => (event, newValue) => {
    onSettingsChange({ [setting]: newValue });
  };

  const handleSelectChange = (setting) => (event) => {
    onSettingsChange({ [setting]: event.target.value });
  };

  const resolutionOptions = [
    { value: '480p', label: '480p (640x480)' },
    { value: '720p', label: '720p (1280x720)' },
    { value: '1080p', label: '1080p (1920x1080)' },
  ];

  const frameRateOptions = [
    { value: 15, label: '15 FPS' },
    { value: 30, label: '30 FPS' },
    { value: 60, label: '60 FPS' },
  ];

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Settings sx={{ mr: 1 }} />
          <Typography variant="h6">Camera Controls</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Basic Controls */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Controls
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Switch
                checked={settings.videoEnabled}
                onChange={() => handleToggle('videoEnabled')}
                color="primary"
              />
              <Box sx={{ ml: 1 }}>
                {settings.videoEnabled ? <Videocam color="primary" /> : <VideocamOff />}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Video {settings.videoEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Switch
                checked={settings.audioEnabled}
                onChange={() => handleToggle('audioEnabled')}
                color="primary"
              />
              <Box sx={{ ml: 1 }}>
                {settings.audioEnabled ? <Mic color="primary" /> : <MicOff />}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Audio {settings.audioEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quality Settings */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Quality Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Resolution</InputLabel>
              <Select
                value={settings.resolution}
                label="Resolution"
                onChange={handleSelectChange('resolution')}
              >
                {resolutionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Frame Rate</InputLabel>
              <Select
                value={settings.frameRate}
                label="Frame Rate"
                onChange={handleSelectChange('frameRate')}
              >
                {frameRateOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Video Effects
            </Typography>
          </Grid>

          {/* Video Effects */}
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Brightness</Typography>
            <Slider
              value={settings.brightness}
              onChange={handleSliderChange('brightness')}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Contrast</Typography>
            <Slider
              value={settings.contrast}
              onChange={handleSliderChange('contrast')}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Saturation</Typography>
            <Slider
              value={settings.saturation}
              onChange={handleSliderChange('saturation')}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Grid>

          {/* Status Display */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<HighQuality />}
                label={`${settings.resolution.toUpperCase()}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<Speed />}
                label={`${settings.frameRate} FPS`}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={`Brightness: ${settings.brightness}%`}
                variant="outlined"
              />
              <Chip
                label={`Contrast: ${settings.contrast}%`}
                variant="outlined"
              />
              <Chip
                label={`Saturation: ${settings.saturation}%`}
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CameraControls;
