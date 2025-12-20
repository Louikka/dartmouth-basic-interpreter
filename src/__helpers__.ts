// Helper class to stream array.
// Basically better version of JS generator.
export class __Streamer<T>
{
    private input: Array<T>;

    public get streamLength(): number
    {
        return this.input.length;
    }

    private pos: number;

    public get currentPosition(): number
    {
        return this.pos;
    }


    constructor(arr: Array<T>)
    {
        this.input = arr;
        this.pos = 0;
    }


    public peek(step = 0): T | null
    {
        return this.input[this.pos + step] ?? null;
    }

    /** Alias for `__Streamer.peek(-1)`. */
    public peekBefore(): T | null
    {
        return this.peek(-1);
    }
    /** Alias for `__Streamer.peek(1)`. */
    public peekAfter(): T | null
    {
        return this.peek(1);
    }


    public next(): T | null
    {
        this.pos++;
        return this.peek();
    }


    public isEndOfStream(): boolean
    {
        return this.pos >= this.input.length;
    }
}



/* constants */

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



export function throwError(...message: string[]): never
{
    for (const msg of message)
    {
        console.error(msg.trim());
    }

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
    return BASICOperators.includes(char);
}

export function isRelation(char: string): boolean
{
    return BASICConditionOperators.includes(char);
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



export function convertNumTokenToNode(token: NumToken): NumNode
{
    return {
        type : 'NUMBER',
        value : token.value,
    };
}

export function convertStrTokenToNode(token: StrToken): StrNode
{
    return {
        type : 'STRING',
        value : token.value,
    };
}



export function stringifyToken(input: Token, indentation?: number): string
{
    return JSON.stringify(input, null, indentation);
}

export function stringifyTokenValue(input: Token): string
{
    return input.value.toString();
}

export function convertLogicalOperator(token: Token): Token
{
    switch (token.value)
    {
        case 'EQU': return { type : 'rel', value : '=', };
        case 'LSS': return { type : 'rel', value : '<', };
        case 'GRT': return { type : 'rel', value : '>', };
        case 'LQU': return { type : 'rel', value : '<=', };
        case 'GQU': return { type : 'rel', value : '>=', };
        case 'NQU': return { type : 'rel', value : '<>', };

        default: return token;
    }
}

export function getPrecedence(o: string): number
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

export function testTokenValue(token: Token | null, expectedValue: string, errMessage?: string)
{
    if (token === null || token.value !== expectedValue)
    {
        throwError(`Parser error : ${errMessage ?? `Expected to see "${expectedValue}".`}.`);
    }
}

/**
 * Keeps only the last of duplicated object.
 * @param key the key of the object filtering based on.
 */
export function removeDuplicatesFromArrayOfObjects<T, K extends keyof T>(arr: Array<T>, key: K): Array<T>
{
    const reversedArr = [ ...arr ].reverse();

    const uniqueReversed = reversedArr.filter((val, i, self) =>
    {
        return i === self.findIndex((__val) => __val[key] === val[key]);
    });

    return uniqueReversed.reverse();
}
