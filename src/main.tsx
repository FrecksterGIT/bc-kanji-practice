import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { SessionProvider } from './contexts/SessionProvider.tsx';
import { ApplicationRouter } from './components/router/ApplicationRouter.tsx';
import { WanikaniProvider } from './contexts/WanikaniProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
      <SessionProvider>
        <WanikaniProvider>
          <ApplicationRouter />
        </WanikaniProvider>
      </SessionProvider>
    </div>
  </StrictMode>
);
