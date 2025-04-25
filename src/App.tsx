import { Outlet } from 'react-router-dom';
import Navigation from './components/navigation/Navigation.tsx';
import { useSession } from './hooks/useSession.ts';
import { SessionProvider } from './contexts/SessionProvider.tsx';

const AppContent = () => {
  const { loading } = useSession();

  if (loading) {
    return (
      <div className="flex-grow container mx-auto flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="flex-grow container mx-auto">
        <Outlet />
      </div>
    </>
  );
};

function App() {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
        <AppContent />
      </div>
    </SessionProvider>
  );
}

export default App;
