import React from 'react';
import Layout from './components/layout/Layout';
import ThemeProvider from './context/ThemeContext';
import { PointsProvider } from './context/PointsContext';
import { ChatProvider } from './context/ChatContext';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <PointsProvider>
        <ChatProvider>
          <Layout />
        </ChatProvider>
      </PointsProvider>
    </ThemeProvider>
  );
}

export default App;
