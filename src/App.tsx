import { Outlet } from 'react-router';
import { Navigation } from './components/navigation/Navigation.tsx';
import { ItemProvider } from './contexts/ItemProvider.tsx';
import { AudioPlayerProvider } from 'react-use-audio-player';

export const App = () => (
  <ItemProvider>
    <AudioPlayerProvider>
      <Navigation />
      <div className="container mx-auto flex-grow">
        <Outlet />
      </div>
    </AudioPlayerProvider>
  </ItemProvider>
);
