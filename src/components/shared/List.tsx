import { type FC, useContext } from 'react';
import SelectableButton from './SelectableButton.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

type ListProps = {
  type: 'kanji' | 'vocabulary';
};

const List: FC<ListProps> = ({ type }) => {
  const { items } = useContext(ValidationContext);
  const color = type === 'kanji' ? 'border-t-pink-400' : 'border-t-purple-400';

  return (
    <div
      className={`grid gap-2 auto-rows-auto ${color} border-t-2 pt-6`}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
    >
      {items.map((item, index) => (
        <SelectableButton key={item.id} position={index} />
      ))}
    </div>
  );
};

export default List;
