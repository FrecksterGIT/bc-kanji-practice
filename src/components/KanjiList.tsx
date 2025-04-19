import { type FC } from 'react';

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
                <button
                    key={item.id}
                    className={`border p-2 text-center text-2xl cursor-pointer transition-colors 
                    ${selectedIndex === index ? 'bg-blue-100 border-blue-500' : 
                      correctlyEnteredIds.includes(item.id) ? 'bg-green-100 border-green-500' : 
                      'hover:bg-gray-100'}`}
                    onClick={() => handleItemClick(index)}
                >
                    {item.kanji}
                </button>
            ))}
        </div>
    );
};

export default KanjiList;
