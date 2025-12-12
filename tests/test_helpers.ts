import * as fs from 'node:fs';

import {
    parenthesizeExpression,
    readParenthesis,
    stringifyTokens
} from '../src/__helpers__.ts';



// 3 + 4 * 2 / (1 - 5) ^ 2
const __test1 = [
    { type : 'num', value : 3 },
    { type : 'oper', value : '+' },
    { type : 'num', value : 4 },
    { type : 'oper', value : '*' },
    { type : 'num', value : 2 },
    { type : 'oper', value : '/' },
    { type : 'punc', value : '(' },
    { type : 'num', value : 1 },
    { type : 'oper', value : '-' },
    { type : 'num', value : 5 },
    { type : 'punc', value : ')' },
    { type : 'oper', value : '^' },
    { type : 'num', value : 2 },
];

const __test2 = [
    { type : 'num', value : 3 },
    { type : 'oper', value : '+' },
    { type : 'num', value : 4 },
    { type : 'oper', value : '-' },
    { type : 'num', value : 5 },
];

const __test3 = [
    { type : 'num', value : 3 },
    { type : 'oper', value : '+' },
    { type : 'num', value : 4 },
    { type : 'oper', value : '*' },
    { type : 'num', value : 2 },
    { type : 'oper', value : '/' },
    { type : 'punc', value : '(' },
    { type : 'num', value : 1 },
    { type : 'oper', value : '-' },
    { type : 'num', value : 5 },
    { type : 'oper', value : '-' },
    { type : 'punc', value : '(' },
    { type : 'num', value : 2 },
    { type : 'oper', value : '+' },
    { type : 'num', value : 3 },
    { type : 'punc', value : ')' },
    { type : 'punc', value : ')' },
    { type : 'oper', value : '^' },
    { type : 'num', value : 2 },
];


let r = parenthesizeExpression(__test1);
console.log(r);
