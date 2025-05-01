import { useContext, useEffect, useState } from 'react';
import { ValidationContext } from '../contexts/ValidationContext.tsx';
import { isKanji } from '../utils/type-check.ts';
import { WanikaniVocabularySubject } from '../types';
import { subjectDB } from '../utils/db';

export const useRelatedVocabulary = () => {
  const { item } = useContext(ValidationContext);
  const [allVocabulary, setAllVocabulary] = useState<WanikaniVocabularySubject[]>([]);

  useEffect(() => {
    if (!isKanji(item)) {
      return;
    }
    subjectDB
      .getByIds(item.data.amalgamation_subject_ids)
      .then((k) =>
        setAllVocabulary(
          (k as WanikaniVocabularySubject[]).toSorted((a, b) => a.data.level - b.data.level)
        )
      );
  }, [item]);

  return allVocabulary;
};
