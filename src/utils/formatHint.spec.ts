import { describe, expect, it } from 'vitest';
import { formatHint } from './formatHint.ts';

describe('formatHint', () => {
  it('should format hints correctly', () => {
    const hint =
      'Hint with <reading>にほんご</reading> and <kanji>日本語</kanji>. Some more japanese (日本語) text.';
    const formattedHint = formatHint(hint);
    expect(formattedHint).toContain(
      "<mark class='bg-gray-500 text-gray-800 px-1 rounded-sm mx-1'>にほんご</mark>"
    );
    expect(formattedHint).toContain(
      "<span class='font-semibold text-gray-300'>本</span>"
    );
  });

  it('should highlight the word rendaku', () => {
    const hint = 'This is a rendaku test.';
    const formattedHint = formatHint(hint);
    expect(formattedHint).toContain(
      "<span class='text-gray-300'>rendaku</span>"
    );
  });

  it('should handle null hints', () => {
    const formattedHint = formatHint(null);
    expect(formattedHint).toBe('');
  });
});
