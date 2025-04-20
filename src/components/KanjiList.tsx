import { type FC } from 'react';
import SelectableButton from './SelectableButton';

// Define the KanjiItem interface
interface KanjiItem {
    id: number;
    level: number;
    kanji: string;
    onyomi: {
        reading: string;
        primary: boolean;
        accepted_answer: boolean;
        type: string;
    }[];
    kunyomi: {
        reading: string;
        primary: boolean;
        accepted_answer: boolean;
        type: string;
    }[];
    meanings: {
        meaning: string;
        primary: boolean;
        accepted_answer: boolean;
    }[];
}

interface KanjiListProps {
    filteredData: KanjiItem[];
    selectedIndex: number;
    correctlyEnteredIds: number[];
    handleItemClick: (index: number) => void;
}

const KanjiList: FC<KanjiListProps> = ({ filteredData, selectedIndex, correctlyEnteredIds, handleItemClick }) => {
    return (
        <div className="grid gap-2 auto-rows-auto"
             style={{gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))'}}>
            {filteredData.map((item, index) => (
                <SelectableButton
                    key={item.id}
                    selected={selectedIndex === index}
                    valid={correctlyEnteredIds.includes(item.id)}
                    onClick={() => handleItemClick(index)}
                    term={item.kanji}
                />
            ))}
        </div>
    );
};

export default KanjiList;
