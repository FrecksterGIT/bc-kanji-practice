import { type FC } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import InfoTable from './InfoTable.tsx';
import { RelatedVocabulary } from './RelatedVocabulary.tsx';
import MarkButton from '../shared/MarkButton.tsx';
import { ProgressBar } from '../shared/ProgressBar.tsx';
import { isKanji } from '../../utils/typeChecks.ts';
import useItems from '../../hooks/useItems.ts';

const KanjiDetails: FC = () => {
  const { item } = useItems();
  const kanji = isKanji(item) ? item : null;

  return (
    kanji && (
      <div className="flex w-full flex-col items-center">
        <div className="relative w-full border-b-2 border-b-pink-400 bg-gray-700 p-8 text-center text-white">
          <span className="text-9xl" lang="ja">
            {kanji.data.characters}
          </span>
          <div className="absolute top-2 right-1">
            <MarkButton />
          </div>
        </div>
        <ProgressBar />
        <div className="my-12 w-full max-w-1/2">
          <KanaInput id="reading" />
        </div>
        <div className="mb-8 w-full">
          <RelatedVocabulary />
        </div>
        <InfoTable />
      </div>
    )
  );
};

export default KanjiDetails;
