import { createTheme } from '@mui/material/styles';

const neonTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00F0FF' },
    secondary: { main: '#7C4DFF' },
    success: { main: '#00E676' },
    error: { main: '#FF1744' },
    warning: { main: '#FFC400' },
    background: { default: '#060B16', paper: 'transparent' },
    text: { primary: '#E8F6FF', secondary: '#8AA4BF' },
  },
  shape: { borderRadius: 16 },
  shadows: Array(25).fill('none'),
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          // background: 'linear-gradient(180deg, rgba(13,20,36,0.85) 0%, rgba(7,11,22,0.85) 100%)',
          border: '1px solid rgba(0,240,255,0.22)',
          boxShadow: '0 0 40px rgba(0,240,255,0.08), inset 0 0 40px rgba(124,77,255,0.06)',
          backdropFilter: 'blur(10px)',
          height:"-webkit-fill-available",
         
        },
      },
    },
  },
});

export default neonTheme;
