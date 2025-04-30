import { FC, useEffect, useMemo } from 'react';
import useFilteredData from '../../hooks/useFilteredData.ts';
import ValidationProvider from '../../contexts/ValidationProvider.tsx';
import MainVocabulary from '../vocabulary/MainVocabulary.tsx';
import { useItems } from '../../hooks/useItems.ts';
import { useSettingsStore } from '../../store/settingsStore.ts';

const VocabularyLevel: FC = () => {
  const { data, loading, error } = useFilteredData('vocabulary');

  const level = useSettingsStore((state) => state.level);

  const params = useMemo(() => ({
    level,
    type: 'vocabulary' as const,
  }), [level]);

  const { data: k } = useItems(params);

  useEffect(() => {
    console.log(k);
  }, [k]);

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
