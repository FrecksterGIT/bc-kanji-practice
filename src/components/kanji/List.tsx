import { type FC, useContext } from 'react';
import SelectableButton from '../shared/SelectableButton.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

const List: FC = () => {
  const { validItems, items, selectedIndex, setSelectedIndex } = useContext(ValidationContext);

  return (
    <div
      className="grid gap-2 auto-rows-auto border-t-pink-400 border-t-2 pt-6"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
    >
      {items.map(
        (item, index) =>
          'kanji' in item && (
            <SelectableButton
              key={item.id}
              selected={selectedIndex === index}
              valid={validItems.includes(item.id)}
              onClick={() => setSelectedIndex(index)}
              term={item.kanji}
              type={'kanji'}
            />
          )
      )}
    </div>
  );
};

export default List;
