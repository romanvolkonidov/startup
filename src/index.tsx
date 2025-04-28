import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { JobProvider } from './context/JobContext';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <AuthProvider>
    <NotificationProvider>
      <JobProvider>
        <App />
      </JobProvider>
    </NotificationProvider>
  </AuthProvider>
);
