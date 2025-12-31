import {
    isDigit, isFunction,
    isKeyword, isKeywordStart,
    isOperator, isRelation,
    isPunctuation, isWhitespace,
    isVar, isVarStart,
// @ts-ignore
} from './__helpers.ts';
// @ts-ignore
import { BASICErrors } from './errors.ts';


type ErrorLog = {
    basic: string | null;
    extended: string | null;
}

export const __ERROR_LOG__: ErrorLog = {
    basic : null,
    extended : null,
};


class __CharStream
{
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


    constructor(s: string)
    {
        this.input = s;
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


export class Lexer
{
    constructor(s: string)
    {
        this.showDetailedErrors = true;

        this.originalInput = s.trim().toUpperCase();
        this.charStream = new __CharStream(this.originalInput);
    }



    public showDetailedErrors: boolean;

    private originalInput: string;
    private charStream: __CharStream;


    public __resetStream()
    {
        this.charStream = new __CharStream(this.originalInput);
    }


    /**
     * @param predicate test function.
     */
    private readWhile(predicate: (char: string, before: string, after: string, readString: string) => boolean): string
    {
        let s = '';

        while (!this.charStream.isEndOfStream() && predicate(
            this.charStream.peek(),
            this.charStream.peekBefore(),
            this.charStream.peekAfter(),
            s
        ))
        {
            s += this.charStream.peek();
            this.charStream.next();
        }

        return s;
    }


    private readNumber(): NumToken
    {
        let ifFloat = false;
        let isScientific = false;

        let n = this.readWhile((char, before, after, readString) =>
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

    private readString(): StrToken
    {
        let s = '';

        while (!this.charStream.isEndOfStream())
        {
            let char = this.charStream.next();

            if (char === '\n')
            {
                __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA
                __ERROR_LOG__.extended = `Error at Lexer.(private)readString() : Missing quote.`;
                throw new Error();
            }

            if (/*char === '\'' || */char === '"')
            {
                this.charStream.next();
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

    private readIdentifier(): VarToken
    {
        let id = this.readWhile((char, before, after, readString) =>
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

    private readKeyword(): KeywToken | FuncToken
    {
        let keyw = this.readWhile((char, before, after, readString) =>
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
            __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA
            __ERROR_LOG__.extended = `Error at Lexer.(private)readKeyword().`;
            throw new Error();
        }
    }

    private skipComment(): string
    {
        return this.readWhile((char, before, after, readString) => char !== '\n');
    }


    private readNextToken(): Token
    {
        // skip all whitespaces
        this.readWhile((char, before, after, readString) => isWhitespace(char));

        if (this.charStream.isEndOfStream())
        {
            return {
                type : 'spec',
                value : 'ENDOFSTREAM',
            };
        }

        let char = this.charStream.peek();


        if (char === '\n')
        {
            this.charStream.next();

            return {
                type : 'spec',
                value : 'LINEBREAK',
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

        if (isVarStart(char) && !isKeywordStart(this.charStream.peekAfter()))
        {
            return this.readIdentifier();
        }

        if (isKeywordStart(char))
        {
            let token = this.readKeyword();

            if (token.value === 'REM')
            {
                this.skipComment();
            }

            return token;
        }

        if (isPunctuation(char))
        {
            this.charStream.next();

            return {
                type : 'punc',
                value : char,
            };
        }

        if (isOperator(char))
        {
            this.charStream.next();

            return {
                type : 'oper',
                value : char,
            };
        }

        if (isRelation(char))
        {
            return {
                type : 'rel',
                value : this.readWhile((char, before, after, readString) => isRelation(char)),
            };
        }

        __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA
        __ERROR_LOG__.extended = `Error at Lexer.(private)readNextToken() : Cannot handle character "${char}".`;
        throw new Error();
    }


    public analyse(): Array<Token>
    {
        if (this.charStream.currentPosition !== 0)
        {
            this.__resetStream();
        }

        let tokenList: Array<Token> = [];

        while (true)
        {
            const token = this.readNextToken();
            tokenList.push(token);
            if (token.type === 'spec' && token.value === 'ENDOFSTREAM') break;
        }

        return tokenList;
    }
}
