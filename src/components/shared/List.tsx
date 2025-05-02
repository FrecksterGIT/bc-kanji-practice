import { type FC, RefObject, useCallback, useRef, useState } from 'react';
import SelectableButton from './SelectableButton.tsx';
import { isKanji } from '../../utils/type-check.ts';
import { useEventListener, useResizeObserver } from 'usehooks-ts';
import useItems from '../../hooks/useItems.ts';

const List: FC = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { items, item, setSelectedIndex } = useItems();
  const [itemsPerRow, setItemsPerRow] = useState(0);
  const borderColor = isKanji(item) ? 'border-t-pink-400' : 'border-t-purple-400';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowLeft':
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'ArrowUp':
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
          setSelectedIndex((prev) => {
            const currentRow = Math.floor(prev / itemsPerRow);
            const currentPosition = prev % itemsPerRow;
            const newRow =
              (currentRow + 1) * itemsPerRow + currentPosition >= items.length ? 0 : currentRow + 1;
            return newRow * itemsPerRow + currentPosition;
          });
          break;
      }
    },
    [items.length, itemsPerRow, setSelectedIndex]
  );

  useEventListener('keydown', handleKeyDown);

  useResizeObserver({
    ref: listRef as RefObject<HTMLDivElement>,
    onResize: (size) => {
      if (buttonRef.current && size?.width) {
        const buttonWidth = buttonRef.current.offsetWidth;
        const newItemsPerRow = Math.floor(size.width / buttonWidth);
        if (newItemsPerRow !== itemsPerRow) {
          setItemsPerRow(newItemsPerRow);
        }
      }
    },
  });

  return (
    <div
      className={`grid auto-rows-auto gap-2 ${borderColor} relative border-t-2 pt-6 pb-12`}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
      ref={listRef}
    >
      {items.map((item, index) => (
        <SelectableButton key={item.id} position={index} ref={buttonRef} />
      ))}
    </div>
  );
};

export default List;
