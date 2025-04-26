import { KanjiItem, MarkedItem, VocabularyItem } from '../types';
import { loadDataFile } from '../utils/dataLoader.ts';
import { useLocalStorage } from 'usehooks-ts';
import { useCallback, useEffect, useMemo, useState } from 'react';

type UseMarkedItemsReturnType = {
  data: Array<KanjiItem | VocabularyItem>;
  loading: boolean;
  error: Error | null;
};
type FileList = {
  type: 'kanji' | 'vocabulary';
  level: number;
};
const useMarkedItems = (): UseMarkedItemsReturnType => {
  const [data, setData] = useState<Array<KanjiItem | VocabularyItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [markedItems] = useLocalStorage<MarkedItem[]>('markedItems', []);

  const fileList = useMemo(
    () =>
      markedItems.reduce<FileList[]>((acc, item) => {
        if (!acc.some((file) => file.type === item.type && file.level === item.level)) {
          acc.push({
            type: item.type,
            level: item.level,
          });
        }
        return acc;
      }, []),
    [markedItems]
  );

  const filterData = useCallback(
    (data: Array<KanjiItem | VocabularyItem>) => {
      return data.filter((item) => markedItems.find((marked) => marked.id === item.id));
    },
    [markedItems]
  );

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const dataPromises = fileList.map((file) => loadDataFile(file.type, file.level));
        const data = await Promise.all(dataPromises);
        const allData = filterData(data.flat());
        setData(allData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    if (fileList.length > 0) {
      loadFiles().then();
    } else {
      setData([]);
    }
  }, [fileList, filterData, markedItems]);

  return {
    data,
    loading,
    error,
  };
};

export default useMarkedItems;
