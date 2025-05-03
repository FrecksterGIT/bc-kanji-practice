import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { Close } from '../shared/icons/Close.tsx';

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
            <Close />
          </button>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="mb-2 text-lg font-semibold text-white">WaniKani data</h3>
            <p>
              This application relies on data from WaniKani, a Japanese language learning platform.
              The kanji and vocabulary items, along with their meanings, readings, and other
              information, are sourced from WaniKani's API.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-semibold text-white">Keyboard Navigation</h3>
            <div className="list-disc space-y-2 pl-5">
              <p>
                <Mono>↑</Mono> <Mono>↓</Mono> <Mono>←</Mono> <Mono>→</Mono> - Use arrow keys to
                navigate through items
              </p>
              <p>
                <Mono>Alt + ↑</Mono> <Mono>Alt + ↓</Mono> - Go to previous / next level
              </p>
              <p>
                <Mono>Alt + S</Mono> - Show details of the current item
              </p>
              <p>
                <Mono>Alt + M</Mono> - Mark the current item for later review
              </p>
            </div>
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
