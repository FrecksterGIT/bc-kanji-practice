import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from '../../App.tsx';
import KanjiLevel from '../sections/KanjiLevel.tsx';
import VocabularyLevel from '../sections/VocabularyLevel.tsx';
import MarkedItems from '../sections/MarkedItems.tsx';
import Settings from '../settings/Settings.tsx';
import { FC } from 'react';
import useSession from '../../hooks/useSession.ts';
import { WanikaniProvider } from '../../contexts/WanikaniProvider.tsx';

const routerLoggedOut = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Navigate to="settings" replace />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

const routerLoggedIn = createBrowserRouter([
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

export const ApplicationRouter: FC = () => {
  const { loading, isLoggedIn } = useSession();

  if (loading)
    return (
      <div className="flex-grow container mx-auto flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    );
  if (!isLoggedIn) return <RouterProvider router={routerLoggedOut} />;
  return (
    <WanikaniProvider>
      <RouterProvider router={routerLoggedIn} />
    </WanikaniProvider>
  );
};
