import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Settings from './components/settings/Settings.tsx';
import KanjiLevel from './components/sections/KanjiLevel.tsx';
import VocabularyLevel from './components/sections/VocabularyLevel.tsx';
import MarkedItems from './components/sections/MarkedItems.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Navigate to="kanji" replace />,
      },
      {
        path: 'kanji',
        element: <KanjiLevel />,
      },
      {
        path: 'vocabulary',
        element: <VocabularyLevel />,
      },
      {
        path: 'marked',
        element: <MarkedItems />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
