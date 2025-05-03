import { type ChangeEventHandler, type FC, useCallback, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore.ts';
import useSession from '../../hooks/useSession.ts';
import { useEventListener } from 'usehooks-ts';
import { Help } from '../shared/icons/Help.tsx';
import { Menu } from '../shared/icons/Menu.tsx';
import HelpOverlay from './HelpOverlay.tsx';
import MobileMenu from './MobileMenu.tsx';

const Navigation: FC = () => {
  const { user, maxLevel, isLoggedIn } = useSession();
  const { level, setLevel, markedItems } = useSettingsStore();
  const levelOptions = useMemo(() => Array.from({ length: maxLevel }, (_, i) => i + 1), [maxLevel]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLevelChange: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
      const newLevel = parseInt(e.target.value, 10);
      if (!isNaN(newLevel) && newLevel > 0) {
        setLevel(newLevel);
      }
    },
    [setLevel]
  );

  useEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && e.altKey) {
      const nextLevel = level < maxLevel ? level + 1 : 1;
      setLevel(nextLevel);
    } else if (e.key === 'ArrowUp' && e.altKey) {
      const prevLevel = level > 1 ? level - 1 : maxLevel;
      setLevel(prevLevel);
    }
  });

  return (
    <nav className="sticky top-0 z-10 bg-gray-700 p-4 text-white shadow-2xl">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-xl font-bold">Kanji Practice</span>
          <span className="text-sm">v{__APP_VERSION__}</span>
        </div>

        {/* Desktop Navigation - Hidden on small screens */}
        <div className="hidden items-center space-x-4 lg:flex">
          {isLoggedIn && (
            <>
              <NavLink
                to="kanji"
                className={({ isActive }) =>
                  `rounded px-3 py-2 hover:bg-pink-500 ${isActive ? 'bg-pink-500' : ''}`
                }
              >
                Kanji
              </NavLink>
              <NavLink
                to="vocabulary"
                className={({ isActive }) =>
                  `rounded px-3 py-2 hover:bg-purple-500 ${isActive ? 'bg-purple-500' : ''}`
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
                  className="rounded bg-gray-800 px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
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
                  `rounded from-pink-500 to-purple-500 px-3 py-2 hover:bg-gradient-to-br ${isActive ? 'bg-gradient-to-br' : ''}`
                }
              >
                Marked Items <span className="text-xs">({markedItems.length})</span>
              </NavLink>
            </>
          )}
          <NavLink
            to="settings"
            className={({ isActive }) =>
              `mr-0 rounded px-3 py-2 transition-colors hover:bg-gray-600 ${isActive ? 'bg-gray-600' : ''}`
            }
          >
            {user?.username ?? 'Settings'}
          </NavLink>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex cursor-pointer items-center px-3 py-2"
            aria-label="Help"
            title="Help & Information"
          >
            <Help />
          </button>
        </div>

        {/* Mobile Menu Button - Visible only on small screens */}
        <button
          className="rounded p-2 transition-colors hover:bg-gray-600 lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Menu"
        >
          <Menu />
        </button>
      </div>

      {/* Overlays */}
      <HelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        level={level}
        levelOptions={levelOptions}
        handleLevelChange={handleLevelChange}
        markedItems={markedItems}
        username={user?.username}
        onHelpClick={() => {
          setIsMobileMenuOpen(false);
          setIsHelpOpen(true);
        }}
      />
    </nav>
  );
};

export default Navigation;
