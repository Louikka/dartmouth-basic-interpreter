import * as fs from 'node:fs';

import { Lexer } from '../src/Lexer.ts';
import { Parser } from '../src/Parser.ts';


const test = `
10 LET A = 12
20 PRINT "aboba = " A
`;


let lexer = new Lexer(test);
let l = lexer.analyse();

let parser = new Parser(l);
parser.isDevLogging = true;
let p = parser.parse();

fs.writeFile('test_results.txt', JSON.stringify(p, null, 2), err =>
{
    if (err)
    {
        console.error(err);
    }
    else
    {
        console.log('File was written successfully.');
    }
});
