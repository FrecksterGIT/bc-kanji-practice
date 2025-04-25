import { type FC } from 'react';
import List from './List.tsx';
import Details from './Details.tsx';
import { ValidationProvider } from '../../contexts/ValidationProvider.tsx';
import { useFilteredData } from '../../hooks/useFilteredData.ts';

const KanjiPage: FC = () => {
  const { data, loading, error } = useFilteredData('kanji');

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading kanji data...</p>}
        {error && <p className="text-red-500">Error loading kanji data: {error.message}</p>}
        {!loading && !error && data && (
          <ValidationProvider items={data}>
            <Details />
            <List />
          </ValidationProvider>
        )}
      </div>
    </div>
  );
};

export default KanjiPage;
