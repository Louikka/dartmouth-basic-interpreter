import { Lexer } from '../src/Lexer.ts';


const TEST_EXSPRESSIONS = [
    'A1',
    'A',
    'END',
    'A1B2',
    'IF12',
];


for (const s of TEST_EXSPRESSIONS)
{
    console.log(s.padEnd(6) + '=>', new Lexer(s).__test_readIdentifier__());
}
