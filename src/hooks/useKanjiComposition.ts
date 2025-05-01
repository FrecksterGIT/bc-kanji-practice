import { useContext, useEffect, useMemo, useState } from 'react';
import { ValidationContext } from '../contexts/ValidationContext.tsx';
import { isVocabulary } from '../utils/type-check.ts';
import { WanikaniKanjiSubject } from '../types';
import { get } from 'idb-keyval';

function useKanjiComposition() {
  const { item } = useContext(ValidationContext);
  const vocabulary = isVocabulary(item) ? item : null;
  const [allKanji, setAllKanji] = useState<WanikaniKanjiSubject[]>([]);

  useEffect(() => {
    get<WanikaniKanjiSubject[]>('kanji').then((v) => {
      if (v) {
        setAllKanji(v);
      }
    });
  }, []);

  return useMemo(() => {
    if (allKanji.length > 0 && vocabulary) {
      return vocabulary.data.component_subject_ids
        .map((id) => allKanji.find((k) => k.id === id)!)
        .filter(Boolean);
    }
    return [];
  }, [allKanji, vocabulary]);
}

export default useKanjiComposition;
