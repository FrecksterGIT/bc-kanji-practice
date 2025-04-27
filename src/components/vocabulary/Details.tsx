import { type FC, useContext } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import Info from './Info.tsx';
import { VocabularyItem } from '../../types';
import useSession from '../../hooks/useSession.ts';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import MarkButton from '../shared/MarkButton.tsx';
import { ProgressBar } from '../shared/ProgressBar.tsx';

const Details: FC = () => {
  const { speak } = useSession();
  const { isValid, item, selectedIndex, items } = useContext(ValidationContext);
  const vocabulary = item as VocabularyItem;

  return (
    <div className="mb-6">
      <div className="flex flex-col items-center">
        <div className="mb-12">
          {selectedIndex + 1} / {items.length}
        </div>
        <div className="relative p-8 w-full text-center bg-gray-700 border-b-purple-400 border-b-2 text-white">
          <button className="text-9xl cursor-pointer" onClick={() => speak(vocabulary.word)}>
            {vocabulary.word}
          </button>
          <div className="absolute top-2 right-1">
            <MarkButton />
          </div>
        </div>
        <ProgressBar />
        <div className="w-full max-w-1/2 my-12">
          <KanaInput id="reading" />
        </div>
        <Info vocabulary={vocabulary} isValid={isValid} />
      </div>
    </div>
  );
};

export default Details;
