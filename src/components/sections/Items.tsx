import { FC, useContext } from 'react';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { isKanaVocabulary, isKanji, isVocabulary } from '../../utils/type-check.ts';
import KanjiDetails from '../kanji/KanjiDetails.tsx';
import VocabularyDetails from '../vocabulary/VocabularyDetails.tsx';
import List from '../shared/List.tsx';

const Items: FC = () => {
  const { item } = useContext(ValidationContext);

  return (
    <>
      <div className="flex flex-col items-center py-12">
        <div className="w-full">
          {isKanji(item) && <KanjiDetails />}
          {(isVocabulary(item) || isKanaVocabulary(item)) && <VocabularyDetails />}
          {!item && <div className="text-center text-2xl">Sorry, couldn't find any items to show.</div>}
        </div>
      </div>
      {item && <List />}
    </>
  );
};

export default Items;
