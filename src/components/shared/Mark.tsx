import { FC, RefObject, useRef } from 'react';
import { useHover } from 'usehooks-ts';
import { useSession } from '../../hooks/useSession.ts';
import { Tooltip } from './Tooltip.tsx';

interface MarkProps {
  level: number;
  meaning: string;
  word: string;
  reading: string;
}

export const Mark: FC<MarkProps> = ({ level, meaning, word, reading }) => {
  const markRef = useRef<HTMLButtonElement>(null);
  const showTooltip = useHover(markRef as RefObject<HTMLButtonElement>);
  const { speak } = useSession();

  return (
    <button
      className="bg-purple-400 text-gray-700 px-1 rounded-sm mx-1 text-xl relative cursor-pointer flex items-end gap-2 text-nowrap"
      onClick={() => speak(reading)}
      ref={markRef}
    >
      <span>{word}</span>
      <span className="text-sm">{level}</span>
      {showTooltip && (
        <Tooltip>
          {meaning}
          <br />
          {reading}
        </Tooltip>
      )}
    </button>
  );
};
