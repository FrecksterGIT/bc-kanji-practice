import { FC, useEffect } from 'react';
import useFilteredData from '../../hooks/useFilteredData.ts';
import ValidationProvider from '../../contexts/ValidationProvider.tsx';
import MainKanji from '../kanji/MainKanji.tsx';
import { useItems } from '../../hooks/useItems.ts';

const KanjiLevel: FC = () => {
  const { data, loading, error } = useFilteredData('kanji');

  const { data: k } = useItems();

  useEffect(() => {
    console.log(k);
  }, [k]);

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading kanji data...</p>}
        {error && <p className="text-red-500">Error loading kanji data: {error.message}</p>}
        {!loading && !error && data && (
          <ValidationProvider items={data}>
            <MainKanji />
          </ValidationProvider>
        )}
      </div>
    </div>
  );
};

export default KanjiLevel;
