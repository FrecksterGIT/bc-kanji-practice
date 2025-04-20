import {ChangeEvent, useEffect, type FC} from 'react';
import {NavLink} from 'react-router-dom';
import {useSession} from '../contexts/SessionContext.tsx';
import {useSettingsStore} from '../store/settingsStore';

const Navigation: FC = () => {
    const {user} = useSession();
    const {level, setLevel} = useSettingsStore();

    // Determine max level based on user data or default to 3 if no API key
    const maxLevel = user?.level ?? 3;

    // Generate options for the dropdown
    const levelOptions = Array.from({length: maxLevel}, (_, i) => i + 1);

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
        <nav className="sticky top-0 z-10 bg-gray-700 text-white p-4 shadow-2xl">
            <div className="container mx-auto flex flex-wrap items-center justify-between">
                <div className="flex items-center">
                    <span className="text-xl font-bold">Kanji Practice</span>
                </div>
                <div className="flex items-center space-x-4">
                    <NavLink to="/kanji" className={({isActive}) =>
                        `px-3 py-2 rounded hover:bg-pink-400 transition-colors ${isActive ? 'bg-pink-400' : ''}`
                    }>
                        Kanji
                    </NavLink>
                    <NavLink to="/vocabulary" className={({isActive}) =>
                        `px-3 py-2 rounded hover:bg-purple-400 transition-colors ${isActive ? 'bg-purple-400' : ''}`
                    }>
                        Vocabulary
                    </NavLink>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="level-select" className="text-sm">Level:</label>
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
                    <NavLink to="/settings" className={({isActive}) =>
                        `px-3 py-2 rounded hover:bg-gray-600 transition-colors ${isActive ? 'bg-gray-600' : ''}`
                    }>
                        Settings
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
