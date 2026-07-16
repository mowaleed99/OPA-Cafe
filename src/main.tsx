import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installWebElectronBridge } from './infrastructure/api/webElectronBridge';
import App from './App.tsx';
import './index.css';
import './application/i18n/i18n';

installWebElectronBridge();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
