import { useContext, useEffect, useMemo, useState } from 'react';
import { ValidationContext } from '../contexts/ValidationContext.tsx';
import { isKanji } from '../utils/type-check.ts';
import { WanikaniVocabularySubject } from '../types';
import { get } from 'idb-keyval';

export const useRelatedVocabulary = () => {
  const { item } = useContext(ValidationContext);
  const [allVocabulary, setAllVocabulary] = useState<WanikaniVocabularySubject[]>([]);

  useEffect(() => {
    get<WanikaniVocabularySubject[]>('vocabulary').then((v) => {
      if (v) {
        setAllVocabulary(v);
      }
    });
  }, []);

  return useMemo(() => {
    if (allVocabulary.length > 0 && isKanji(item)) {
      return item.data.amalgamation_subject_ids
        .map((id) => allVocabulary.find((v) => v.id === id)!)
        .filter(Boolean);
    }
    return [];
  }, [allVocabulary, item]);
};
