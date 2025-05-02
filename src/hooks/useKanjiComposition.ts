import { useEffect, useState } from 'react';
import { isVocabulary } from '../utils/type-check.ts';
import { WanikaniKanjiSubject } from '../types';
import { getSubjectByIds } from '../utils/data/db.ts';
import useItems from './useItems.ts';

function useKanjiComposition() {
  const { item } = useItems();
  const vocabulary = isVocabulary(item) ? item : null;
  const [allKanji, setAllKanji] = useState<WanikaniKanjiSubject[]>([]);

  useEffect(() => {
    if (!vocabulary) {
      return;
    }
    getSubjectByIds(vocabulary.data.component_subject_ids).then((k) =>
      setAllKanji(k as WanikaniKanjiSubject[])
    );
  }, [vocabulary]);

  return allKanji;
}

export default useKanjiComposition;
