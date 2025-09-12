import React, { useState, useRef } from 'react';
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
  Button,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  Settings,
  HighQuality,
  Speed,
  FilterVintage,
  BlurOn,
  Exposure,
  ColorLens,
  CameraAlt,
  FlipCameraIos,
  GridOn,
  GridOff,
} from '@mui/icons-material';

const AdvancedCameraControls = ({ settings, onSettingsChange }) => {
  const [expanded, setExpanded] = useState('basic');
  const fileInputRef = useRef(null);

  const handleToggle = (setting) => {
    onSettingsChange({ [setting]: !settings[setting] });
  };

  const handleSliderChange = (setting) => (event, newValue) => {
    onSettingsChange({ [setting]: newValue });
  };

  const handleSelectChange = (setting) => (event) => {
    onSettingsChange({ [setting]: event.target.value });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Handle background image upload
      const reader = new FileReader();
      reader.onload = (e) => {
        onSettingsChange({ backgroundImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefaults = () => {
    onSettingsChange({
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
  };

  const resolutionOptions = [
    { value: '480p', label: '480p (640x480)' },
    { value: '720p', label: '720p (1280x720)' },
    { value: '1080p', label: '1080p (1920x1080)' },
    { value: '4k', label: '4K (3840x2160)' },
  ];

  const frameRateOptions = [
    { value: 15, label: '15 FPS' },
    { value: 24, label: '24 FPS' },
    { value: 30, label: '30 FPS' },
    { value: 60, label: '60 FPS' },
  ];

  const ControlSection = ({ title, icon, children, sectionKey }) => (
    <Accordion 
      expanded={expanded === sectionKey} 
      onChange={() => setExpanded(expanded === sectionKey ? false : sectionKey)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            <Typography variant="h6">Advanced Camera Controls</Typography>
          </Box>
          <Button variant="outlined" onClick={resetToDefaults} size="small">
            Reset to Defaults
          </Button>
        </Box>

        <ControlSection 
          title="Basic Controls" 
          icon={<CameraAlt />} 
          sectionKey="basic"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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
          </Grid>
        </ControlSection>

        <ControlSection 
          title="Video Effects" 
          icon={<FilterVintage />} 
          sectionKey="effects"
        >
          <Grid container spacing={3}>
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

            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Blur</Typography>
              <Slider
                value={settings.blur || 0}
                onChange={handleSliderChange('blur')}
                min={0}
                max={10}
                step={0.1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Exposure</Typography>
              <Slider
                value={settings.exposure || 0}
                onChange={handleSliderChange('exposure')}
                min={-100}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Hue</Typography>
              <Slider
                value={settings.hue || 0}
                onChange={handleSliderChange('hue')}
                min={-180}
                max={180}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}°`}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Sepia</Typography>
              <Slider
                value={settings.sepia || 0}
                onChange={handleSliderChange('sepia')}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Grid>
          </Grid>
        </ControlSection>

        <ControlSection 
          title="Advanced Options" 
          icon={<BlurOn />} 
          sectionKey="advanced"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Switch
                  checked={settings.invert || false}
                  onChange={() => handleToggle('invert')}
                  color="primary"
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Invert Colors
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Switch
                  checked={settings.grayscale || false}
                  onChange={() => handleToggle('grayscale')}
                  color="primary"
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Grayscale
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Switch
                  checked={settings.flipHorizontal || false}
                  onChange={() => handleToggle('flipHorizontal')}
                  color="primary"
                />
                <Box sx={{ ml: 1 }}>
                  <FlipCameraIos />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Flip Horizontal
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Switch
                  checked={settings.showGrid || false}
                  onChange={() => handleToggle('showGrid')}
                  color="primary"
                />
                <Box sx={{ ml: 1 }}>
                  {settings.showGrid ? <GridOn /> : <GridOff />}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Show Grid
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Background Image
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<CameraAlt />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Background
              </Button>
              
              {settings.backgroundImage && (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={settings.backgroundImage}
                    alt="Background"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                    }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onSettingsChange({ backgroundImage: null })}
                    sx={{ mt: 1 }}
                  >
                    Remove Background
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </ControlSection>

        {/* Status Display */}
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Current Settings
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
            {settings.blur > 0 && (
              <Chip
                label={`Blur: ${settings.blur}px`}
                color="warning"
                variant="outlined"
              />
            )}
            {settings.invert && (
              <Chip
                label="Inverted"
                color="error"
                variant="outlined"
              />
            )}
            {settings.grayscale && (
              <Chip
                label="Grayscale"
                color="default"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdvancedCameraControls;
