import { type FC, useContext } from 'react';
import SelectableButton from './SelectableButton.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

type ListProps = {
  type: 'kanji' | 'vocabulary';
};

const List: FC<ListProps> = ({ type }) => {
  const { items, validItems } = useContext(ValidationContext);
  const borderColor = type === 'kanji' ? 'border-t-pink-400' : 'border-t-purple-400';
  const bgColor = type === 'kanji' ? 'bg-pink-400' : 'bg-purple-400';
  const correct = Math.min((validItems.length / items.length) * 100, 100);

  return (
    <div
      className={`grid gap-2 auto-rows-auto ${borderColor} border-t-2 pt-6 relative`}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
    >
      <div
        className={`${bgColor} absolute h-0.5 top-0 left-0 transition-all`}
        style={{ width: `${correct}%` }}
      ></div>
      {items.map((item, index) => (
        <SelectableButton key={item.id} position={index} />
      ))}
    </div>
  );
};

export default List;
