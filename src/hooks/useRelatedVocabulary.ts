import { useEffect, useState } from 'react';
import { isKanji } from '../utils/type-check.ts';
import { WanikaniVocabularySubject } from '../types';
import { getSubjectByIds } from '../utils/data/db.ts';
import { useSettingsStore } from '../store/settingsStore.ts';
import useSession from './useSession.ts';
import useItems from './useItems.ts';

export const useRelatedVocabulary = () => {
  const { item } = useItems();
  const [allVocabulary, setAllVocabulary] = useState<WanikaniVocabularySubject[]>([]);
  const limitToCurrentLevel = useSettingsStore((store) => store.limitToCurrentLevel);
  const { user } = useSession();

  useEffect(() => {
    if (!isKanji(item)) {
      return;
    }
    getSubjectByIds(item.data.amalgamation_subject_ids).then((k) =>
      setAllVocabulary(
        (k as WanikaniVocabularySubject[])
          .toSorted((a, b) => a.data.level - b.data.level)
          .filter((a) => !limitToCurrentLevel || a.data.level <= user!.level)
      )
    );
  }, [item, limitToCurrentLevel, user]);

  return allVocabulary;
};
