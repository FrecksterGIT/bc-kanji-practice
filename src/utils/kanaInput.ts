import { toHiragana } from "wanakana";

/**
 * Converts whatever the user typed into hiragana for *submission*.
 *
 * While typing, a trailing raw "n" is left alone (it may become "na", "ni", ...).
 * On submit there is no next keystroke, so a trailing "n" must become "ん";
 * otherwise readings ending in ん (e.g. さん) can never be answered with "san".
 */
export const toSubmittedReading = (input: string): string => {
  const converted = toHiragana(input, { customKanaMapping: { nn: "ん" } });
  return converted.endsWith("n") ? `${converted.slice(0, -1)}ん` : converted;
};
