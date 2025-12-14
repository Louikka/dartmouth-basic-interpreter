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


    public peekBefore(): T | null
    {
        return this.input[this.pos - 1] ?? null;
    }

    public peek(): T | null
    {
        return this.input[this.pos] ?? null;
    }

    public peekAfter(): T | null
    {
        return this.input[this.pos + 1] ?? null;
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


export function isNumeric(str: string): boolean
{
    if (typeof str === 'number') return true;
    if (typeof str !== 'string') return false;
    return !isNaN(+str) && !isNaN(parseFloat(str));
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
