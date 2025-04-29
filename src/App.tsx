import { Outlet } from 'react-router-dom';
import Navigation from './components/navigation/Navigation.tsx';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
      <Navigation />
      <div className="flex-grow container mx-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
