import React from 'react';
import MainDashboard from './components/MainDashboard';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainDashboard />
    </ThemeProvider>
  );
};

export default App;