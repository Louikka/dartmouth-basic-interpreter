import { Lexer } from '../src/Lexer.ts';


const TEST_EXSPRESSIONS = [
    'END',
    'IF12',
    'PRINT',
    '1234',
];


for (const s of TEST_EXSPRESSIONS)
{
    console.log(s.padEnd(10) + '=>', new Lexer(s).__test_readKeyword__());
}
