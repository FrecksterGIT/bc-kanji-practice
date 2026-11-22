import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { ItemContext, ItemContextType, Section } from "./ItemContext.tsx";
import { isKatakana, toHiragana } from "wanakana";
import { useSelectedItems } from "../hooks/useSelectedItems.ts";
import { isKanaVocabulary, isKanji, isVocabulary } from "../utils/typeChecks.ts";

export const ItemProvider: FC<PropsWithChildren> = ({ children }) => {
  const [section, setSection] = useState<Section>("kanji");
  const { source, data: items } = useSelectedItems(section);
  const [storedIndex, setSelectedIndex] = useState<number>(0);
  // When the shown list shrinks (an item was unmarked in the Marked view) the item that moved
  // into the removed position is the next one; past the end we wrap around to the first.
  const selectedIndex = storedIndex < items.length ? storedIndex : 0;
  const item = useMemo(() => items?.[selectedIndex], [items, selectedIndex]);
  const [answeredIds, setValidItems] = useState<number[]>([]);
  // Ids of items that are no longer in the list must not count towards the progress.
  const validItems = useMemo(() => {
    const ids = new Set(items.map((i) => i.id));
    return answeredIds.filter((id) => ids.has(id));
  }, [answeredIds, items]);
  const isValid = useMemo(() => item && validItems.includes(item.id), [item, validItems]);

  const validValues: string[] = useMemo(() => {
    if (isKanji(item)) {
      return item.data.readings.filter((i) => i.accepted_answer).map((i) => i.reading);
    }

    if (isVocabulary(item)) {
      return item.data.readings
        .filter((i) => i.accepted_answer)
        .reduce<string[]>((r, i) => {
          r.push(i.reading);
          r.push(toHiragana(i.reading));
          if (i.reading.split("").some(isKatakana)) {
            r.push(
              i.reading
                .split("")
                .map((c) => toHiragana(c))
                .join(""),
            );
          }
          return r;
        }, []);
    }

    if (isKanaVocabulary(item)) {
      return [
        item.data.characters
          .split("")
          .map((c) => toHiragana(c))
          .join(""),
      ];
    }

    return [];
  }, [item]);

  const validateInput = useCallback(
    (input: string): boolean => {
      const result = validValues.includes(input);
      if (result) {
        setValidItems((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
      } else {
        setValidItems((prev) => prev.filter((id) => id !== item.id));
      }
      return result;
    },
    [item, validValues],
  );

  const nextValidIndex = useCallback(
    (start: number) => {
      let next = (start + 1) % items.length;
      while (validItems.includes(items[next].id)) {
        next = (next + 1) % items.length;
        if (next === start) {
          return (start + 1) % items.length;
        }
      }
      return next;
    },
    [items, validItems],
  );

  useEffect(() => {
    if (storedIndex !== selectedIndex) {
      setSelectedIndex(selectedIndex);
    }
  }, [storedIndex, selectedIndex]);

  // Only a freshly loaded list starts a new round; removing items from it keeps the progress.
  useEffect(() => {
    if (source.length > 0) {
      setSelectedIndex(0);
      setValidItems([]);
    }
  }, [source]);

  const contextValue: ItemContextType = useMemo(
    () => ({
      items,
      currentItem: item,
      selectedIndex,
      setSelectedIndex,
      validItems,
      validate: validateInput,
      isValid,
      moveToNext: () => {
        setSelectedIndex((prev) => nextValidIndex(prev));
      },
      section,
      setSection,
    }),
    [items, item, selectedIndex, validItems, validateInput, isValid, section, nextValidIndex],
  );

  return <ItemContext value={contextValue}>{children}</ItemContext>;
};
