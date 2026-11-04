import { isDigit } from './is';


export function splitAtIndex(s: string, i: number): [string, string]
{
    return [s.slice(0, i), s.slice(i)];
}


export function parseNumber(s: string): [number, string]
{
    const _isE = (char?: string): boolean =>
    {
        return char !== undefined && char.toUpperCase() === 'E';
    };

    let ifFloat = false;
    let isScientific = false;

    let i = 0;
    for (; i < s.length; i++)
    {
        const char = s[i]!;
        const after = s[i + 1];
        const before = s[i - 1];

        if (char === '.')
        {
            if (ifFloat)
            {
                break;
            }
            else
            {
                ifFloat = true;
                continue;
            }
        }

        if (_isE(char) && (after === '-' || isDigit(after)))
        {
            if (isScientific) break;

            isScientific = true;
            continue;
        }

        if (char === '-' && isScientific && _isE(before))
        {
            continue;
        }

        if (!isDigit(char))
        {
            break;
        }
    }

    const n = s.slice(0, i);
    const rest =  s.slice(i);

    return [Number(n), rest];
}

export function parseString(s: string): [string, string]
{
    return ['', ''];
}
