import { useContext } from 'react';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { isKanji } from '../../utils/type-check.ts';

export const ProgressBar = () => {
  const { items, validItems, item } = useContext(ValidationContext);
  const bgColor = isKanji(item) ? 'bg-pink-400' : 'bg-purple-400';
  const correct = Math.min((validItems.length / items.length) * 100, 100);

  return (
    <div className="relative w-full h-0.5">
      <div
        className={`${bgColor} absolute h-0.5 top-0 left-0 transition-all`}
        style={{ width: `${correct}%` }}
      ></div>
    </div>
  );
};
