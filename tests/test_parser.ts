import * as fs from 'node:fs';

import { Lexer } from '../src/Lexer.ts';
import { Parser } from '../src/Parser.ts';


const test = `
50 DIM A(8, 4), B(7)
`;


let lexer = new Lexer(test);
let l = lexer.analyse();

//console.log(l);

let parser = new Parser(l);
parser.enableDevLogging = true;
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
