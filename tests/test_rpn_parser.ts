import { calculateRPN, convertInfixToRPN } from '../src/__utils__.ts';


// 3 + 4 * 2 / (1 - 5) ^ 2
// 3 4 2 * 1 5 − 2 ^ / +
let rpn = convertInfixToRPN([
    { type : 'num', value : 3 },
    { type : 'punc', value : '+' },
    { type : 'num', value : 4 },
    { type : 'punc', value : '*' },
    { type : 'num', value : 2 },
    { type : 'punc', value : '/' },
    { type : 'punc', value : '(' },
    { type : 'num', value : 1 },
    { type : 'punc', value : '-' },
    { type : 'num', value : 5 },
    { type : 'punc', value : ')' },
    { type : 'punc', value : '^' },
    { type : 'num', value : 2 },
]);

console.log(rpn);

console.log(calculateRPN(rpn));
