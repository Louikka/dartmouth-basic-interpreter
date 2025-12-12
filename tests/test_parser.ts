import * as fs from 'node:fs';

import { Lexer } from '../src/Lexer.ts';
import { Parser } from '../src/Parser.ts';



const test = `10LETD=15`;


let lex = new Lexer(test);
let parser = new Parser(lex);

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
