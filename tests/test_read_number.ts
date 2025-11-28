import { Lexer } from '../src/Lexer.ts';


const TEST_EXSPRESSIONS = [
    '123',
    '123.45',
    '.123',
    '123E2',
    '123E-2',
    'ABC123',
    '12ABC3',
    '123ABC',
    '123.45.6',
    '123END',
    '..123',
    '.1234E5',
];


for (const s of TEST_EXSPRESSIONS)
{
    console.log(s.padEnd(9) + '=>', new Lexer(s).__test_readNumber__());
}
