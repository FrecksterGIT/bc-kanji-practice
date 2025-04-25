import { useState, ChangeEvent, useCallback, useContext, useEffect, FC, useRef } from 'react';
import { toHiragana } from 'wanakana';
import { Correct } from './icons/Correct.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';

interface KanaInputProps {
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

/**
 * KanaInput component that automatically converts romaji input to hiragana
 * using the wanakana library.
 */
const KanaInput: FC<KanaInputProps> = ({
  placeholder = 'Type the reading in hiragana...',
  className = '',
  id,
  name,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const { validate, item, isValid } = useContext(ValidationContext);
  const [internalValue, setInternalValue] = useState<string>('');

  useEffect(() => {
    setInternalValue('');
    ref.current?.focus();
  }, [item]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    const shouldNotConvert = (input.endsWith('n') || input.endsWith('ny')) && !input.endsWith('nn');

    const convertedInput = shouldNotConvert
      ? input
      : toHiragana(input, {
          customKanaMapping: { nn: 'ん' },
        });

    setInternalValue(convertedInput);
    validate(convertedInput);
  };

  const getBorderColorClass = useCallback(() => {
    if (isValid === null || !internalValue) return 'border-gray-600'; // Default
    return isValid
      ? 'border-green-500 focus:border-green-500'
      : 'border-red-500 focus:border-red-500'; // Valid or Invalid
  }, [isValid, internalValue]);

  return (
    <div className="relative">
      <input
        type="text"
        value={internalValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md focus-visible:outline-none text-4xl p-2 border bg-gray-700 ${getBorderColorClass()} ${className}`}
        id={id}
        name={name}
        ref={ref}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {isValid && (
        <span className="absolute h-full top-0 right-2 grid items-center pointer-events-none">
          <Correct />
        </span>
      )}
    </div>
  );
};

export default KanaInput;
