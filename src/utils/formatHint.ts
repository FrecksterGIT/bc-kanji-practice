import { isJapanese } from 'wanakana';

const TAG_REPLACEMENTS: Record<string, string> = {
  reading: 'bg-gray-500',
  kanji: 'bg-pink-500',
  radical: 'bg-blue-300',
  vocabulary: 'bg-purple-500',
};

const isInsideTag = (text: string, index: number) => {
  return text.substring(0, index).split('>').length % 2 === 0;
};

export const formatHint = (hint: string | null) => {
  if (!hint) return '';

  const markedSpecialText = hint
    .split('')
    .map((char, index) => {
      if (isJapanese(char) && !isInsideTag(hint, index)) {
        return `<span class='font-semibold text-gray-300'>${char}</span>`;
      }
      return char;
    })
    .join('')
    .replace(/(\n)+/g, '<br />')
    .replace(/rendaku/gi, "<span class='text-gray-300'>rendaku</span>");

  return Object.entries(TAG_REPLACEMENTS).reduce<string>((acc, [tag, bgColor]) => {
    const openTag = `<${tag}>`;
    const openTagReplace = `<mark class='${bgColor} text-gray-900 px-1 rounded-sm mx-1'>`;
    const closeTag = `</${tag}>`;
    const closeTagReplace = `</mark>`;
    return acc.replaceAll(openTag, openTagReplace).replaceAll(closeTag, closeTagReplace);
  }, markedSpecialText);
};
