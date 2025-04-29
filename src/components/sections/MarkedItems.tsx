import { FC, useContext, useEffect } from 'react';
import ValidationProvider from '../../contexts/ValidationProvider.tsx';
import MainKanji from '../kanji/MainKanji.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import MainVocabulary from '../vocabulary/MainVocabulary.tsx';
import useMarkedItems from '../../hooks/useMarkedItems.ts';
import { WanikaniProvider } from '../../contexts/WanikaniProvider.tsx';
import { ResourceType, WanikaniContext } from '../../contexts/WanikaniContext.ts';

const ItemRenderer = () => {
  const { load } = useContext(WanikaniContext);
  const { item } = useContext(ValidationContext);

  useEffect(() => {
    load(ResourceType.assignments).then();
  }, [load]);

  if (!item) return null;
  if ('kanji' in item) {
    return <MainKanji />;
  }
  return <MainVocabulary />;
};

const MarkedItems: FC = () => {
  const { data, loading, error } = useMarkedItems();

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading kanji data...</p>}
        {error && <p className="text-red-500">Error loading kanji data: {error.message}</p>}
        {!loading && !error && data.length === 0 && <p>No marked items found.</p>}
        {!loading && !error && data && (
          <WanikaniProvider>
            <ValidationProvider items={data}>
              <ItemRenderer />
            </ValidationProvider>
          </WanikaniProvider>
        )}
      </div>
    </div>
  );
};

export default MarkedItems;
