import { FC, useCallback, useContext } from 'react';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { BookmarkEmpty } from './icons/BookmarkEmpty.tsx';
import { BookmarkFilled } from './icons/BookmarkFilled.tsx';
import useMarkedItems from '../../hooks/useMarkedItems.ts';

const MarkButton: FC = () => {
  const { item } = useContext(ValidationContext);
  const { markedItems, setMarkedItems } = useMarkedItems();
  const isMarked = markedItems.some((marked) => marked === item.id);

  const handleMark = useCallback(() => {
    if (isMarked) {
      setMarkedItems((prev) => prev.filter((marked) => marked !== item.id));
    } else {
      setMarkedItems((prev) => [...prev, item.id]);
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
