import { FC, PropsWithChildren, useEffect, useRef } from 'react';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const Mono: FC<PropsWithChildren> = ({ children }) => (
  <span className="font-mono bg-gray-700 px-1 rounded">{children}</span>
);

const HelpOverlay: FC<HelpOverlayProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={overlayRef}
        className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 text-gray-200"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white">Help & Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold text-white mb-2">About the Data</h3>
            <p>
              This application relies on data from WaniKani, a Japanese language learning platform.
              The kanji and vocabulary items, along with their meanings, readings, and other
              information, are sourced from WaniKani's API.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Keyboard Navigation</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Mono>↑</Mono> <Mono>↓</Mono> <Mono>←</Mono> <Mono>→</Mono> - Use arrow keys to
                navigate through items
              </li>
              <li>
                <Mono>Alt + ↑</Mono> <Mono>Alt + ↓</Mono> - Go to previous / next level
              </li>
              <li>
                <Mono>Alt + M</Mono> - Mark the current item for later review
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Practice Tips</h3>
            <p>
              Regular practice is key to mastering kanji and vocabulary. Use the marking feature to
              save items you find challenging for focused review later.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpOverlay;
