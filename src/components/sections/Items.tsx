import { FC, useContext } from 'react';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { isKanaVocabulary, isKanji, isVocabulary } from '../../utils/type-check.ts';
import KanjiDetails from '../kanji/KanjiDetails.tsx';
import VocabularyDetails from '../vocabulary/VocabularyDetails.tsx';
import List from '../shared/List.tsx';

const ItemRenderer = () => {
  const { item } = useContext(ValidationContext);

  if (isKanji(item)) {
    return <KanjiDetails />;
  }
  if (isVocabulary(item) || isKanaVocabulary(item)) {
    return <VocabularyDetails />;
  }
};

const Items: FC = () => {
  return (
    <>
      <div className="flex flex-col items-center py-12">
        <div className="w-full">
          <ItemRenderer />
        </div>
      </div>
      <List />
    </>
  );
};

export default Items;
