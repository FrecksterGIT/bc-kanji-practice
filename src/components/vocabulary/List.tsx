import { type FC } from 'react';
import SelectableButton from '../shared/SelectableButton.tsx';
import { VocabularyItem } from '../../types';

interface ListProps {
  filteredData: VocabularyItem[];
  selectedIndex: number;
  correctlyEnteredIds: number[];
  handleItemClick: (index: number) => void;
}

const List: FC<ListProps> = ({
  filteredData,
  selectedIndex,
  correctlyEnteredIds,
  handleItemClick,
}) => {
  return (
    <div
      className="grid gap-2 auto-rows-auto border-t-purple-400 border-t-2 pt-6"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
    >
      {filteredData.map((item, index) => (
        <SelectableButton
          key={item.id}
          selected={selectedIndex === index}
          valid={correctlyEnteredIds.includes(item.id)}
          onClick={() => handleItemClick(index)}
          term={item.word}
          type={'vocabulary'}
        />
      ))}
    </div>
  );
};

export default List;
