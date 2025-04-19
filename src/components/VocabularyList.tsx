import { type FC } from 'react';

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
                <button
                    key={item.id}
                    className={`border p-2 text-center cursor-pointer transition-colors 
                    ${selectedIndex === index ? 'bg-blue-100 border-blue-500' :
                        correctlyEnteredIds.includes(item.id) ? 'bg-green-100 border-green-500' :
                            'hover:bg-gray-100'}`}
                    onClick={() => handleItemClick(index)}
                >
                    <span className="text-xl">{item.word}</span>
                </button>
            ))}
        </div>
    );
};

export default VocabularyList;
