import { type FC } from 'react';
import List from './List.tsx';
import Details from './Details.tsx';
import { VocabularyItem } from '../../types';
import { ValidationProvider } from '../../contexts/ValidationProvider.tsx';
import { useFilteredData } from '../../hooks/useFilteredData.ts';

const VocabularyPage: FC = () => {
  const { data, loading, error } = useFilteredData<VocabularyItem>('vocabulary');

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading vocabulary data...</p>}
        {error && <p className="text-red-500">Error loading vocabulary data: {error.message}</p>}
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

export default VocabularyPage;
