import { type FC, useContext } from 'react';
import SelectableButton from './SelectableButton.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { isKanji } from '../../utils/type-check.ts';

const List: FC = () => {
  const { items, item } = useContext(ValidationContext);
  const borderColor = isKanji(item) ? 'border-t-pink-400' : 'border-t-purple-400';

  return (
    <div
      className={`grid gap-2 auto-rows-auto ${borderColor} border-t-2 pt-6 relative`}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
    >
      {items.map((item, index) => (
        <SelectableButton key={item.id} position={index} />
      ))}
    </div>
  );
};

export default List;
