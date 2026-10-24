import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

if (window.location.pathname === '/') {
  document.documentElement.classList.add('clinic-home-pending');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
