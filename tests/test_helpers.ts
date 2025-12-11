import { parenthesizeExpression, readParenthesis, stringifyTokens } from '../src/__helpers__.ts';



// 3 + 4 * 2 / (1 - 5) ^ 2
const __test1 = [
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
];

const __test2 = [
    { type : 'num', value : 3 },
    { type : 'punc', value : '+' },
    { type : 'num', value : 4 },
];

const __test3 = [
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
    { type : 'punc', value : '-' },
    { type : 'punc', value : '(' },
    { type : 'num', value : 2 },
    { type : 'punc', value : '+' },
    { type : 'num', value : 3 },
    { type : 'punc', value : ')' },
    { type : 'punc', value : ')' },
    { type : 'punc', value : '^' },
    { type : 'num', value : 2 },
];


let r = parenthesizeExpression(__test1);

console.log(stringifyTokens(r));
console.log(' ' + stringifyTokens(readParenthesis(r)));

`
(
    (
        (
            (3)
        )
    )
    +
    (
        (
            (4)
        )
        *
        (
            (2)
        )
        /
        (
            (
                (
                    (
                        (
                            (1)
                        )
                    )
                    -
                    (
                        (
                            (5)
                        )
                    )
                )
            )
            ^
            (2)
        )
    )
)
`
