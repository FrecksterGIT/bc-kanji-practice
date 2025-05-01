import { FC, useCallback, useContext } from 'react';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { BookmarkEmpty } from './icons/BookmarkEmpty.tsx';
import { BookmarkFilled } from './icons/BookmarkFilled.tsx';
import useMarkedItems from '../../hooks/useMarkedItems.ts';
import { isKanji } from '../../utils/type-check.ts';

const MarkButton: FC = () => {
  const { item } = useContext(ValidationContext);
  const { markedItems, setMarkedItems } = useMarkedItems();
  const isMarked = markedItems.some((marked) => marked.id === item.id);

  const handleMark = useCallback(() => {
    if (isMarked) {
      setMarkedItems((prev) => prev.filter((marked) => marked.id !== item.id));
    } else {
      setMarkedItems((prev) => [
        ...prev,
        {
          id: item.id,
          type: isKanji(item) ? 'kanji' : 'vocabulary',
          level: item.data.level,
        },
      ]);
    }
  }, [isMarked, item, setMarkedItems]);

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
