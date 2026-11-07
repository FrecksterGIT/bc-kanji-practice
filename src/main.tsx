import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/noto-sans-jp";
import "./index.css";

import { SessionProvider } from "./contexts/SessionProvider.tsx";
import { ApplicationRouter } from "./components/router/ApplicationRouter.tsx";
import { WanikaniProvider } from "./contexts/WanikaniProvider.tsx";
import { LoadingScreen } from "./components/shared/LoadingScreen.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
      <Suspense fallback={<LoadingScreen />}>
        <SessionProvider>
          <WanikaniProvider>
            <ApplicationRouter />
          </WanikaniProvider>
        </SessionProvider>
      </Suspense>
    </div>
  </StrictMode>,
);
