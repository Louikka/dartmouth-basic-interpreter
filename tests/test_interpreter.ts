import * as fs from 'node:fs';

import { Lexer } from '../src/Lexer.ts';
import { Parser } from '../src/Parser.ts';
import { Interpreter } from '../src/Interpreter.ts';


const test = `
50 REM
40 REM
80 REM
50 STOP
`;


let lexer = new Lexer(test);
let l = lexer.analyse();

//console.log(l);

let parser = new Parser(l);
parser.enableDevLogging = true;
let p = parser.parse();

let interpreter = new Interpreter(p);
interpreter.execute();

/*
fs.writeFile('test_results.txt', JSON.stringify(interpreter.normalizedASTTree, null, 2), err =>
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
*/
