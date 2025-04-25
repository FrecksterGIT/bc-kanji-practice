import { type FC, useContext } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import Info from './Info.tsx';
import { VocabularyItem } from '../../types';
import { useSession } from '../../hooks/useSession.ts';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

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
        <button
          className="text-9xl mb-12 p-8 w-full text-center bg-gray-700 border-b-purple-400 border-b-2 text-white cursor-pointer"
          onClick={() => speak(vocabulary.word)}
        >
          {vocabulary.word}
        </button>
        <div className="w-full max-w-1/2 mb-12">
          <KanaInput id="reading" />
        </div>
        <Info vocabulary={vocabulary} isValid={isValid} />
      </div>
    </div>
  );
};

export default Details;
