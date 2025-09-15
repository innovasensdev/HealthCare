import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  IconButton,
  Chip,
  Avatar,
  Stack
} from '@mui/material';
import {
  Home,
  LocalHospital,
  // EmergencyRecordingIcon,
  Person,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  CheckCircle,
  MedicalServices
} from '@mui/icons-material';
import LeakAddIcon from '@mui/icons-material/LeakAdd';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const ServiceCard = ({ icon, title, subtitle, description, onClick, color = '#00F0FF' }) => (
  <Card
    sx={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: `1px solid ${color}`,
      borderRadius: 1,
     
      cursor: 'pointer',
      transition: 'all 0.3s ease', // smooth transition for all properties
      '&:hover': {
        transform: 'scale(1.05) translateY(-2px)', // scale + move up
        boxShadow: `0 8px 25px ${color}40`,
        border: `2px solid ${color}`,
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ }}>
      <Box sx={{ display: 'flex', alignItems: 'center',flexDirection:"column",}}>
        <Avatar
          sx={{
            backgroundColor: `${color}20`,
            color: color,
         
            width: 40,
            height: 40
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography  sx={{ color: color, fontWeight: 600, fontSize: '14px',mt:1 ,whiteSpace: 'pre-line' }} >
          {title.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ))}
          </Typography>
          {/* {subtitle && (
            <Typography variant="body2" sx={{ color: '#fff', fontSize: '12px' }}>
              {subtitle}
            </Typography>
          )} */}
        </Box>
      </Box>
      {description && (
        <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.85rem' }}>
          {description}
        </Typography>
      )}
    </CardContent>
  </Card>
);



export default function RightAnalytics() {
  const handleServiceClick = (service) => {
    console.log(`Clicked on ${service}`);
    // Add navigation logic here
  };

  return (
    <Box sx={{ 
      display: "grid", 
      flexDirection: "column", 
      p: 2, 
      gap:"20px",
      height: "100%",
      overflow: 'auto',
      gridTemplateColumns: 'repeat(3, 1fr)'
    }}>
     

      {/* Home Healthcare */}
      <ServiceCard
        icon={<Home />}
        title="View Your Medical Profile"
        subtitle=""
       
        onClick={() => handleServiceClick('Healthcare')}
        color="#05d7ff"
      />

      {/* Emergency Check-in */}
      <ServiceCard
        icon={<MedicalServicesIcon />}
        title="Emergency Check-in"
        subtitle="Check-in"
       
        onClick={() => handleServiceClick('Emergency Check-in')}
       color="#05d7ff"
      />
 {/* Emergency Check-in */}
 <ServiceCard
        icon={<LeakAddIcon />}
        title={"Connect\nwith Us"} // works now
        subtitle="connect"
       
         onClick={() => handleServiceClick('Connect with Us')}
       color="#05d7ff"
      />

{/* <ServiceCard
        icon={<LocalHospital />}
        title="View Your Medical Profile"
        subtitle="Medical Profile "
       
         onClick={() => handleServiceClick('"Medical Profile')}
        color="#7C4DFF"
      /> */}

    </Box>
  );
}
