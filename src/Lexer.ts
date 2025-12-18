import {
    isDigit, isFunction,
    isKeyword, isKeywordStart,
    isOperator,
    isPunctuation,
    isRelation,
    isVar, isVarStart,
    isWhitespace,
    throwError
// @ts-ignore
} from './__helpers__.ts';


// Exact implementation of __Streamer class from __helpers__.ts,
// but tweaked a little bit to match needs of lexer.
class __CharStream
{
    private input: string;

    public get streamLength(): number
    {
        return this.input.length;
    }

    private pos: number;

    public get currentPosition(): number
    {
        return this.pos;
    }


    constructor(s: string)
    {
        this.input = s;
        this.pos = 0;
    }


    public peekBefore(): string
    {
        return this.input.charAt(this.pos - 1);
    }

    public peek(): string
    {
        return this.input.charAt(this.pos);
    }

    public peekAfter(): string
    {
        return this.input.charAt(this.pos + 1);
    }


    public next(): string
    {
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
        this.charStream = new __CharStream(s.trim().toUpperCase());
    }



    private charStream: __CharStream;


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
                throwError(`Lexer error : Encountered line break instead of quote.`);
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
            throwError(`Lexer error : Undefined keyword : "${keyw}".`);
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

        throwError(`Lexer error : Cannot handle character : "${char}"`);
    }


    public analyse(): Array<Token>
    {
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
