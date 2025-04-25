import { type FC, useContext } from 'react';
import SelectableButton from '../shared/SelectableButton.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

const List: FC = () => {
  const { items } = useContext(ValidationContext);

  return (
    <div
      className="grid gap-2 auto-rows-auto border-t-pink-400 border-t-2 pt-6"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
    >
      {items.map((item, index) => (
        <SelectableButton key={item.id} position={index} type={'kanji'} />
      ))}
    </div>
  );
};

export default List;
