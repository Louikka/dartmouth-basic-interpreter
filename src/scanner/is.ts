export function isDigit(char: string): boolean
{
    return /\d/.test(char);
}

export function isLetter(char: string): boolean
{
    return /[a-zA-Z]/i.test(char);
}

export function isWhitespace(char: string): boolean
{
    if (char === '') return false;
    return ' \s\t\r\n'.includes(char);
}
