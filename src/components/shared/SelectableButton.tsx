import { type FC, Ref, useMemo } from 'react';
import { NoAnswer } from './icons/NoAnswer.tsx';
import { CorrectAnswer } from './icons/CorrectAnswer.tsx';
import { isKanji } from '../../utils/type-check.ts';
import useItems from '../../hooks/useItems.ts';

interface SelectableButtonProps {
  position: number;
  ref?: Ref<HTMLButtonElement>;
}

const SelectableButton: FC<SelectableButtonProps> = ({ position, ref }) => {
  const { validItems, items, selectedIndex, setSelectedIndex } = useItems();
  const selected = position === selectedIndex;
  const valid = validItems.includes(items[position].id);
  const term = items[position].data.characters;

  const backgroundColor = useMemo(() => {
    if (selected) return isKanji(items[position]) ? 'bg-pink-500' : 'bg-purple-500';
    return valid ? 'text-green-700' : 'text-gray-400';
  }, [selected, items, position, valid]);

  const textColor = useMemo(() => {
    if (selected) return 'text-white';
    if (valid) return 'text-green-700';
    return 'text-gray-400';
  }, [selected, valid]);

  return (
    <button
      className={`cursor-pointer grid grid-cols-[min-content_auto] items-center gap-2 ${textColor}`}
      onClick={() => setSelectedIndex(position)}
      ref={ref}
    >
      {!valid && <NoAnswer />}
      {valid && <CorrectAnswer />}
      <div
        className={`text-xl text-nowrap max-w-min text-left px-2 py-1 rounded-lg ${backgroundColor}`}
      >
        {term}
      </div>
    </button>
  );
};

export default SelectableButton;
