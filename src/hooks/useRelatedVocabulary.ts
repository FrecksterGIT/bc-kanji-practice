import { useContext, useEffect, useState } from 'react';
import { ValidationContext } from '../contexts/ValidationContext.tsx';
import { isKanji } from '../utils/type-check.ts';
import { WanikaniVocabularySubject } from '../types';
import { getSubjectByIds } from '../utils/db/db.ts';

export const useRelatedVocabulary = () => {
  const { item } = useContext(ValidationContext);
  const [allVocabulary, setAllVocabulary] = useState<WanikaniVocabularySubject[]>([]);

  useEffect(() => {
    if (!isKanji(item)) {
      return;
    }
    getSubjectByIds(item.data.amalgamation_subject_ids).then((k) =>
      setAllVocabulary(
        (k as WanikaniVocabularySubject[]).toSorted((a, b) => a.data.level - b.data.level)
      )
    );
  }, [item]);

  return allVocabulary;
};
