import { expect, test } from 'vitest';

import { scanLine, Scanner } from './scanner';
import { TokenNumber, TokenOperator, TokenPunctuation, TokenString, TokenWord } from './tokens';


test.for([
    {
        v: 'A',
        expected: { value: 'A', type: 'VARIABLE' },
    },
    {
        v: 'A1',
        expected: { value: 'A1', type: 'VARIABLE' },
    },
    {
        v: 'B = 0',
        expected: { value: 'B', type: 'VARIABLE' },
    },
    {
        v: 'B1PRINT',
        expected: { value: 'B1', type: 'VARIABLE' },
    },
    {
        v: 'COS',
        expected: { value: 'COS', type: 'FUNCTION' },
    },
    {
        v: 'SQRT',
        expected: { value: 'SQR', type: 'FUNCTION' },
    },
    {
        v: 'PRINT',
        expected: { value: 'PRINT', type: 'KEYWORD' },
    },
    {
        v: 'IFTHEN',
        expected: { value: 'IF', type: 'KEYWORD' },
    },
])('Scanner(`$v`).readWord() => `$expected`', ({ v, expected }) =>
{
    const sc = new Scanner(v)
    const read = sc.readWord();

    expect(read).toBeInstanceOf(TokenWord);
    expect(read.value).toBe(expected.value);
    expect(read.type).toBe(expected.type);
});

test.for([
    { v: '+', expected: '+' },
    { v: '-', expected: '-' },
    { v: '*', expected: '*' },
    { v: '/', expected: '/' },
    { v: '^', expected: '^' },
    { v: '<', expected: '<' },
    { v: '>', expected: '>' },
    { v: '=', expected: '=' },
    { v: '<=', expected: '<=' },
    { v: '>=', expected: '>=' },
    { v: '<>', expected: '<>' },
    { v: '>=<', expected: '>=' },
    { v: '<>12', expected: '<>' },
])('Scanner(`$v`).readOperator() => `$expected`', ({ v, expected }) =>
{
    const sc = new Scanner(v)
    const read = sc.readOperator();

    expect(read).toBeInstanceOf(TokenOperator);
    expect(read.value).toBe(expected);
});


test.for([
    { v: '123', expected: TokenNumber },
    { v: '12.34', expected: TokenNumber },
    { v: '"abc"', expected: TokenString },
    { v: 'A', expected: TokenWord },
    { v: 'A1', expected: TokenWord },
    { v: 'TAN', expected: TokenWord },
    { v: 'REM', expected: TokenWord },
    { v: ',', expected: TokenPunctuation },
    { v: '+', expected: TokenOperator },
    { v: '*', expected: TokenOperator },
    { v: '^', expected: TokenOperator },
    { v: '>', expected: TokenOperator },
    { v: '=', expected: TokenOperator },
    { v: '<=', expected: TokenOperator },
    { v: '<>', expected: TokenOperator },
])('Scanner(`$v`).readNextToken() => $expected', ({ v, expected }) =>
{
    const sc = new Scanner(v)
    const read = sc.readNextToken();

    expect(read).toBeInstanceOf(expected);
});


test.for([
    { s: '10 LET A = 0', expected: '10LETA=0' },
    { s: '1PRINT"a = ",8', expected: '1PRINT"A = ",8' },
    { s: '999      IfD = 0 THEN65   ', expected: '999IFD=0THEN65' },
])('`$v` => `$expected`', ({ s, expected }) =>
{
    const l = scanLine(s);
    console.debug(l);

    const ls = l.map(t => t.toString()).join('');

    expect(ls).toBe(expected);
});
