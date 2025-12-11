// @ts-ignore
import { BASICConditionOperators, BASICKeywords, BASICOperators, BASICStatements, puncTokens } from './__constants__.ts';


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



export function convertLogicalOperator(token: Token): Token
{
    switch (token.value)
    {
        case 'EQU': return { type : 'oper', value : '=', };
        case 'LSS': return { type : 'oper', value : '<', };
        case 'GRT': return { type : 'oper', value : '>', };
        case 'LQU': return { type : 'oper', value : '<=', };
        case 'GQU': return { type : 'oper', value : '>=', };
        case 'NQU': return { type : 'oper', value : '<>', };

        default: return token;
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
    __return.push( ...new Array(4).fill(puncTokens.parenOpen) );

    for (let i = 0; i !== input.length; i++)
    {
        const T = input[i];

        switch (T.value)
        {
            case '(':
            {
                __return.push( ...new Array(4).fill(puncTokens.parenOpen) );
                continue;
            }
            case ')':
            {
                __return.push( ...new Array(4).fill(puncTokens.parenClose) );
                continue;
            }
            case '^':
            {
                __return.push(
                    puncTokens.parenClose,
                    puncTokens.caret,
                    puncTokens.parenOpen
                );
                continue;
            }
            case '*':
            {
                __return.push(
                    ...new Array(2).fill(puncTokens.parenClose),
                    puncTokens.star,
                    ...new Array(2).fill(puncTokens.parenOpen)
                );
                continue;
            }
            case '/':
            {
                __return.push(
                    ...new Array(2).fill(puncTokens.parenClose),
                    puncTokens.slash,
                    ...new Array(2).fill(puncTokens.parenOpen)
                );
                continue;
            }
            case '+':
            {
                const prevT = input[i - 1];

                // unary check: either first or had an operator expecting secondary argument
                if (i === 0 || (prevT.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevT.value)))
                {
                    __return.push(puncTokens.plus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(puncTokens.parenClose),
                        puncTokens.plus,
                        ...new Array(3).fill(puncTokens.parenOpen)
                    );
                }

                continue;
            }
            case '-':
            {
                const prevT = input[i - 1];

                if (i === 0 || (prevT.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevT.value)))
                {
                    __return.push(puncTokens.minus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(puncTokens.parenClose),
                        puncTokens.minus,
                        ...new Array(3).fill(puncTokens.parenOpen)
                    );
                }

                continue;
            }
        }

        __return.push(T);
    }

    __return.push( ...new Array(4).fill(puncTokens.parenClose) );

    return __return;
}


export function readParenthesis(expr: Token[]): Token[]
{
    let depth = 0;
    let __return: Token[] = [];

    for (const T of expr)
    {
        if (T.value === puncTokens.parenOpen.value)
        {
            depth++;
            if (depth === 1) continue;
        }
        else if (T.value === puncTokens.parenClose.value && depth > 0)
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

export function parseParenthesizedExpression(expr: Token[])
{
    // TO-DO
}
