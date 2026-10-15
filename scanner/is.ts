export function isDigit(char: string): boolean
{
    return /\d/.test(char);
}

export function isWhitespace(char: string): boolean
{
    if (char.length > 1)
    {
        char = char[0]!;
    }

    if (char === '') return false;

    return ' \s\t\r\n'.includes(char);
}
