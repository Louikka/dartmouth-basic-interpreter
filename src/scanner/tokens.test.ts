import { describe, expect, test } from 'vitest';

import { Token, TokenString } from './tokens';


class TokenTest extends Token
{
    constructor(public value: any,
                public pos: number,
                public literal: string)
    {
        super();
    }
}


describe('Token.toString() should strinfify value correctly', () =>
{
    test.for([
        { v: '', expected: '' },
        { v: '1', expected: '1' },
        { v: 'abc', expected: 'abc' },
        { v: 123, expected: '123' },
        { v: 12.34, expected: '12.34' },
        { v: null, expected: 'null' },
        { v: undefined, expected: 'undefined' },
    ])(`"$v" => "$expected"`, ({ v, expected }) =>
    {
        const t = new TokenTest(v, 0, '');
        expect(t.toString()).toBe(expected);
    });

    test('special case for TokenString', () =>
    {
        const t = new TokenString('i am a test string', 0, '');
        expect(t.toString()).toBe('"i am a test string"');
    });
});
