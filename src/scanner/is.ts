/**
 * Checks if character `char` is a digit. If `char` contains more that 1
 * character, then only first character is checked.
 */
export function isDigit(char: string | null | undefined): boolean
{
    if (char === undefined || char === null) return false;
    if (char.length > 1) char = char[0]!;
    return /\d/.test(char);
}

/**
 * Checks if character `char` is a latin letter. If `char` contains more that
 * 1 character, then only first character is checked.
 */
export function isLetter(char: string | null  | undefined): boolean
{
    if (char === undefined || char === null) return false;
    if (char.length > 1) char = char[0]!;
    return /[a-zA-Z]/i.test(char);
}

/**
 * Checks if character `char` is a whitespace (space, tab, newline, etc.). If
 * `char` contains more that 1 character, then only first character is
 * checked.
 */
export function isWhitespace(char: string | null  | undefined): boolean
{
    if (char === undefined || char === null || char === '') return false;
    if (char.length > 1) char = char[0]!;
    return /\s/.test(char);
}
