import { FC } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from '../../App.tsx';
import Items from '../sections/Items.tsx';
import Settings from '../settings/Settings.tsx';
import useSession from '../../hooks/useSession.ts';

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
  const { loading, isLoggedIn } = useSession();

  if (loading)
    return (
      <div className="flex-grow container mx-auto flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    );
  return <RouterProvider router={isLoggedIn ? routerLoggedIn : routerLoggedOut} />;
};
