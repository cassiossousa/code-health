import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#0f766e' },
    background: { default: '#f0f7f6', paper: '#ffffff' },
    text: { primary: '#173b39' },
    divider: '#d3e3e1',
    warning: { main: '#ffe08a' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontSize: '36px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '30px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '0',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          padding: '24px',
        },
      },
    },
  },
});
