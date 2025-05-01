import { type ChangeEventHandler, type FC, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore.ts';
import useSession from '../../hooks/useSession.ts';
import useMarkedItems from '../../hooks/useMarkedItems.ts';

const Navigation: FC = () => {
  const { user, maxLevel, isLoggedIn } = useSession();
  const { level, setLevel } = useSettingsStore();
  const { markedItems } = useMarkedItems();
  const levelOptions = useMemo(() => Array.from({ length: maxLevel }, (_, i) => i + 1), [maxLevel]);

  const handleLevelChange: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
      const newLevel = parseInt(e.target.value, 10);
      if (!isNaN(newLevel) && newLevel > 0) {
        setLevel(newLevel);
      }
    },
    [setLevel]
  );

  return (
    <nav className="sticky top-0 z-10 bg-gray-700 text-white p-4 shadow-2xl">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-xl font-bold">Kanji Practice</span>
          <span className="text-sm">v{__APP_VERSION__}</span>
        </div>
        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              <NavLink
                to="kanji"
                className={({ isActive }) =>
                  `px-3 py-2 rounded hover:bg-pink-500 ${isActive ? 'bg-pink-500' : ''}`
                }
              >
                Kanji
              </NavLink>
              <NavLink
                to="vocabulary"
                className={({ isActive }) =>
                  `px-3 py-2 rounded hover:bg-purple-500 ${isActive ? 'bg-purple-500' : ''}`
                }
              >
                Vocabulary
              </NavLink>
              <div className="flex items-center space-x-2">
                <label htmlFor="level-select" className="text-sm">
                  Level:
                </label>
                <select
                  id="level-select"
                  value={level}
                  onChange={handleLevelChange}
                  className="bg-gray-800 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {levelOptions.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              <NavLink
                to="marked"
                className={({ isActive }) =>
                  `px-3 py-2 rounded hover:bg-gradient-to-br from-pink-500 to-purple-500 ${isActive ? 'bg-gradient-to-br' : ''}`
                }
              >
                Marked Items <span className="text-xs">({markedItems.length})</span>
              </NavLink>
            </>
          )}
          <NavLink
            to="settings"
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-gray-600 transition-colors ${isActive ? 'bg-gray-600' : ''}`
            }
          >
            {user?.username ?? 'Settings'}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
