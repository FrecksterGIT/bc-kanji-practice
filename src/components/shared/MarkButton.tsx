import { FC, RefObject, useCallback, useRef } from 'react';
import { BookmarkEmpty } from './icons/BookmarkEmpty.tsx';
import { BookmarkFilled } from './icons/BookmarkFilled.tsx';
import useItems from '../../hooks/useItems.ts';
import { useEventListener, useHover } from 'usehooks-ts';
import { Tooltip } from './Tooltip.tsx';
import { useSettingsStore } from '../../store/settingsStore.ts';

const MarkButton: FC = () => {
  const { item } = useItems();
  const markedItems = useSettingsStore((state) => state.markedItems);
  const setMarkedItems = useSettingsStore((state) => state.setMarkedItems);
  const isMarked = markedItems.some((marked) => marked === item.id);
  const markRef = useRef<HTMLButtonElement>(null);
  const showTooltip = useHover(markRef as RefObject<HTMLButtonElement>);

  const handleMark = useCallback(() => {
    if (isMarked) {
      setMarkedItems((prev) => prev.filter((marked) => marked !== item.id));
    } else {
      setMarkedItems((prev) => [...prev, item.id]);
    }
  }, [isMarked, item, setMarkedItems]);

  useEventListener('keydown', (e) => {
    if (e.key === 'm' && e.altKey) {
      handleMark();
    }
  });

  return (
    <button className="relative cursor-pointer" onClick={handleMark} ref={markRef}>
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

export default MarkButton;
