import {ChangeEvent, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useWanikaniUser } from '../hooks/useWanikaniUser';
import { useSettingsStore } from '../store/settingsStore';

function Navigation() {
  const { user } = useWanikaniUser();
  const { level, setLevel } = useSettingsStore();

  // Determine max level based on user data or default to 3 if no API key
  const maxLevel = user?.level ?? 3;

  // Generate options for the dropdown
  const levelOptions = Array.from({ length: maxLevel }, (_, i) => i + 1);

  // Handle level change
  const handleLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLevel = parseInt(e.target.value, 10);
    if (!isNaN(newLevel) && newLevel > 0) {
      setLevel(newLevel);
    }
  };

  // Ensure level is within valid range
  useEffect(() => {
    if (level > maxLevel) {
      setLevel(maxLevel);
    }
  }, [maxLevel, level, setLevel]);

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl font-bold">Kanji Practice</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/kanji" className="px-3 py-2 rounded hover:bg-blue-700 transition-colors">
            Kanji
          </Link>
          <Link to="/vocabulary" className="px-3 py-2 rounded hover:bg-blue-700 transition-colors">
            Vocabulary
          </Link>
          <div className="flex items-center space-x-2">
            <label htmlFor="level-select" className="text-sm">Level:</label>
            <select
              id="level-select"
              value={level}
              onChange={handleLevelChange}
              className="bg-blue-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {levelOptions.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          <Link to="/settings" className="px-3 py-2 rounded hover:bg-blue-700 transition-colors">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
