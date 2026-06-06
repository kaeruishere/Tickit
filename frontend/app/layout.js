'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme/theme';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <title>Tickit</title>
        <link rel="icon" href="/favicon_io/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Toaster position="top-right" toastOptions={{
            style: { borderRadius: 12, fontFamily: 'Roboto, sans-serif', fontSize: 14 },
          }} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
