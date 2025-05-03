import { useEffect, useState } from 'react';
import { isVocabulary } from '../utils/typeChecks.ts';
import { WanikaniKanjiSubject } from '../wanikani';
import { getSubjectByIds } from '../utils/itemDB.ts';
import useItems from './useItems.ts';

function useKanjiComposition() {
  const { item } = useItems();
  const vocabulary = isVocabulary(item) ? item : null;
  const [allKanji, setAllKanji] = useState<WanikaniKanjiSubject[]>([]);

  useEffect(() => {
    if (!vocabulary) {
      setAllKanji([]);
      return;
    }
    getSubjectByIds(vocabulary.data.component_subject_ids).then((k) =>
      setAllKanji(k as WanikaniKanjiSubject[])
    );
  }, [vocabulary]);

  return allKanji;
}

export default useKanjiComposition;
