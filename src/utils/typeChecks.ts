import {
  WanikaniAssignment,
  WanikaniKanaVocabularySubject,
  WanikaniKanjiSubject,
  WanikaniSubject,
  WanikaniVocabularySubject,
} from '../wanikani';

function hasObjectField(item: unknown): item is { object: string } {
  return typeof item === 'object' && item !== null && 'object' in item;
}

export function isKanji(item?: unknown): item is WanikaniKanjiSubject {
  return hasObjectField(item) && item.object === 'kanji';
}

export function isVocabulary(item?: unknown): item is WanikaniVocabularySubject {
  return hasObjectField(item) && item.object === 'vocabulary';
}

export function isKanaVocabulary(item?: unknown): item is WanikaniKanaVocabularySubject {
  return hasObjectField(item) && item.object === 'kana_vocabulary';
}

export function isSubject(item?: unknown): item is WanikaniSubject {
  return (
    hasObjectField(item) &&
    ['kanji', 'vocabulary', 'kana_vocabulary'].includes((item as WanikaniSubject).object)
  );
}

export function isSubjectList(item?: unknown): item is WanikaniSubject[] {
  return Array.isArray(item) && item.every(isSubject);
}

export function isAssignment(item?: unknown): item is WanikaniAssignment {
  return hasObjectField(item) && item.object === 'assignment';
}

export function isAssignmentList(item?: unknown): item is WanikaniAssignment[] {
  return Array.isArray(item) && item.every(isAssignment);
}
