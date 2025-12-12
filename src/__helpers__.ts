export const BASICStatements = [
    'LET',
    'READ',
    'DATA',
    'PRINT',
    'GOTO',
    'IF',
    'FOR',
    'NEXT',
    'END',
    'STOP',
    'DEF',
    'GOSUB',
    'RETURN',
    'DIM',
    'REM',
];

export const BASICKeywords = [ ...BASICStatements, 'THEN', 'TO', 'STEP', 'FN', ];

// manual 2.2 and 3.3
export const BASICFunctions = [ 'SIN', 'COS', 'TAN', 'ATN', 'EXP', 'ABS', 'LOG', 'SQR', 'INT', 'RND', ];

export const BASICOperators = [ '+', '-', '*', '/', '^', ];

export const BASICConditionOperators = [ '<', '>', '=', '<=', '>=', '<>', ];

/** Do not use for direct comparison. */
export const binTokens = {
    parenOpen : {
        type : 'punc',
        value : '(',
    } as PuncToken,
    parenClose : {
        type : 'punc',
        value : ')',
    } as PuncToken,
    plus : {
        type : 'oper',
        value : '+',
    } as OperToken,
    minus : {
        type : 'oper',
        value : '-',
    } as OperToken,
    star : {
        type : 'oper',
        value : '*',
    } as OperToken,
    slash : {
        type : 'oper',
        value : '/',
    } as OperToken,
    caret : {
        type : 'oper',
        value : '^',
    } as OperToken,
} as const;



/* */

export function throwError(message: string): never
{
    console.error(message);
    process.exit(0);
}


/* test functions */

export function isStatement(s: string)
{
    return BASICStatements.includes(s);
}

export function isKeywordStart(char: string): boolean
{
    return /[A-Z]/i.test(char);
}

export function isKeyword(s: string): boolean
{
    return BASICKeywords.includes(s);
}

export function isFunction(s: string): boolean
{
    return BASICFunctions.includes(s);
}

export function isDigit(char: string): boolean
{
    return /\d/.test(char);
}

export function isVarStart(char: string): boolean
{
    return /[A-Z]/i.test(char);
}

/** Tests if `char` can be as part of the variable name (except first character -> see `isVarStart`). */
export function isVar(char: string): boolean
{
    return /[0-9]/i.test(char);
}

export function isOperator(char: string): boolean
{
    return BASICOperators.includes(char) || BASICConditionOperators.includes(char);
}

export function isPunctuation(char: string): boolean
{
    return [ ',', '(', ')', ].includes(char);
}

export function isWhitespace(char: string): boolean
{
    return ' \t\r'.includes(char);
}



/* other useful stuff */

export function isNumeric(str: string): boolean
{
    if (typeof str === 'number') return true;
    if (typeof str !== 'string') return false;
    return !isNaN(+str) && !isNaN(parseFloat(str));
}

export function doesContainBinary(list: Token[]): boolean
{
    if (!list.some((T) => T.type === 'oper'))
    {
        return false;
    }
    else
    {
        if (list.filter((T) => T.type === 'oper').length === 1 && list[0].type === 'oper')
        {
            return false;
        }

        return true;
    }
}



export function stringifyTokens(input: Token | Token[], separator?: string): string
{
    if (!Array.isArray(input))
    {
        return input.value.toString();
    }

    let s = '';

    for (let i = 0; i < input.length; i++)
    {
        s += input[i].value;

        if (separator !== undefined && i < input.length)
        {
            s += separator;
        }
    }

    return s;
}



export function parenthesizeExpression(input: Token[]): Token[]
{
    // https://en.wikipedia.org/wiki/Operator-precedence_parser#Full_parenthesization
    //

    let __return: Token[] = [];
    __return.push( ...new Array(4).fill(binTokens.parenOpen) );

    for (let i = 0; i !== input.length; i++)
    {
        const T = input[i];

        switch (T.value)
        {
            case '(':
            {
                __return.push( ...new Array(4).fill(binTokens.parenOpen) );
                continue;
            }
            case ')':
            {
                __return.push( ...new Array(4).fill(binTokens.parenClose) );
                continue;
            }
            case '^':
            {
                __return.push(
                    binTokens.parenClose,
                    binTokens.caret,
                    binTokens.parenOpen
                );
                continue;
            }
            case '*':
            {
                __return.push(
                    ...new Array(2).fill(binTokens.parenClose),
                    binTokens.star,
                    ...new Array(2).fill(binTokens.parenOpen)
                );
                continue;
            }
            case '/':
            {
                __return.push(
                    ...new Array(2).fill(binTokens.parenClose),
                    binTokens.slash,
                    ...new Array(2).fill(binTokens.parenOpen)
                );
                continue;
            }
            case '+':
            {
                const prevT = input[i - 1];

                // unary check: either first or had an operator expecting secondary argument
                if (i === 0 || (prevT.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevT.value)))
                {
                    __return.push(binTokens.plus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(binTokens.parenClose),
                        binTokens.plus,
                        ...new Array(3).fill(binTokens.parenOpen)
                    );
                }

                continue;
            }
            case '-':
            {
                const prevT = input[i - 1];

                if (i === 0 || (prevT.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevT.value)))
                {
                    __return.push(binTokens.minus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(binTokens.parenClose),
                        binTokens.minus,
                        ...new Array(3).fill(binTokens.parenOpen)
                    );
                }

                continue;
            }
        }

        __return.push(T);
    }

    __return.push( ...new Array(4).fill(binTokens.parenClose) );

    return __return;
}


export function readParenthesis(expr: Token[]): Token[]
{
    let depth = 0;
    let __return: Token[] = [];

    for (const T of expr)
    {
        if (T.value === binTokens.parenOpen.value)
        {
            depth++;
            if (depth === 1) continue;
        }
        else if (T.value === binTokens.parenClose.value && depth > 0)
        {
            depth--;
            if (depth === 0) break;
        }

        if (depth > 0)
        {
            __return.push(T);
            continue;
        }
    }

    return __return;
}

/** If operator found. */
export type __preBinNodeOk = {
    operator: string;
    left: Token[];
    right: Token[];
}
/** if operator not found. */
export type __preBinNodeNof = {
    operator: null;
    expression: Token[];
}
export type __preBinNode = __preBinNodeOk | __preBinNodeNof;

export function parseParenthesizedBinaryExpression(expr: Token[]): __preBinNode
{
    let oper: Token | null = null;
    let left: Token[] = [];
    let right: Token[] = [];

    let depth = 0;
    let isLeftRead = false;

    for (const T of expr)
    {
        if (isLeftRead)
        {
            right.push(T);
            continue;
        }

        if (T.type === 'oper' && depth === 0)
        {
            oper = T;
            isLeftRead = true;
            continue;
        }
        else
        {
            left.push(T);
            if (T.value === '(') depth++;
            if (T.value === ')' && depth > 0) depth--;
            continue;
        }
    }

    if (oper === null)
    {
        return {
            operator : null,
            expression : left,
        };
    }
    else
    {
        return {
            operator : oper.value,
            left : left,
            right : right,
        };
    }
}
