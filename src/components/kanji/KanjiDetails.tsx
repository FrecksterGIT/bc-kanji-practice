import { type FC } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import InfoTable from './InfoTable.tsx';
import { RelatedVocabulary } from './RelatedVocabulary.tsx';
import MarkButton from '../shared/MarkButton.tsx';
import { ProgressBar } from '../shared/ProgressBar.tsx';
import { isKanji } from '../../utils/type-check.ts';
import useItems from '../../hooks/useItems.ts';

const KanjiDetails: FC = () => {
  const { item, selectedIndex, items } = useItems();
  const kanji = isKanji(item) ? item : null;

  return (
    kanji && (
      <div className="mb-6">
        <div className="flex flex-col items-center">
          <div className="mb-12">
            {selectedIndex + 1} / {items.length}
          </div>
          <div className="relative w-full border-b-2 border-b-pink-400 bg-gray-700 p-8 text-center text-white">
            <span className="text-9xl">{kanji.data.characters}</span>
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
      </div>
    )
  );
};

export default KanjiDetails;
