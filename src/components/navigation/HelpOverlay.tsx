import { FC, PropsWithChildren, useEffect, useRef } from 'react';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const Mono: FC<PropsWithChildren> = ({ children }) => (
  <span className="font-mono rounded bg-gray-700 px-1">{children}</span>
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
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div
        ref={overlayRef}
        className="mx-4 w-full max-w-2xl rounded-lg bg-gray-800 p-6 text-gray-200 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-bold text-white">Help & Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              className="h-5 w-5"
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
            <h3 className="mb-2 text-lg font-semibold text-white">About the Data</h3>
            <p>
              This application relies on data from WaniKani, a Japanese language learning platform.
              The kanji and vocabulary items, along with their meanings, readings, and other
              information, are sourced from WaniKani's API.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-semibold text-white">Keyboard Navigation</h3>
            <ul className="list-disc space-y-2 pl-5">
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
            <h3 className="mb-2 text-lg font-semibold text-white">Practice Tips</h3>
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
