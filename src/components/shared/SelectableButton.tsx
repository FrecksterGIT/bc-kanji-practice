import { type FC, Ref, useCallback, useMemo } from 'react';
import { NoAnswer } from './icons/NoAnswer.tsx';
import { CorrectAnswer } from './icons/CorrectAnswer.tsx';
import { isKanji } from '../../utils/typeChecks.ts';
import { useItems } from '../../hooks/useItems.ts';

interface SelectableButtonProps {
  position: number;
  onClose: () => void;
  ref?: Ref<HTMLButtonElement>;
}

export const SelectableButton: FC<SelectableButtonProps> = ({ position, onClose, ref }) => {
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

  const selectByClick = useCallback(() => {
    setSelectedIndex(position);
    onClose();
  }, [onClose, position, setSelectedIndex]);

  return (
    <button
      className={`grid cursor-pointer grid-cols-[min-content_auto] items-center gap-2 ${textColor}`}
      onClick={() => selectByClick()}
      ref={ref}
    >
      {!valid && <NoAnswer />}
      {valid && <CorrectAnswer />}
      <div
        className={`max-w-min rounded-lg px-2 py-1 text-left text-xl text-nowrap ${backgroundColor}`}
        lang="ja"
      >
        {term}
      </div>
    </button>
  );
};
