import {type FC, useCallback} from 'react';
import {NoAnswer} from "./icons/NoAnswer.tsx";
import {CorrectAnswer} from "./icons/CorrectAnswer.tsx";

interface SelectableButtonProps {
    selected: boolean;
    valid: boolean;
    onClick: () => void;
    term: string;
    type: "kanji" | "vocabulary";
}

const SelectableButton: FC<SelectableButtonProps> = ({
                                                         term,
                                                         selected,
                                                         valid,
                                                         onClick,
    type,
                                                     }) => {
    const getButtonClass = useCallback(() => {
        if (selected) return type === 'kanji' ? 'bg-pink-400' : 'bg-purple-400';
        return '';
    }, [selected, valid]);

    return (
        <button
            className={`cursor-pointer transition-colors grid grid-cols-[min-content_auto] items-center gap-2`}
            onClick={onClick}
        >
            {!valid && <NoAnswer/>}
            {valid && <CorrectAnswer/>}
            <div className={`text-xl text-nowrap text-left rounded-lg px-2 py-1 ${getButtonClass()}`}>{term}</div>
        </button>
    );
};

export default SelectableButton;
