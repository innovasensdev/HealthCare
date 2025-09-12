import React from 'react';
import { Box, Typography,keyframes } from '@mui/material';
import MetricDial from '../ui/MetricDial';

const pulse = keyframes`
  0% { transform: scaleY(1); }
  25% { transform: scaleY(0.6); }
  50% { transform: scaleY(1.2); }
  75% { transform: scaleY(0.8); }
  100% { transform: scaleY(1); }
`;
function TrendBars() {
  const values = [8, 12, 7, 14, 10, 16, 12, 18, 9, 15, 11, 19, 8, 14, 12];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 0.75,
        height: 120,
        mb: 2,
      }}
    >
      {values.map((v, i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: v * 5,
            borderRadius: 1,
            background: i % 3 === 0 ? "#39FFB6" : "#00F0FF",
            boxShadow: `0 0 12px ${i % 3 === 0 ? "#39FFB6" : "#00F0FF"}`,
            transformOrigin: "bottom",
            animation: `${pulse} ${0.8 + Math.random()}s infinite ease-in-out`,
            animationDelay: `${Math.random()}s`,
          }}
        />
      ))}
    </Box>
  );
}

function VerticalBars() {
  const vals = [70, 40, 85, 55];
  const colors = ['#39FFB6','#00F0FF','#39FFB6','#00F0FF'];
  return (
    <Box sx={{ display:'flex', gap: 1.5, mb: 2 }}>
      {vals.map((v,i)=> (
        <Box key={i} sx={{ width: 18, height: 120, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow:'hidden' }}>
          <Box sx={{ width:'100%', height: `${v}%`, background: colors[i], boxShadow:`0 0 16px ${colors[i]}`, transition:'height .3s ease' }} />
        </Box>
      ))}
    </Box>
  );
}

export default function RightAnalytics() {
  return (
    <Box sx={{display:"flex",alignItems:"center",flexDirection:"column",p:2,height:"-webkit-fill-available"}}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color:'#00F0FF' }}>LOREM IPSUM</Typography>
      <TrendBars />
      {/* <VerticalBars /> */}
      {/* <Box sx={{ display:'flex', gap: 2, mt: 1, flexWrap:'wrap' }}>
        <MetricDial value={70} label="Health" />
        <MetricDial value={45} label="Recovery" color="#39FFB6" />
      </Box> */}
    </Box>
  );
}
