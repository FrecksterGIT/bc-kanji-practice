import { useContext, useEffect, useState } from 'react';
import { ValidationContext } from '../contexts/ValidationContext.tsx';
import { isVocabulary } from '../utils/type-check.ts';
import { WanikaniKanjiSubject } from '../types';
import { subjectDB } from '../utils/db';

function useKanjiComposition() {
  const { item } = useContext(ValidationContext);
  const vocabulary = isVocabulary(item) ? item : null;
  const [allKanji, setAllKanji] = useState<WanikaniKanjiSubject[]>([]);

  useEffect(() => {
    if (!vocabulary) {
      return;
    }
    subjectDB
      .getByIds(vocabulary.data.component_subject_ids)
      .then((k) => setAllKanji(k as WanikaniKanjiSubject[]));
  }, [vocabulary]);

  return allKanji;
}

export default useKanjiComposition;
