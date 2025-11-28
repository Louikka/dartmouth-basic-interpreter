import { Lexer } from '../src/Lexer.ts';


const TEST_EXSPRESSIONS = [
    '"ABC"',
    '""',
    '"ABC DEF G 123 45 6"',
    '"ABC"ABC',
    '"ABC", 123',
];


for (const s of TEST_EXSPRESSIONS)
{
    console.log(s.padEnd(22) + '=>', new Lexer(s).__test_readString__());
}
