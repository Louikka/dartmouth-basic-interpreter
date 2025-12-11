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

export const BASICKeywords = [
    'LET',
    'READ',
    'DATA',
    'PRINT',
    'GOTO',
    'IF', 'THEN',
    'FOR', 'TO', 'STEP',
    'NEXT',
    'END',
    'STOP',
    'DEF', 'FN',
    'GOSUB',
    'RETURN',
    'DIM',
    'REM',

    'EQU',
    'LSS',
    'GRT',
    'LQU',
    'GQU',
    'NQU',
];

export const BASICOperators = [ '+', '-', '*', '/', '^', ];

export const puncTokens = {
    parenOpen : {
        type : 'punc',
        value : '(',
    } as PuncToken,
    parenClose : {
        type : 'punc',
        value : ')',
    } as PuncToken,
    plus : {
        type : 'punc',
        value : '+',
    } as PuncToken,
    minus : {
        type : 'punc',
        value : '-',
    } as PuncToken,
    star : {
        type : 'punc',
        value : '*',
    } as PuncToken,
    slash : {
        type : 'punc',
        value : '/',
    } as PuncToken,
    caret : {
        type : 'punc',
        value : '^',
    } as PuncToken,
};





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

export function isVar(char: string): boolean
{
    return /[0-9]/i.test(char);
}

export function isOperator(char: string): boolean
{
    return [ ...BASICOperators, '=', '<', '>', /*'<=', '>=', '<>',*/ ].includes(char);
}

export function isPunctuation(char: string): boolean
{
    return [ ',', '(', ')', ].includes(char);
}

export function isWhitespace(char: string): boolean
{
    return ' \t\r'.includes(char);
}


export function isNumeric(str: string): boolean
{
    if (typeof str === 'number') return true;
    if (typeof str !== 'string') return false;
    return !isNaN(+str) && !isNaN(parseFloat(str));
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

export function getPrecedence(o: BASICOperator): number
{
    switch (o)
    {
        case '+':
        case '-':
        {
            return 1;
        }
        case '*':
        case '/':
        {
            return 2;
        }
        case '^':
        {
            return 3;
        }

        default:
        {
            return -1;
        }
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


export function convertInfixToRPN(stack: (NumToken | PuncToken)[]): Array<NumToken | PuncToken>
{
    let returnStack: (NumToken | PuncToken)[] = [];
    let memoryStack: (NumToken | PuncToken)[] = [];

    for (const T of stack)
    {
        if (T.type === 'num')
        {
            returnStack.push(T);
        }
        else if (T.value === '(')
        {
            memoryStack.push(T);
        }
        else if (T.value === ')')
        {
            while (memoryStack[memoryStack.length - 1].value !== '(')
            {
                returnStack.push(memoryStack.pop()!);
            }
            memoryStack.pop();
        }
        else if (BASICOperators.includes(T.value))
        {
            // @ts-ignore
            while (getPrecedence(memoryStack[memoryStack.length - 1]) >= getPrecedence(T.value))
            {
                returnStack.push(memoryStack.pop()!);
            }
            memoryStack.push(T);
        }
    }

    returnStack.push( ...memoryStack.reverse() );

    return returnStack;
}

export function convertInfixToPN(input: Token[]): Token[]
{
    function isOperator(token: Token): boolean
    {
        return token.type === 'oper' && BASICOperators.includes(token.value);
    }

    function isRightAssociative(token: Token): boolean
    {
        return token.value === '^';
    }


    let __inputReversed = input.reverse();
    let st: Token[] = [];
    let __return: Token[] = [];

    // scan from right to left
    for (const T of __inputReversed)
    {
        if (T.value === ')')
        {
            st.push(T);
        }
        else if (T.value === '(')
        {
            while (st.length > 0 && st[st.length - 1].value !== ')')
            {
                __return.push(st.pop()!);
            }

            if (st.length > 0) st.pop();
        }
        else if (isOperator(T))
        {
            while (
                st.length > 0 &&
                isOperator(st[st.length - 1]) &&
                // @ts-ignore
                (getPrecedence(st[st.length - 1].value) > getPrecedence(T.value) ||
                    // @ts-ignore
                    (getPrecedence(st[st.length - 1].value) === getPrecedence(T.value) && isRightAssociative(T)))
            )
            {
                __return.push(st.pop()!);
            }

            st.push(T);
        }
        else
        {
            __return.push(T);
        }
    }

    // pop remaining operators
    while (st.length > 0)
    {
        __return.push(st.pop()!);
    }

    return __return.reverse();
}

export function parsePNExpression(input: Token[]): any
{
    let stack = [ ...input ];

    let operator: Token;
    let left: Token | Token[];
    let right: Token | Token[];

    if (stack[0].type === 'oper') operator = stack.shift()!;
    else operator = { type : 'oper', value : '???' };

    if (stack[0].type === 'num')
    {
        left = stack.shift()!;
    }
    else
    {
        left = parsePNExpression(stack);
    }

    if (stack[0].type === 'num')
    {
        right = stack.shift()!;
    }
    else
    {
        right = parsePNExpression(stack);
    }

    return {
        type : 'BINARY',
        operator : operator,
        left : left,
        right : right,
    };
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
                if (i === 0 || (prevT.type === 'punc' && '(*^/+-'.includes(prevT.value)))
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

                if (i === 0 || (prevT.type === 'punc' && '(*^/+-'.includes(prevT.value)))
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

export function parseParenthesizedExpression(expr: Token[]): void
{
    if (expr[0] === puncTokens.parenOpen)
    {
        //
    }
}
