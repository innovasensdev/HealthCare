import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  WbSunny,
  Nightlight,
  FilterVintage,
  BlurOn,
  ColorLens,
  CameraAlt,
} from '@mui/icons-material';

const CameraPresets = ({ onApplyPreset }) => {
  const presets = [
    {
      name: 'Natural',
      icon: <CameraAlt />,
      description: 'Balanced settings for natural look',
      settings: {
        brightness: 50,
        contrast: 50,
        saturation: 50,
        blur: 0,
        exposure: 0,
        hue: 0,
        sepia: 0,
        invert: false,
        grayscale: false,
      },
      color: 'primary',
    },
    {
      name: 'Bright',
      icon: <WbSunny />,
      description: 'High brightness and contrast',
      settings: {
        brightness: 80,
        contrast: 70,
        saturation: 60,
        blur: 0,
        exposure: 20,
        hue: 0,
        sepia: 0,
        invert: false,
        grayscale: false,
      },
      color: 'warning',
    },
    {
      name: 'Dark',
      icon: <Nightlight />,
      description: 'Low light, moody atmosphere',
      settings: {
        brightness: 30,
        contrast: 40,
        saturation: 30,
        blur: 0,
        exposure: -20,
        hue: 0,
        sepia: 0,
        invert: false,
        grayscale: false,
      },
      color: 'info',
    },
    {
      name: 'Vintage',
      icon: <FilterVintage />,
      description: 'Sepia tone, vintage look',
      settings: {
        brightness: 60,
        contrast: 60,
        saturation: 40,
        blur: 0,
        exposure: 0,
        hue: 30,
        sepia: 80,
        invert: false,
        grayscale: false,
      },
      color: 'secondary',
    },
    {
      name: 'Blur',
      icon: <BlurOn />,
      description: 'Soft focus effect',
      settings: {
        brightness: 50,
        contrast: 50,
        saturation: 50,
        blur: 3,
        exposure: 0,
        hue: 0,
        sepia: 0,
        invert: false,
        grayscale: false,
      },
      color: 'success',
    },
    {
      name: 'Artistic',
      icon: <ColorLens />,
      description: 'High saturation, artistic look',
      settings: {
        brightness: 60,
        contrast: 70,
        saturation: 90,
        blur: 0,
        exposure: 10,
        hue: 15,
        sepia: 0,
        invert: false,
        grayscale: false,
      },
      color: 'error',
    },
    {
      name: 'Monochrome',
      icon: <CameraAlt />,
      description: 'Black and white effect',
      settings: {
        brightness: 50,
        contrast: 60,
        saturation: 0,
        blur: 0,
        exposure: 0,
        hue: 0,
        sepia: 0,
        invert: false,
        grayscale: true,
      },
      color: 'default',
    },
    {
      name: 'Inverted',
      icon: <CameraAlt />,
      description: 'Inverted colors effect',
      settings: {
        brightness: 50,
        contrast: 50,
        saturation: 50,
        blur: 0,
        exposure: 0,
        hue: 0,
        sepia: 0,
        invert: true,
        grayscale: false,
      },
      color: 'error',
    },
  ];

  const handlePresetClick = (preset) => {
    onApplyPreset(preset.settings);
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Camera Presets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Quick apply common camera effect combinations
        </Typography>
        
        <Grid container spacing={2}>
          {presets.map((preset, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={preset.icon}
                onClick={() => handlePresetClick(preset)}
                sx={{
                  height: '100%',
                  flexDirection: 'column',
                  p: 2,
                  textAlign: 'left',
                  alignItems: 'flex-start',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ mr: 1 }}>
                    {preset.name}
                  </Typography>
                  <Chip
                    label={preset.name}
                    size="small"
                    color={preset.color}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {preset.description}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CameraPresets;
