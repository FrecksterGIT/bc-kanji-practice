import { FC, useCallback, useRef } from 'react';
import { useSession } from '../../hooks/useSession.ts';
import { useItems } from '../../hooks/useItems.ts';
import { Tooltip } from './Tooltip.tsx';
import { BookmarkEmpty } from './icons/BookmarkEmpty.tsx';
import { BookmarkFilled } from './icons/BookmarkFilled.tsx';
import useGlobalEvent from 'beautiful-react-hooks/useGlobalEvent';
import { useHover } from '../../hooks/useHover.ts';

export const MarkButton: FC = () => {
  const { currentItem } = useItems();
  const { markedItems, setMarkedItems } = useSession();

  const isMarked = markedItems.some((marked) => marked === currentItem.id);
  const markRef = useRef<HTMLButtonElement>(null);
  const showTooltip = useHover(markRef);

  const handleMark = useCallback(() => {
    if (isMarked) {
      setMarkedItems((prev) => prev.filter((marked) => marked !== currentItem.id));
    } else {
      setMarkedItems((prev) => [...prev, currentItem.id]);
    }
  }, [isMarked, currentItem, setMarkedItems]);

  const onKeyDown = useGlobalEvent<KeyboardEvent>('keydown');
  onKeyDown((e) => {
    if (e.key === 'm' && e.altKey) {
      handleMark();
    }
  });

  return (
    <button
      className="relative cursor-pointer"
      onClick={handleMark}
      ref={markRef}
      aria-label={isMarked ? 'unmark item' : 'mark item'}
    >
      {isMarked ? <BookmarkFilled /> : <BookmarkEmpty />}
      {showTooltip && (
        <Tooltip left>
          {isMarked ? 'unmark item' : 'mark item'}
          <br />
          <span className="text-xs">(alt + m) to toggle</span>
        </Tooltip>
      )}
    </button>
  );
};
