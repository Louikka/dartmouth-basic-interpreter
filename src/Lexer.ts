import {
    isDigit, isKeyword,
    isKeywordStart,
    isOperator,
    isPunctuation,
    isVar, isVarStart,
    isWhitespace,
    throwError
// @ts-ignore
} from './__helpers__.ts';


export class __CharStream
{
    private inputString: string;

    public get streamLength(): number
    {
        return this.inputString.length;
    }

    private pos: number;


    constructor(s: string)
    {
        this.inputString = s;
        this.pos = 0;
    }


    /**
     * Peek at the character before current.
     */
    public peekBefore(): string
    {
        return this.inputString.charAt(this.pos - 1);
    }

    /**
     * Peek at the current character in stream.
     */
    public peek(): string
    {
        return this.inputString.charAt(this.pos);
    }

    /**
     * Peek at the character after current.
     */
    public peekAfter(): string
    {
        return this.inputString.charAt(this.pos + 1);
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
    private readonly inputString: string;
    private charStream: __CharStream;

    public get originalInput(): string
    {
        return this.inputString;
    }

    /**
     * List of currently precessed tokens.
     */
    private tokenList: Array<Token>;

    public get processedTokens(): Array<Token>
    {
        return this.tokenList;
    }

    private tokenPos: number;


    constructor(s: string)
    {
        this.inputString = s.trim().toUpperCase();
        this.charStream = new __CharStream(this.inputString);
        this.tokenList = [];
        this.analyse();
        this.tokenPos = 0;
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

    private readKeyword(): KeywToken
    {
        let keyw = this.readWhile((char, before, after, readString) =>
        {
            if (isKeyword(readString)) return false;

            return /[A-Z]/i.test(char);
        });

        return {
            type : 'keyw',
            value : keyw,
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

    private skipComment(): string
    {
        return this.readWhile((char, before, after, readString) => char !== '\n');
    }


    private readNext(): Token
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
            return {
                type : 'oper',
                value : this.readWhile((char, before, after, readString) => isOperator(char)),
            };
        }

        throwError(`Lexer error : Cannot handle character : "${char}"`);
    }



    private analyse(): Array<Token>
    {
        while (true)
        {
            const T = this.readNext();
            this.tokenList.push(T);
            if (T.type === 'spec' && T.value === 'ENDOFSTREAM') break;
        }

        return this.tokenList;
    }



    /**
     * Peek at the token before current.
     */
    public peekBefore(): Token | null
    {
        return this.tokenList[this.tokenPos - 1] ?? null;
    }

    /**
     * Peek at the current token in stream.
     */
    public peek(): Token | null
    {
        return this.tokenList[this.tokenPos] ?? null;
    }

    /**
     * Peek at the token after current.
     */
    public peekAfter(): Token | null
    {
        return this.tokenList[this.tokenPos + 1] ?? null;
    }


    public next(): Token | null
    {
        this.tokenPos++;
        return this.peek();
    }


    public isEndOfStream(): boolean
    {
        return this.peek() === null;
    }
}
