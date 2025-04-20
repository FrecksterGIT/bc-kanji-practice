import { type FC } from 'react';
import SelectableButton from './SelectableButton';
import { KanjiItem } from '../types';

interface KanjiListProps {
    filteredData: KanjiItem[];
    selectedIndex: number;
    correctlyEnteredIds: number[];
    handleItemClick: (index: number) => void;
}

const KanjiList: FC<KanjiListProps> = ({ filteredData, selectedIndex, correctlyEnteredIds, handleItemClick }) => {
    return (
        <div className="grid gap-2 auto-rows-auto border-t-pink-400 border-t-2 pt-6"
             style={{gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))'}}>
            {filteredData.map((item, index) => (
                <SelectableButton
                    key={item.id}
                    selected={selectedIndex === index}
                    valid={correctlyEnteredIds.includes(item.id)}
                    onClick={() => handleItemClick(index)}
                    term={item.kanji}
                    type={"kanji"}
                />
            ))}
        </div>
    );
};

export default KanjiList;
