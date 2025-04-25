import { type FC, useContext, useMemo } from 'react';
import { NoAnswer } from './icons/NoAnswer.tsx';
import { CorrectAnswer } from './icons/CorrectAnswer.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

interface SelectableButtonProps {
  position: number;
  type: 'kanji' | 'vocabulary';
}

const SelectableButton: FC<SelectableButtonProps> = ({ position, type }) => {
  const { validItems, items, selectedIndex, setSelectedIndex } = useContext(ValidationContext);
  const selected= position === selectedIndex;
  const valid= validItems.includes(items[position].id)
  const term= "kanji" in items[position] ? items[position].kanji : items[position].word;

  const backgroundColor = useMemo(() => {
    if (selected) return type === 'kanji' ? 'bg-pink-400' : 'bg-purple-400';
    return 'text-gray-400';
  }, [selected, type]);

  const textColor = useMemo(() => {
    if (selected) return 'text-white';
    if (valid) return 'text-green-700';
    return 'text-gray-400';
  }, [selected, valid]);

  return (
    <button
      className={`cursor-pointer grid grid-cols-[min-content_auto] items-center gap-2 ${backgroundColor} ${textColor}`}
      onClick={() => setSelectedIndex(position)}
    >
      {!valid && <NoAnswer />}
      {valid && <CorrectAnswer />}
      <div className={`text-xl text-nowrap text-left rounded-lg px-2 py-1`}>{term}</div>
    </button>
  );
};

export default SelectableButton;
