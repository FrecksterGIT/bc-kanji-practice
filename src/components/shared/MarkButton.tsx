import { FC, useCallback, useContext } from 'react';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { useLocalStorage } from 'usehooks-ts';
import { type MarkedItem } from '../../types';
import { BookmarkEmpty } from './icons/BookmarkEmpty.tsx';
import { BookmarkFilled } from './icons/BookmarkFilled.tsx';

const MarkButton: FC = () => {
  const { item } = useContext(ValidationContext);
  const [markedItems, setMarkedItem] = useLocalStorage<MarkedItem[]>('markedItems', [], {});
  const isMarked = markedItems.some((marked) => marked.id === item.id);

  const handleMark = useCallback(() => {
    if (isMarked) {
      setMarkedItem((prev) => prev.filter((marked) => marked.id !== item.id));
    } else {
      setMarkedItem((prev) => [
        ...prev,
        {
          id: item.id,
          type: 'kanji' in item ? 'kanji' : 'vocabulary',
          level: item.level,
        },
      ]);
    }
  }, [isMarked, item, setMarkedItem]);

  return (
    <button
      className="cursor-pointer"
      onClick={handleMark}
      title={isMarked ? 'Unmark item' : 'Mark item'}
    >
      {isMarked ? <BookmarkFilled /> : <BookmarkEmpty />}
    </button>
  );
};

export default MarkButton;
