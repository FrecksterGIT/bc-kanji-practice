import { FC, useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { App } from '../../App.tsx';
import { Items } from '../pages/Items.tsx';
import { Settings } from '../pages/Settings.tsx';
import { useSession } from '../../hooks/useSession.ts';
import { useWanikani } from '../../hooks/useWanikani.ts';

export const ApplicationRouter: FC = () => {
  const { loading: sessionLoading, isLoggedIn } = useSession();
  const { loading: wanikaniLoading, loadedCount } = useWanikani();
  const loading = sessionLoading || wanikaniLoading;

  const routerConfig = useMemo(
    () =>
      createBrowserRouter(
        isLoggedIn
          ? [
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
                    element: <Items section="kanji" />,
                  },
                  {
                    path: 'vocabulary',
                    element: <Items section="vocabulary" />,
                  },
                  {
                    path: 'marked',
                    element: <Items section="marked" />,
                  },
                  {
                    path: 'settings',
                    element: <Settings />,
                  },
                ],
              },
            ]
          : [
              {
                path: '/',
                element: <App />,
                children: [
                  {
                    path: 'settings',
                    element: <Settings />,
                  },
                  {
                    path: '*',
                    element: <Navigate to="/settings" replace />,
                  },
                ],
              },
            ]
      ),
    [isLoggedIn]
  );

  if (loading)
    return (
      <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
        <div className="container mx-auto flex flex-grow items-center justify-center">
          <div className="text-xl">Updating data... ({loadedCount} resources loaded)</div>
        </div>
      </div>
    );
  return <RouterProvider router={routerConfig} />;
};
