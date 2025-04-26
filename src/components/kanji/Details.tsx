import { type FC, useContext } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import Info from './Info.tsx';
import { RelatedVocabularyList } from './RelatedVocabularyList.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { KanjiItem } from '../../types';
import MarkButton from '../shared/MarkButton.tsx';

const Details: FC = () => {
  const { isValid, item, selectedIndex: position, items } = useContext(ValidationContext);
  const kanji = item as KanjiItem;

  return (
    <div className="mb-6">
      <div className="flex flex-col items-center">
        <div className="mb-12">
          {position + 1} / {items.length}
        </div>
        <div className="relative mb-12 p-8 w-full text-center bg-gray-700 border-b-pink-400 border-b-2 text-white">
          <span className="text-9xl">{kanji.kanji}</span>
          <div className="absolute top-2 right-1">
            <MarkButton />
          </div>
        </div>
        <div className="w-full max-w-1/2 mb-12">
          <KanaInput id="reading" />
        </div>
        <div className="mb-8 w-full">
          <RelatedVocabularyList relatedVocabulary={kanji.vocabulary} />
        </div>
        <Info kanji={kanji} isValid={isValid} />
      </div>
    </div>
  );
};

export default Details;
