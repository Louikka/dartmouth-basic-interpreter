import { BASICErrors } from '../lib/err';
import { BASICFunctions, BASICKeywords, BASICStatements } from '../lib/kwr';
import { BASICOperators, BASICRelationOperators } from '../lib/oper';


class ScannerError extends Error
{
    constructor(message?: string)
    {
        super(message);
        this.name = this.constructor.name;
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

function isOperator(s: string): boolean
{
    return BASICOperators.includes(s);
}

function isRelation(s: string): boolean
{
    return BASICRelationOperators.includes(s);
}

function isPunctuation(s: string): boolean
{
    return [ ',', ';', '(', ')' ].includes(s);
}

function isWhitespace(char: string): boolean
{
    return ' \t\r'.includes(char);
}



class Scanner
{
    constructor(s: string)
    {
        this.s = s.trim().toUpperCase();
    }


    private s: string;
    private pos = 0;


    private peek(step = 0): string
    {
        return this.s.charAt(this.pos + step);
    }

    private next(): string
    {
        this.pos++;
        return this.peek();
    }

    private isEOF(): boolean
    {
        return this.pos >= this.s.length;
    }


    private readwhile(predicate: (char: string, before: string, after: string, s: string) => boolean): string
    {
        let s = '';

        while (!this.isEOF() && predicate(this.peek(), this.peek(-1), this.peek(1), s))
        {
            s += this.peek();
            this.next();
        }

        return s;
    }


    private readNumber(): NumToken
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
            type: 'num',
            value: parseFloat(n),
        };
    }

    private readString(): StrToken
    {
        let s = '';

        while (!this.isEOF())
        {
            const char = this.next();

            if (char === '\n')
            {
                throw new Error(BASICErrors.ILL_FORMULA);
            }

            if (/*char === '\'' || */char === '"')
            {
                this.next();
                break;
            }
            else
            {
                s += char;
            }
        }

        return {
            type: 'str',
            value: s,
        };
    }

    private readIdentifier(): VarToken
    {
        let id = this.readwhile((char, before, after, s) =>
        {
            if (s.length === 0 && isVarStart(char)) return true;
            if (s.length === 1 && isVar(char)) return true;
            if (s.length === 2) return false;

            return false;
        });

        return {
            type: 'var',
            value: id,
        };
    }

    private readKeyword(): KeywToken | FuncToken
    {
        let keyw = this.readwhile((char, before, after, s) =>
        {
            if (isKeyword(s)) return false;
            return /[A-Z]/i.test(char);
        });

        if (isKeyword(keyw))
        {
            return {
                type: 'keyw',
                value: keyw,
            };
        }
        else if (isFunction(keyw))
        {
            return {
                type: 'func',
                value: keyw,
            }
        }
        else
        {
            throw new ScannerError(BASICErrors.ILL_FORMULA);
        }
    }

    private skipComment(): StrToken
    {
        return {
            type: 'str',
            value: this.readwhile((char) => char !== '\n'),
        };
    }


    public readNextToken(): Token
    {
        // skip all whitespaces
        this.readwhile((char) => isWhitespace(char));

        if (this.isEOF())
        {
            return {
                type: 'spec',
                value: 'ENDOFFILE',
            };
        }

        const char = this.peek();


        if (char === '\n')
        {
            this.next();

            return {
                type: 'spec',
                value: 'LINEBREAK',
            };
        }

        if (char === '"')
        {
            return this.readString();
        }

        if (isDigit(char))
        {
            return this.readNumber();
        }

        if (isVarStart(char) && !isKeywordStart(this.peek(1)))
        {
            return this.readIdentifier();
        }

        if (isKeywordStart(char))
        {
            const token = this.readKeyword();

            if (token.value === 'REM')
            {
                this.skipComment();
            }

            return token;
        }

        if (isPunctuation(char))
        {
            this.next();

            return {
                type: 'punc',
                value: char,
            };
        }

        if (isOperator(char))
        {
            this.next();

            return {
                type: 'oper',
                value: char,
            };
        }

        if (isRelation(char))
        {
            return {
                type: 'rel',
                value: this.readwhile((char) => isRelation(char)),
            };
        }

        // Undefined character
        throw new ScannerError(BASICErrors.ILL_FORMULA);
    }
}



interface ScanOptions {
    //
}

export function scan(s: string, options?: ScanOptions): Array<Token>
{
    const scanner = new Scanner(s);
    const tokenList: Array<Token> = [];

    while (true)
    {
        const token = scanner.readNextToken();
        tokenList.push(token);
        if (token.type === 'spec' && token.value === 'ENDOFFILE') break;
    }

    return tokenList;
}
