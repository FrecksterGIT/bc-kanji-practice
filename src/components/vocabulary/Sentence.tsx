import { FC } from 'react';
import { useToggle } from 'usehooks-ts';

type SentenceProps = {
  sentence: {
    ja: string;
    en: string;
  };
};
const Sentence: FC<SentenceProps> = ({ sentence: { ja, en } }) => {
  const [blur, toggle] = useToggle(true);
  return (
    <button
      className="grid cursor-pointer grid-cols-2 gap-x-6 border-b-1 border-b-gray-600 pb-4 text-2xl"
      onClick={toggle}
    >
      <p className="text-right" lang="ja">
        {ja}
      </p>
      <p className={`text-left ${blur ? 'blur-sm' : ''}`}>{en}</p>
    </button>
  );
};

export default Sentence;
