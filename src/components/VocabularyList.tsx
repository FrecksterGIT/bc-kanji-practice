import { type FC } from 'react';
import SelectableButton from './SelectableButton';

// Define the VocabularyItem interface
interface VocabularyItem {
    id: number;
    level: number;
    word: string;
    reading: {
        reading: string;
        primary: boolean;
    }[];
    meanings: {
        meaning: string;
        primary: boolean;
    }[];
}

interface VocabularyListProps {
    filteredData: VocabularyItem[];
    selectedIndex: number;
    correctlyEnteredIds: number[];
    handleItemClick: (index: number) => void;
}

const VocabularyList: FC<VocabularyListProps> = ({filteredData, selectedIndex, correctlyEnteredIds, handleItemClick}) => {
    return (
        <div className="grid gap-2 auto-rows-auto"
             style={{gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))'}}>
            {filteredData.map((item, index) => (
                <SelectableButton
                    key={item.id}
                    selected={selectedIndex === index}
                    valid={correctlyEnteredIds.includes(item.id)}
                    onClick={() => handleItemClick(index)}
                    term={item.word}
                />
            ))}
        </div>
    );
};

export default VocabularyList;
