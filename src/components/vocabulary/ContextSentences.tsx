import { FC, useState } from 'react';
import { WanikaniContextSentence } from '../../wanikani';

type SentenceProps = {
  sentence: WanikaniContextSentence;
};

const Sentence: FC<SentenceProps> = ({ sentence: { ja, en } }) => {
  const [blur, setBlur] = useState(true);

  return (
    <button className="context-sentence" onClick={() => setBlur((prev) => !prev)}>
      <p className="text-right" lang="ja">
        {ja}
      </p>
      <p className={`text-left ${blur ? 'blur-sm' : ''}`}>{en}</p>
    </button>
  );
};

type ContextSentencesProps = {
  context_sentences: WanikaniContextSentence[];
};

export const ContextSentences: FC<ContextSentencesProps> = ({ context_sentences }) => {
  return (
    <div className="mb-12 grid w-full space-y-4">
      {context_sentences.map((sentence) => (
        <Sentence sentence={sentence} key={sentence.ja} />
      ))}
    </div>
  );
};
