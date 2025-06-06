import { useEffect, useState } from 'react';
import { WanikaniVocabularySubject } from '../wanikani';
import { isKanji } from '../utils/typeChecks.ts';
import { getSubjectByIds } from '../utils/itemDB.ts';
import { useItems } from './useItems.ts';
import { useSession } from './useSession.ts';

export const useRelatedVocabulary = () => {
  const { currentItem } = useItems();
  const [allVocabulary, setAllVocabulary] = useState<WanikaniVocabularySubject[]>([]);
  const { limitToCurrentLevel, user } = useSession();

  useEffect(() => {
    if (!isKanji(currentItem)) {
      setAllVocabulary([]);
      return;
    }
    getSubjectByIds(currentItem.data.amalgamation_subject_ids).then((k) =>
      setAllVocabulary(
        (k as WanikaniVocabularySubject[])
          .toSorted((a, b) => a.data.level - b.data.level)
          .filter((a) => !limitToCurrentLevel || a.data.level <= user!.level)
      )
    );
  }, [currentItem, limitToCurrentLevel, user]);

  return allVocabulary;
};
