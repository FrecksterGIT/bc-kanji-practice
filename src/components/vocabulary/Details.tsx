import { type FC, useContext } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import Info from './Info.tsx';
import { VocabularyItem } from '../../types';
import useSession from '../../hooks/useSession.ts';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import MarkButton from '../shared/MarkButton.tsx';

const Details: FC = () => {
  const { speak } = useSession();
  const { isValid, item, selectedIndex: position, items } = useContext(ValidationContext);
  const vocabulary = item as VocabularyItem;

  return (
    <div className="mb-6">
      <div className="flex flex-col items-center">
        <div className="mb-12">
          {position + 1} / {items.length}
        </div>
        <div className="relative mb-12 p-8 w-full text-center bg-gray-700 border-b-purple-400 border-b-2 text-white">
          <button className="text-9xl cursor-pointer" onClick={() => speak(vocabulary.word)}>
            {vocabulary.word}
          </button>
          <div className="absolute top-0 right-0">
            <MarkButton />
          </div>
        </div>
        <div className="w-full max-w-1/2 mb-12">
          <KanaInput id="reading" />
        </div>
        <Info vocabulary={vocabulary} isValid={isValid} />
      </div>
    </div>
  );
};

export default Details;
