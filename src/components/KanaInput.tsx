import {useState, useEffect, ChangeEvent, forwardRef, useCallback, useMemo} from 'react';
import {isKatakana, toHiragana} from 'wanakana';
import {Correct} from "./icons/Correct.tsx";

interface KanaInputProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
    name?: string;
    validValues?: string[];
    onValidate?: (isValid: boolean) => void;
}

/**
 * KanaInput component that automatically converts romaji input to hiragana
 * using the wanakana library.
 */
const KanaInput = forwardRef<HTMLInputElement, KanaInputProps>(({
                                                                    value: externalValue,
                                                                    onChange,
                                                                    placeholder = 'Enter text...',
                                                                    className = '',
                                                                    id,
                                                                    name,
                                                                    validValues,
                                                                    onValidate,
                                                                }, ref) => {
    const validHiraganaValues = useMemo(() => {
        if (!validValues || validValues.length === 0) return [];
        return validValues.reduce<string[]>((acc, value) => {
            acc.push(value);

            const containsKatakana = value.split("").some(isKatakana);
            if (containsKatakana) {
                acc.push(value.split("").map(c => toHiragana(c)).join(""));
            }
            acc.push(toHiragana(value));
            return acc;
        }, []);
    }, [validValues])

    // Internal state to handle controlled/uncontrolled component
    const [internalValue, setInternalValue] = useState<string>(externalValue ?? '');
    // State for validation status
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Validate the input value
    const validateInput = (value: string) => {
        if (!validHiraganaValues || validHiraganaValues.length === 0) {
            return null; // No validation needed
        }

        const valid = validHiraganaValues.includes(value);
        setIsValid(valid);

        // Call the onValidate handler if provided
        if (onValidate) {
            onValidate(valid);
        }

        return valid;
    };

    // Sync with external value if provided
    useEffect(() => {
        if (externalValue !== undefined && externalValue !== internalValue) {
            setInternalValue(externalValue);
            validateInput(externalValue);
        }
    }, [externalValue, validHiraganaValues]);

    useEffect(() => {
        setIsValid(null)
    }, [validHiraganaValues]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Check if the input ends with "n" or "ny" but not "nn"
        const shouldNotConvert = (input.endsWith("n") || input.endsWith("ny")) && !input.endsWith("nn");

        // Convert input to hiragana with custom mapping for "nn" only if the condition is false
        const convertedInput = shouldNotConvert
            ? input
            : toHiragana(input, {
                customKanaMapping: {nn: "ん"}
            });

        // Update the internal value
        setInternalValue(convertedInput);

        // Validate the input
        validateInput(convertedInput);

        // Call the onChange handler if provided
        if (onChange) {
            onChange(convertedInput);
        }
    };

    // Determine border color based on validation status
    const getBorderColorClass = useCallback(() => {
        if (isValid === null || !internalValue) return 'border-gray-600'; // Default
        return isValid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500'; // Valid or Invalid
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
            {isValid && <span
                className="absolute h-full top-0 right-2 grid items-center pointer-events-none"><Correct/></span>}
        </div>
    );
});

export default KanaInput;
