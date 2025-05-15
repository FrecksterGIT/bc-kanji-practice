import { FC, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Help } from '../shared/icons/Help';
import { Close } from '../shared/icons/Close.tsx';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  level: number;
  levelOptions: number[];
  handleLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  markedItems: number[];
  username: string | undefined;
  onHelpClick: () => void;
}

export const MobileMenu: FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  level,
  levelOptions,
  handleLevelChange,
  markedItems,
  username,
  onHelpClick,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent scrolling when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div
        ref={menuRef}
        className="absolute right-0 flex h-full w-64 max-w-full flex-col bg-gray-800 p-4 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <div className="flex space-x-2">
            <button
              onClick={onHelpClick}
              className="rounded p-2 transition-colors hover:bg-gray-700"
              aria-label="Help"
              title="Help & Information"
            >
              <Help />
            </button>
            <button onClick={onClose} className="rounded p-2 transition-colors hover:bg-gray-700">
              <Close />
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          {isLoggedIn && (
            <>
              <NavLink
                to="kanji"
                className={({ isActive }) =>
                  `rounded px-3 py-2 hover:bg-pink-500 ${isActive ? 'bg-pink-500' : ''}`
                }
                onClick={onClose}
              >
                Kanji
              </NavLink>
              <NavLink
                to="vocabulary"
                className={({ isActive }) =>
                  `rounded px-3 py-2 hover:bg-purple-500 ${isActive ? 'bg-purple-500' : ''}`
                }
                onClick={onClose}
              >
                Vocabulary
              </NavLink>
              <div className="flex items-center space-x-2 px-3 py-2">
                <label htmlFor="mobile-level-select" className="text-sm">
                  Level:
                </label>
                <select
                  id="mobile-level-select"
                  value={level}
                  onChange={handleLevelChange}
                  className="rounded bg-gray-700 px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
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
                  `rounded from-pink-500 to-purple-500 px-3 py-2 hover:bg-gradient-to-br ${
                    isActive ? 'bg-gradient-to-br from-pink-500 to-purple-500' : ''
                  }`
                }
                onClick={onClose}
              >
                Marked Items <span className="text-xs">({markedItems.length})</span>
              </NavLink>
            </>
          )}
          <NavLink
            to="settings"
            className={({ isActive }) =>
              `rounded px-3 py-2 transition-colors hover:bg-gray-600 ${isActive ? 'bg-gray-600' : ''}`
            }
            onClick={onClose}
          >
            {username ?? 'Settings'}
          </NavLink>
        </div>
      </div>
    </div>
  );
};
