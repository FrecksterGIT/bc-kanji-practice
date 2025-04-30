import { FC, useEffect, useMemo } from 'react';
import useFilteredData from '../../hooks/useFilteredData.ts';
import ValidationProvider from '../../contexts/ValidationProvider.tsx';
import MainKanji from '../kanji/MainKanji.tsx';
import { useSettingsStore } from '../../store/settingsStore.ts';
import { useItems } from '../../hooks/useItems.ts';

const KanjiLevel: FC = () => {
  const { data, loading, error } = useFilteredData('kanji');

  const level = useSettingsStore((state) => state.level);

  const params = useMemo(() => ({
    level,
    type: 'kanji' as const,
  }), [level]);

  const { data: k } = useItems(params);

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
