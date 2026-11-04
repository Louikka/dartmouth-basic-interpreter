import { expect, test } from 'vitest';

import { isDigit, isLetter, isWhitespace } from './is';


function _constructDigitLiterals()
{
    const r = [];
    for (let i = 0; i < 10; i++)
    {
        r.push({
            char: String(i),
            expected: true,
        });
    }

    return r;
}

test.for([
    ..._constructDigitLiterals(),
    { char: 'a', expected: false },
    { char: 'B', expected: false },
    { char: '123', expected: true },
    { char: 'abc', expected: false },
])(`isDigit($char) => $expected`, ({ char, expected }) =>
{
    expect(isDigit(char)).toBe(expected);
});

test.for([
    { char: 'a', expected: true },
    { char: 'B', expected: true },
    { char: 'Й', expected: false },
    { char: 'な', expected: false },
    { char: '0', expected: false },
    { char: 'abc', expected: true },
    { char: '123', expected: false },
    { char: '123abc', expected: false },
    { char: 'abc123', expected: true },
])(`isLetter($char) => $expected`, ({ char, expected }) =>
{
    expect(isLetter(char)).toBe(expected);
});

test.for([
    { char: ' ', expected: true },
    { char: '\t', expected: true },
    { char: '\v', expected: true },
    { char: '\x0B', expected: true }, // vertical tab
    { char: '\n', expected: true },
    { char: '\r', expected: true },
    { char: 'a', expected: false },
    { char: '1', expected: false },
    { char: 'B ', expected: false },
    { char: '\\\t', expected: false },
])(`isWhitespace($char) => $expected`, ({ char, expected }) =>
{
    expect(isWhitespace(char)).toBe(expected);
});
