import * as fs from 'node:fs/promises';

import { Lexer } from '../src/Lexer.ts';



const test1 = await fs.readFile('./example.bas', 'utf8').catch((err) =>
{
    console.error('Error reading file :', err);
    process.exit();
});

const test2 = (await fs.readFile('./test.bas', 'utf8').catch((err) =>
{
    console.error('Error reading file :', err);
    process.exit();
})).toUpperCase();

const test3 = `
10READA1,A2
15LETD=A1*A2
65PRINTD
70DATA1,2
77REMAOBABABOABABOABAOBAOB
90END
`;


let lex = new Lexer(test3);
console.log(lex.analyse());
