import { type FC, useContext } from 'react';
import SelectableButton from '../shared/SelectableButton.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

const List: FC = () => {
  const { validItems, items, selectedIndex, setSelectedIndex } = useContext(ValidationContext);

  return (
    <div
      className="grid gap-2 auto-rows-auto border-t-purple-400 border-t-2 pt-6"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
    >
      {items.map(
        (item, index) =>
          'word' in item && (
            <SelectableButton
              key={item.id}
              selected={selectedIndex === index}
              valid={validItems.includes(item.id)}
              onClick={() => setSelectedIndex(index)}
              term={item.word}
              type={'vocabulary'}
            />
          )
      )}
    </div>
  );
};

export default List;
