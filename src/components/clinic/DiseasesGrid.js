import React from 'react';
import { Box, Typography } from '@mui/material';
import { Favorite, Psychology, Air, LocalHospital, AccessibilityNew, Visibility, Hearing, Bloodtype } from '@mui/icons-material';
import Brain from "../../assest/brain2.svg"
import Lung from "../../assest/lung.svg"

const items1 = [
  { label: 'Neurology', icon: <img src={Brain} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  { label: 'Pulmonology', icon: <img src={Lung} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  { label: 'Neurology', icon: <img src={Brain} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  { label: 'Neurology', icon: <img src={Brain} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  { label: 'Pulmonology', icon: <img src={Lung} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  { label: 'Neurology', icon: <img src={Brain} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  { label: 'Pulmonology', icon: <img src={Lung} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  { label: 'Neurology', icon: <img src={Brain} alt="Neurology" style={{ width: 80, height: 80 }} /> },
  
];
const items = [
  { label: 'Neurology', icon: <Brain sx={{ fontSize: 100 }} /> },
  { label: 'Cardiology', icon: <Favorite sx={{ fontSize: 100 }}/> },
  { label: 'Pulmonology', icon: <Air sx={{ fontSize: 100 }}/> },
  { label: 'General', icon: <LocalHospital sx={{ fontSize: 100 }}/> },
  { label: 'Orthopedics', icon: <AccessibilityNew sx={{ fontSize: 100 }}/> },
  { label: 'Ophthalmology', icon: <Visibility sx={{ fontSize: 100 }}/> },
  { label: 'ENT', icon: <Hearing sx={{ fontSize: 100 }}/> },
  { label: 'Hematology', icon: <Bloodtype sx={{ fontSize: 100 }}/> },
];

export default function DiseasesGrid({ onSelect }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        rowGap: 6,
        columnGap:3
        // justifyContent: "center",
      }}
    >
      {items1.map((it) => (
        <Box
          key={it.label}
          sx={{
            position: "relative",
            flex: "0 1 calc(33.33% - 16px)", // 3 cards per row
            display: "flex",
            justifyContent: "center",
           
          }}
        >
          {/* Top moving neon line */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              width: "60px",
              height: "3px",
              margin: "0 auto",
              background: "#0a0f1f",
              // boxShadow: "0 0 10px #00f0ff, 0 0 20px #00c4ff",
              borderRadius: "2px",
              animation: "moveLine 2s linear infinite",
              zIndex: 2,
            }}
          />

          {/* Neon card */}
          <Box
            onClick={() => onSelect?.(it.label)}
            sx={{
              width: "max-content",
              height: "max-content",
              background: "#0a0f1f",
              borderRadius: "25px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #07f0ff",
              color: "#00f0ff",
              fontFamily: "Segoe UI, sans-serif",
              textAlign: "center",
              overflow: "hidden",
              zIndex: 0,
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 196, 255, 0.2)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
              
                boxShadow: "0 0 15px #0a0f1f, 0 0 50px #0a0f1f",
              },
            }}
          >
            <Box sx={{ color: "#00F0FF", mb: 1, p: 3, pb: 0, pt: 1 }}>{it.icon}</Box>
            <Typography
              variant="caption"
              sx={{
                background: "#004966",
                borderTop: "1px solid #004966",
                width: "100%",
                p: "6px",
                fontSize: "12px",
                color: "#bffcff",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              {it.label}
            </Typography>
          </Box>

          {/* Bottom moving neon line */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              width: "60px",
              height: "3px",
              margin: "0 auto",
              background: "#0a0f1f",
              // boxShadow: "0 0 10px #00f0ff, 0 0 20px #00c4ff",
              borderRadius: "2px",
              animation: "moveLine 2s linear infinite",
              zIndex: 2,
            }}
          />
        </Box>
      ))}

    
    </Box>
  );
}
