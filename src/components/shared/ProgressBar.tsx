import { isKanji } from '../../utils/typeChecks.ts';
import useItems from '../../hooks/useItems.ts';

export const ProgressBar = () => {
  const { items, validItems, item } = useItems();
  const bgColor = isKanji(item) ? 'bg-pink-400' : 'bg-purple-400';
  const correct = Math.min((validItems.length / items.length) * 100, 100);

  return (
    <div className="relative h-0.5 w-full">
      <div
        className={`${bgColor} absolute top-0 left-0 h-2 transition-all`}
        style={{ width: `${correct}%` }}
      ></div>
    </div>
  );
};
