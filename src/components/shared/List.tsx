import { type FC, RefObject, useEffect, useRef, useState } from 'react';
import { SelectableButton } from './SelectableButton.tsx';
import { isKanji } from '../../utils/typeChecks.ts';
import { useItems } from '../../hooks/useItems.ts';
import { Close } from './icons/Close.tsx';
import useGlobalEvent from 'beautiful-react-hooks/useGlobalEvent';
import useResizeObserver from 'beautiful-react-hooks/useResizeObserver';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.ts';

interface ListProps {
  onClose: () => void;
}

export const List: FC<ListProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { items, currentItem, setSelectedIndex } = useItems();
  const [itemsPerRow, setItemsPerRow] = useState(0);
  const borderColor = isKanji(currentItem) ? 'border-t-pink-400' : 'border-t-purple-400';

  const onKeyDown = useGlobalEvent<KeyboardEvent>('keydown');
  onKeyDown((e) => {
    switch (e.key) {
      case 'Escape':
      case 'Enter':
        onClose();
        break;
      case 'ArrowRight':
        setSelectedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowLeft':
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'ArrowUp':
        if (!e.altKey)
          setSelectedIndex((prev) => {
            const maxRow = Math.floor(items.length / itemsPerRow);
            const itemsInMaxRow = items.length % itemsPerRow;
            const currentRow = Math.floor(prev / itemsPerRow);
            const currentPosition = prev % itemsPerRow;
            const setMaxRow = currentPosition >= itemsInMaxRow ? maxRow - 1 : maxRow;
            const newRow =
              (currentRow - 1) * itemsPerRow + currentPosition < 0 ? setMaxRow : currentRow - 1;
            return newRow * itemsPerRow + currentPosition;
          });
        break;
      case 'ArrowDown':
        if (!e.altKey)
          setSelectedIndex((prev) => {
            const currentRow = Math.floor(prev / itemsPerRow);
            const currentPosition = prev % itemsPerRow;
            const newRow =
              (currentRow + 1) * itemsPerRow + currentPosition >= items.length ? 0 : currentRow + 1;
            return newRow * itemsPerRow + currentPosition;
          });
        break;
    }
  });

  useOnClickOutside(containerRef, onClose);

  const listDimensions = useResizeObserver(listRef as RefObject<HTMLDivElement>);
  useEffect(() => {
    if (buttonRef.current && listDimensions?.width) {
      const buttonWidth = buttonRef.current.offsetWidth;
      const newItemsPerRow = Math.floor(listDimensions.width / buttonWidth);
      if (newItemsPerRow !== itemsPerRow) {
        setItemsPerRow(newItemsPerRow);
      }
    }
  }, [itemsPerRow, listDimensions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative container max-h-full overflow-y-auto rounded-lg bg-gray-800 py-6 shadow-2xl"
        ref={containerRef}
      >
        <button className="absolute top-6 right-5 cursor-pointer text-white" onClick={onClose}>
          <Close />
        </button>
        <div className="mb-4 flex items-start justify-between px-6">
          <h2 className="text-xl font-bold text-white">Kanji / Vocabulary</h2>
        </div>
        <div
          className={`grid w-full auto-rows-auto gap-2 ${borderColor} border-t-2 px-6 pt-6 pb-12`}
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
          ref={listRef}
        >
          {items.map((item, index) => (
            <SelectableButton key={item.id} position={index} ref={buttonRef} onClose={onClose} />
          ))}
        </div>
      </div>
    </div>
  );
};
