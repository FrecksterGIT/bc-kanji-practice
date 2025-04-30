import { FC, useContext, useEffect } from 'react';
import ValidationProvider from '../../contexts/ValidationProvider.tsx';
import MainKanji from '../kanji/MainKanji.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import MainVocabulary from '../vocabulary/MainVocabulary.tsx';
import useMarkedItems from '../../hooks/useMarkedItems.ts';
import { useItems } from '../../hooks/useItems.ts';
import { isKanaVocabulary, isKanji, isVocabulary } from '../../utils/type-check.ts';

const ItemRenderer = () => {
  const { item } = useContext(ValidationContext);

  if (!item) return null;
  if ('kanji' in item) {
    return <MainKanji />;
  }
  return <MainVocabulary />;
};

const MarkedItems: FC = () => {
  const { data, loading, error } = useMarkedItems();
  const { data: d1 } = useItems();

  useEffect(() => {
    if (d1) {
      d1.forEach((item) => {
        if (isKanji(item)) {
          console.log('Kanji', item.data.characters);
        }
        if (isVocabulary(item)) {
          console.log('Vocabulary', item.data.characters);
        }
        if (isKanaVocabulary(item)) {
          console.log('KanaVocabulary', item.data.characters);
        }
      });
    }
  }, [d1]);

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading kanji data...</p>}
        {error && <p className="text-red-500">Error loading kanji data: {error.message}</p>}
        {!loading && !error && data.length === 0 && <p>No marked items found.</p>}
        {!loading && !error && data && (
          <ValidationProvider items={data}>
            <ItemRenderer />
          </ValidationProvider>
        )}
      </div>
    </div>
  );
};

export default MarkedItems;
