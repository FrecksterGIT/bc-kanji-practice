import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { SessionProvider } from './contexts/SessionProvider.tsx';
import { ApplicationRouter } from './components/router/ApplicationRouter.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <ApplicationRouter />
    </SessionProvider>
  </StrictMode>
);
