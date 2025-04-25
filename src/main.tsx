import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import KanjiPage from './components/kanji/KanjiPage.tsx';
import VocabularyPage from './components/vocabulary/VocabularyPage.tsx';
import Settings from './components/settings/Settings.tsx';

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
        element: <KanjiPage />,
      },
      {
        path: 'vocabulary',
        element: <VocabularyPage />,
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
