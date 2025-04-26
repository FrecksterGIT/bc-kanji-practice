import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { KanjiItem, ValidationContextType, VocabularyItem } from '../types';
import { ValidationContext } from './ValidationContext.tsx';
import { isKatakana, toHiragana } from 'wanakana';

type ValidationProviderProps = PropsWithChildren<{
  items: Array<KanjiItem | VocabularyItem>;
}>;

const ValidationProvider: FC<ValidationProviderProps> = ({ items, children }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const item = useMemo(() => items?.[selectedIndex], [items, selectedIndex]);
  const [validItems, setValidItems] = useState<number[]>([]);
  const isValid = useMemo(() => item && validItems.includes(item.id), [item, validItems]);

  const validValues: string[] = useMemo(() => {
    if (!item) return [];

    if ('onyomi' in item) {
      const validOnyomi = item.onyomi
        .filter((reading) => reading.accepted_answer)
        .map((reading) => reading.reading);

      const validKunyomi = item.kunyomi
        .filter((reading) => reading.accepted_answer)
        .map((reading) => reading.reading);

      return [...validOnyomi, ...validKunyomi];
    }

    return item.reading
      .map((reading) => reading.reading)
      .reduce<string[]>((acc, value) => {
        acc.push(value);

        const containsKatakana = value.split('').some(isKatakana);
        if (containsKatakana) {
          acc.push(
            value
              .split('')
              .map((c) => toHiragana(c))
              .join('')
          );
        }
        acc.push(toHiragana(value));
        return acc;
      }, []);
  }, [item]);

  const validateInput = useCallback(
    (input: string): boolean => {
      const result = validValues.includes(input);
      if (result) {
        setValidItems((prev) => [...prev, item.id]);
      } else {
        setValidItems((prev) => prev.filter((id) => id !== item.id));
      }
      return result;
    },
    [item, validValues]
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
    [items, validItems]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowLeft':
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          if (isValid) {
            setSelectedIndex((prev) => nextValidIndex(prev));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isValid, items, nextValidIndex]);

  useEffect(() => {
    if (items && items.length > 0) {
      setSelectedIndex(0);
    }
  }, [items]);

  const contextValue: ValidationContextType = useMemo(
    () => ({
      items,
      item,
      selectedIndex,
      setSelectedIndex,
      validItems,
      validate: validateInput,
      isValid,
    }),
    [items, item, selectedIndex, validItems, validateInput, isValid]
  );

  return <ValidationContext value={contextValue}>{children}</ValidationContext>;
};

export default ValidationProvider;
