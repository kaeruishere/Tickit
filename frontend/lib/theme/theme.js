'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6750A4', contrastText: '#FFFFFF' },
    secondary: { main: '#625B71', contrastText: '#FFFFFF' },
    error: { main: '#B3261E' },
    background: { default: '#FFFBFE', paper: '#FFFFFF' },
    surface: '#FFFBFE',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h4: { fontWeight: 400 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 50, textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,0.2)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', border: '1px solid #E6E0E9' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&.Mui-focused fieldset': { borderColor: '#6750A4' },
          },
          '& label.Mui-focused': { color: '#6750A4' },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } },
    },
  },
});

export default theme;
