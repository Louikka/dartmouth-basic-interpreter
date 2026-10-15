import { ScannerError } from './errors';
import { isDigit, isWhitespace } from './is';
import type { TokenNumber, TokenString, TokenVariable } from './tokens';


export function scan(s: string): Token[][]
{
    const output: Token[][] = [];

    for (const line of s.split('\n'))
    {
        const scanner = new Scanner(line);
    }

    return output;
}


type _PredicateFunction = (char: string, before: string, after: string, s: string) => boolean;

class Scanner
{
    constructor(s: string)
    {
        this.s = s.trim().toUpperCase();
    }


    public s: string;
    public pos = 0;


    /** Peeks at the current character without consuming it. */
    public peek(step = 0): string
    {
        const newPos = this.pos + step;
        if (newPos < 0 || newPos >= this.s.length)
        {
            throw new ScannerError('Overflow error: new position is out of bounds.');
        }

        return this.s.charAt(newPos);
    }

    /** Increments position by 1 and returns new character. */
    public next(): string
    {
        this.pos++;
        return this.peek();
    }

    /** Reports whether there is still characters to read. */
    public isEOF(): boolean
    {
        return this.pos >= this.s.length;
    }


    public readwhile(predicateFn: _PredicateFunction): string
    {
        let s = '';

        while (!this.isEOF() && predicateFn(this.peek(), this.peek(-1), this.peek(1), s))
        {
            s += this.peek();
            this.pos++;
        }

        return s;
    }


    public readNumber(): TokenNumber
    {
        let ifFloat = false;
        let isScientific = false;

        let n = this.readwhile((char, before, after) =>
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
            type: 'NUMBER',
            value: parseFloat(n),
        };
    }

    public readString(): TokenString
    {
        let s = '';

        // skip initial quotation mark
        this.pos++;

        while (true)
        {
            if (this.isEOF())
            {
                throw new ScannerError(`Encountered end of input (expected '"').`);
            }

            const char = this.peek();

            if (char === '"')
            {
                this.pos++;
                break;
            }
            else
            {
                s += char;
            }
        }

        return {
            type: 'STRING',
            value: s,
        };
    }

    public readIdentifier(): TokenVariable
    {
        let id = this.readwhile((char, before, after, s) =>
        {
            if (s.length === 0 && isVarStart(char)) return true;
            if (s.length === 1 && isVar(char)) return true;
            if (s.length === 2) return false;

            return false;
        });

        return {
            type: 'VARIABLE',
            value: id,
        };
    }

    public readKeyword(): TokenKeyword | TokenFunction
    {
        let keyw = this.readwhile((char, before, after, s) =>
        {
            if (isKeyword(s)) return false;
            return /[A-Z]/i.test(char);
        });

        if (isKeyword(keyw))
        {
            return {
                type: 'KEYWORD',
                value: keyw,
            };
        }
        else if (isFunction(keyw))
        {
            return {
                type : 'FUNCTION',
                value : keyw,
            }
        }
        else
        {
            throw new ScannerError('');
        }
    }

    public skipComment(): TokenString
    {
        return {
            type: 'STRING',
            value: this.readwhile(() => true),
        };
    }

    public readNextToken(): Token
    {
        // skip all whitespaces
        this.readwhile((char) => isWhitespace(char));
    }
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
