import { FC, useContext } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from '../../App.tsx';
import Items from '../sections/Items.tsx';
import Settings from '../settings/Settings.tsx';
import useSession from '../../hooks/useSession.ts';
import { WanikaniContext } from '../../contexts/WanikaniContext.ts';

const routerLoggedOut = createBrowserRouter([
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
        element: <Items />,
      },
      {
        path: 'vocabulary',
        element: <Items />,
      },
      {
        path: 'marked',
        element: <Items />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

export const ApplicationRouter: FC = () => {
  const { loading: sessionLoading, isLoggedIn } = useSession();
  const { loading: wanikaniLoading } = useContext(WanikaniContext);
  const loading = sessionLoading || wanikaniLoading;

  if (loading)
    return (
      <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
        <div className="flex-grow container mx-auto flex items-center justify-center">
          <div className="text-xl">Loading user data...</div>
        </div>
      </div>
    );
  return <RouterProvider router={isLoggedIn ? routerLoggedIn : routerLoggedOut} />;
};
