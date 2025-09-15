import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { 
  MonitorHeart, 
  Psychology, 
  Air, 
  LocalHospital, 
  AccessibilityNew, 
  Visibility, 
  Hearing, 
  Bloodtype 
} from '@mui/icons-material';

const DiseasesGrid = () => {
  const items1 = [
    { id: 'cardiology', label: 'Cardiology', icon: MonitorHeart, color: '#ff6b6b' },
    { id: 'neurology', label: 'Neurology', icon: Psychology, color: '#4ecdc4' },
    { id: 'pulmonology', label: 'Pulmonology', icon: Air, color: '#45b7d1' },
    { id: 'oncology', label: 'Oncology', icon: LocalHospital, color: '#f9ca24' },
    { id: 'orthopedics', label: 'Orthopedics', icon: AccessibilityNew, color: '#6c5ce7' },
    { id: 'ophthalmology', label: 'Ophthalmology', icon: Visibility, color: '#a29bfe' },
    { id: 'otolaryngology', label: 'Otolaryngology', icon: Hearing, color: '#fd79a8' },
    { id: 'hematology', label: 'Hematology', icon: Bloodtype, color: '#e17055' }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ color: '#00f0ff', mb: 3, textAlign: 'center' }}>
        Medical Specialties
      </Typography>
      <Grid container spacing={2}>
        {items1.map((item) => {
          const IconComponent = item.icon;
          return (
            <Grid item xs={6} sm={4} md={3} key={item.id}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #1a0b2e, #0B0A1A)',
                  border: '1px solid rgba(0,240,255,0.3)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,240,255,0.3)',
                    border: '1px solid rgba(0,240,255,0.6)',
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <IconComponent 
                    sx={{ 
                      fontSize: 40, 
                      color: item.color, 
                      mb: 1,
                      filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.5))'
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#ffffff', 
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    {item.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DiseasesGrid;
