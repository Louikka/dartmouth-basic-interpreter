import {
    BASICStatements,
    BASICKeywords,
    BASICFunctions,
    BASICOperators,
    BASICRelationOperators,
// @ts-ignore
} from './helpers/BASICLexemes.ts';
// @ts-ignore
import { BASICErrors } from './helpers/BASICErrors.ts';


interface LexerAnalyseOptions {
    /** Rethrows lexer error, if any occures. */
    rethrow: boolean;
}

const DEFAULT_LEXER_ANALYSE_OPTIONS: LexerAnalyseOptions = {
    rethrow : false,
}

export function Analyse(s: string, options?: LexerAnalyseOptions): [ Array<Token>, ErrorMessage ]
{
    if (options === undefined)
    {
        options = structuredClone(DEFAULT_LEXER_ANALYSE_OPTIONS);
    }
    else
    {
        for (const [key, value] of Object.entries(options))
        {
            if (value === undefined)
            {
                options[key as keyof LexerAnalyseOptions] = DEFAULT_LEXER_ANALYSE_OPTIONS[key as keyof LexerAnalyseOptions];
            }
        }
    }


    const charStream = new __CharStream( s.trim().toUpperCase() );
    let tokenList: Array<Token> = [];

    try
    {
        while (true)
        {
            const token = readNextToken(charStream);
            tokenList.push(token);
            if (token.type === 'spec' && token.value === 'ENDOFSTREAM') break;
        }
    }
    catch (err)
    {
        if (err instanceof Error)
        {
            if (options.rethrow) throw err;
            return [tokenList, err.message];
        }
        else
        {
            throw err;
        }
    }

    return [tokenList, null];
}



/* Helpers *******************************************************************/

class __CharStream
{
    constructor(s: string)
    {
        this.input = s;
    }


    private input: string;

    public get streamLength(): number
    {
        return this.input.length;
    }

    private pos = 0;

    public get currentPosition(): number
    {
        return this.pos;
    }

    /** Already read string of characters from input. */
    public get __readAll(): string
    {
        return this.input.substring(0, this.pos);
    }

    private readLine = '';

    /** Already read string of characters from input from last new line character (`\n`). */
    public get __readLine(): string
    {
        return this.readLine;
    }


    public peek(step = 0): string
    {
        return this.input.charAt(this.pos + step);
    }

    /** Alias for `__CharStream.peek(-1)`. */
    public peekBefore(): string
    {
        return this.peek(-1);
    }
    /** Alias for `__CharStream.peek(1)`. */
    public peekAfter(): string
    {
        return this.peek(1);
    }


    public next(): string
    {
        if (this.peek() === '\n')
        {
            this.readLine = '';
        }
        else
        {
            this.readLine += this.peek();
        }

        this.pos++;
        return this.peek();
    }


    public isEndOfStream(): boolean
    {
        return this.peek() === '';
    }
}



function isStatement(s: string)
{
    return BASICStatements.includes(s);
}

function isKeywordStart(char: string): boolean
{
    return /[A-Z]/i.test(char);
}

function isKeyword(s: string): boolean
{
    return BASICKeywords.includes(s);
}

function isFunction(s: string): boolean
{
    return BASICFunctions.includes(s);
}

function isDigit(char: string): boolean
{
    return /\d/.test(char);
}

function isVarStart(char: string): boolean
{
    return /[A-Z]/i.test(char);
}

/** Tests if `char` can be as part of the variable name (except first character -> see `isVarStart()`). */
function isVar(char: string): boolean
{
    return /[0-9]/i.test(char);
}

function isOperator(char: string): boolean
{
    return BASICOperators.includes(char);
}

function isRelation(char: string): boolean
{
    return BASICRelationOperators.includes(char);
}

function isPunctuation(char: string): boolean
{
    return [ ',', ';', '(', ')', ].includes(char);
}

function isWhitespace(char: string): boolean
{
    return ' \s\t\r'.includes(char);
}



type __PredicateFunction = (char: string, before: string, after: string, readString: string) => boolean;

function readWhile(stream: __CharStream, predicate: __PredicateFunction): string
{
    let s = '';

    while (!stream.isEndOfStream() && predicate(stream.peek(), stream.peek(-1), stream.peek(1), s))
    {
        s += stream.peek();
        stream.next();
    }

    return s;
}



function readNumber(stream: __CharStream): NumToken
{
    let ifFloat = false;
    let isScientific = false;

    let n = readWhile(stream, (char, before, after, readString) =>
    {
        if (char === '.')
        {
            if (ifFloat) return false;

            ifFloat = true;
            return true;
        }

        if (char === 'E' && (after === '-' || isDigit(after)))
        {
            if (isScientific) return false;

            isScientific = true;
            return true;
        }

        if (char === '-' && isScientific && before === 'E')
        {
            return true;
        }

        return isDigit(char);
    });

    return {
        type : 'num',
        value : parseFloat(n),
    };
}

function readString(stream: __CharStream): StrToken
{
    let s = '';

    while (!stream.isEndOfStream())
    {
        const char = stream.next();

        if (char === '\n')
        {
            throw new Error(BASICErrors.ILL_FORMULA);
        }

        if (/*char === '\'' || */char === '"')
        {
            stream.next();
            break;
        }
        else
        {
            s += char;
        }
    }

    return {
        type : 'str',
        value : s,
    };
}

function readIdentifier(stream: __CharStream): VarToken
{
    let id = readWhile(stream, (char, before, after, readString) =>
    {
        if (readString.length === 0 && isVarStart(char)) return true;
        if (readString.length === 1 && isVar(char)) return true;
        if (readString.length === 2) return false;

        return false;
    });

    return {
        type : 'var',
        value : id,
    };
}

function readKeyword(stream: __CharStream): KeywToken | FuncToken
{
    let keyw = readWhile(stream, (char, before, after, readString) =>
    {
        if (isKeyword(readString)) return false;

        return /[A-Z]/i.test(char);
    });

    if (isKeyword(keyw))
    {
        return {
            type : 'keyw',
            value : keyw,
        };
    }
    else if (isFunction(keyw))
    {
        return {
            type : 'func',
            value : keyw,
        }
    }
    else
    {
        throw new Error(BASICErrors.ILL_FORMULA);
    }
}

function skipComment(stream: __CharStream): StrToken
{
    return {
        type : 'str',
        value : readWhile(stream, (char, before, after, readString) => char !== '\n'),
    };
}


function readNextToken(stream: __CharStream): Token
{
    // skip all whitespaces
    readWhile(stream, (char, before, after, readString) => isWhitespace(char));

    if (stream.isEndOfStream())
    {
        return {
            type : 'spec',
            value : 'ENDOFSTREAM',
        };
    }

    const char = stream.peek();


    if (char === '\n')
    {
        stream.next();

        return {
            type : 'spec',
            value : 'LINEBREAK',
        };
    }

    if (char === '"')
    {
        return readString(stream);
    }

    if (isDigit(char))
    {
        return readNumber(stream);
    }

    if (isVarStart(char) && !isKeywordStart(stream.peekAfter()))
    {
        return readIdentifier(stream);
    }

    if (isKeywordStart(char))
    {
        const token = readKeyword(stream);

        if (token.value === 'REM')
        {
            skipComment(stream);
        }

        return token;
    }

    if (isPunctuation(char))
    {
        stream.next();

        return {
            type : 'punc',
            value : char,
        };
    }

    if (isOperator(char))
    {
        stream.next();

        return {
            type : 'oper',
            value : char,
        };
    }

    if (isRelation(char))
    {
        return {
            type : 'rel',
            value : readWhile(stream, (char, before, after, readString) => isRelation(char)),
        };
    }

    throw new Error(BASICErrors.ILL_FORMULA);
}
