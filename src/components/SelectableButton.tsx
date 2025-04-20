import {type FC, useCallback} from 'react';

interface SelectableButtonProps {
    selected: boolean;
    valid: boolean;
    onClick: () => void;
    term: string;
}

const SelectableButton: FC<SelectableButtonProps> = ({
                                                         term,
                                                         selected,
                                                         valid,
                                                         onClick,
                                                     }) => {
    const getButtonClass = useCallback(() => {
        if (selected && !valid) return 'bg-blue-100 border-blue-500';
        if (valid) return 'bg-green-100 border-green-500';
        return 'hover:bg-gray-100';
    }, [selected, valid]);

    return (
        <button
            className={`border p-2 text-center cursor-pointer transition-colors 
                ${getButtonClass()}`}
            onClick={onClick}
        >
            <span className="text-xl">{term}</span>
        </button>
    );
};

export default SelectableButton;
