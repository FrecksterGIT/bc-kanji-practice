import { Outlet } from 'react-router-dom';
import Navigation from './components/navigation/Navigation.tsx';
import ItemProvider from './contexts/ItemProvider.tsx';
import { AudioPlayerProvider } from 'react-use-audio-player';

function App() {
  return (
    <ItemProvider>
      <AudioPlayerProvider>
        <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
          <Navigation />
          <div className="container mx-auto flex-grow">
            <Outlet />
          </div>
        </div>
      </AudioPlayerProvider>
    </ItemProvider>
  );
}

export default App;
