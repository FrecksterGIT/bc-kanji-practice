import { useState, ChangeEvent, useCallback, useEffect, FC, useRef, FormEventHandler } from 'react';
import { toHiragana } from 'wanakana';
import { Correct } from './icons/Correct.tsx';
import useItems from '../../hooks/useItems.ts';

interface KanaInputProps {
  placeholder?: string;
  id?: string;
  name?: string;
}

const KanaInput: FC<KanaInputProps> = ({
  placeholder = 'Type the reading in hiragana...',
  id,
  name,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const { validate, item, isValid, moveToNext } = useItems();
  const [validationFeedback, setValidationFeedback] = useState(0);
  const [internalValue, setInternalValue] = useState<string>('');

  useEffect(() => {
    setInternalValue('');
    setValidationFeedback(0);
    ref.current?.focus();
  }, [item]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    const shouldNotConvert = (input.endsWith('n') || input.endsWith('ny')) && !input.endsWith('nn');

    const convertedInput = shouldNotConvert
      ? input
      : toHiragana(input, {
          customKanaMapping: { nn: 'ん' },
        });

    setInternalValue(convertedInput);
    setValidationFeedback(0);
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      const result = validate(internalValue);
      if (validationFeedback === 2) {
        moveToNext();
      } else {
        setValidationFeedback(result ? 2 : 1);
      }
    },
    [internalValue, moveToNext, validate, validationFeedback]
  );

  const getBorderColorClass = useCallback(() => {
    switch (validationFeedback) {
      case 1:
        return 'border-red-500 focus:border-red-500';
      case 2:
        return 'border-green-500 focus:border-green-500';
      default:
        return 'border-gray-600';
    }
  }, [validationFeedback]);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md focus-visible:outline-none text-4xl p-2 border bg-gray-700 ${getBorderColorClass()}`}
          id={id}
          name={name}
          ref={ref}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </form>
      {isValid && (
        <span className="absolute h-full top-0 right-2 grid items-center pointer-events-none">
          <Correct />
        </span>
      )}
    </div>
  );
};

export default KanaInput;
