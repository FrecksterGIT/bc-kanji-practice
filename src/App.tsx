import { Outlet } from 'react-router-dom';
import Navigation from './components/navigation/Navigation.tsx';
import ValidationProvider from './contexts/ValidationProvider.tsx';

function App() {
  return (
    <ValidationProvider>
      <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
        <Navigation />
        <div className="flex-grow container mx-auto">
          <Outlet />
        </div>
      </div>
    </ValidationProvider>
  );
}

export default App;
