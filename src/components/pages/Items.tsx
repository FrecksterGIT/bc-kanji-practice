import { FC, useCallback, useEffect, useState } from 'react';
import { isKanaVocabulary, isKanji, isVocabulary } from '../../utils/typeChecks.ts';
import { KanjiDetails } from '../kanji/KanjiDetails.tsx';
import { VocabularyDetails } from '../vocabulary/VocabularyDetails.tsx';
import { useItems } from '../../hooks/useItems.ts';
import { Section } from '../../contexts/ItemContext.tsx';
import { AngleDown } from '../shared/icons/AngleDown.tsx';
import { List } from '../shared/List.tsx';
import useGlobalEvent from 'beautiful-react-hooks/useGlobalEvent';

type ItemsProps = {
  section: Section;
};

export const Items: FC<ItemsProps> = ({ section }) => {
  const { setSection, currentItem, selectedIndex, setSelectedIndex, items } = useItems();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSection(section);
  }, [section, setSection]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const onKeyDown = useGlobalEvent<KeyboardEvent>('keydown');
  onKeyDown((e) => {
    if (items.length > 0) {
      switch (e.key) {
        case 'a': {
          if (e.altKey) {
            e.preventDefault();
            toggle();
          }
          break;
        }
        case 'ArrowRight':
          if (!open) setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowLeft':
          if (!open) setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
      }
    }
  });

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        <div className="flex flex-col items-center">
          {items.length > 0 && (
            <div className="mb-12 flex items-center gap-2">
              <span>
                {selectedIndex + 1} / {items.length}
              </span>
              <button onClick={toggle} className="cursor-pointer" title="Show list of items">
                <AngleDown />
              </button>
              {open && <List onClose={toggle} />}
            </div>
          )}
          {isKanji(currentItem) && <KanjiDetails />}
          {(isVocabulary(currentItem) || isKanaVocabulary(currentItem)) && <VocabularyDetails />}
          {!currentItem && (
            <div className="text-center text-2xl">Sorry, couldn't find any items to show.</div>
          )}
        </div>
      </div>
    </div>
  );
};
