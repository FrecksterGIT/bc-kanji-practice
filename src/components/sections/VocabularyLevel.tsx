import { FC } from 'react';
import useFilteredData from '../../hooks/useFilteredData.ts';
import ValidationProvider from '../../contexts/ValidationProvider.tsx';
import MainVocabulary from '../vocabulary/MainVocabulary.tsx';

const VocabularyLevel: FC = () => {
  const { data, loading, error } = useFilteredData('vocabulary');

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading vocabulary data...</p>}
        {error && <p className="text-red-500">Error loading vocabulary data: {error.message}</p>}
        {!loading && !error && data && (
          <ValidationProvider items={data}>
            <MainVocabulary />
          </ValidationProvider>
        )}
      </div>
    </div>
  );
};

export default VocabularyLevel;
