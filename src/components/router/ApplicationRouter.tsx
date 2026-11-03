import { FC, useMemo } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { App } from "../../App.tsx";
import { Items } from "../pages/Items.tsx";
import { Settings } from "../pages/Settings.tsx";
import { useSession } from "../../hooks/useSession.ts";

export const ApplicationRouter: FC = () => {
  const { isLoggedIn } = useSession();

  const routerConfig = useMemo(
    () =>
      createBrowserRouter(
        isLoggedIn
          ? [
              {
                path: "/",
                element: <App />,
                children: [
                  {
                    path: "",
                    element: <Navigate to="kanji" replace />,
                  },
                  {
                    path: "kanji",
                    element: <Items section="kanji" />,
                  },
                  {
                    path: "vocabulary",
                    element: <Items section="vocabulary" />,
                  },
                  {
                    path: "marked",
                    element: <Items section="marked" />,
                  },
                  {
                    path: "settings",
                    element: <Settings />,
                  },
                ],
              },
            ]
          : [
              {
                path: "/",
                element: <App />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="settings" replace />,
                  },
                  {
                    path: "settings",
                    element: <Settings />,
                  },
                  {
                    path: "*",
                    element: <Navigate to="/settings" replace />,
                  },
                ],
              },
            ],
      ),
    [isLoggedIn],
  );

  return <RouterProvider router={routerConfig} />;
};
