import {
    convertLogicalOperator,
    isDigit, isKeyword,
    isKeywordStart,
    isOperatorChar,
    isPunctuation,
    isVar, isVarStart,
    isWhitespace
// @ts-ignore
} from './__utils__.ts';


export class __CharStream
{
    private inputString: string;

    public get streamLength(): number
    {
        return this.inputString.length;
    }

    private pos: number;
    private line: number;
    private col: number;

    public get currentCharPosition(): number
    {
        return this.pos;
    }
    public get currentLine(): number
    {
        return this.line;
    }
    public get currentColumnInLine(): number
    {
        return this.col;
    }

    public throwError(message: string): never
    {
        console.error(`(${this.line}:${this.col}) ${message}`);
        process.exit(0);
    }


    constructor(s: string)
    {
        this.inputString = s;
        this.pos = 0;
        this.line = 1;
        this.col = 0;
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

        if (this.peek() === '\n')
        {
            this.line++;
            this.col = 0;
        }
        else
        {
            this.col++;
        }

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
    public tokenList: Array<Token>;

    public throwError: (message: string) => never;


    constructor(s: string)
    {
        this.inputString = s;
        this.charStream = new __CharStream(s);
        this.tokenList = [];
        this.throwError = this.charStream.throwError;
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
                this.throwError(`Encountered line break instead of quote.`);
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

    private skipComment(): SpecToken
    {
        this.readWhile((char, before, after, readString) => char !== '\n');
        this.charStream.next();

        return {
            type : 'spec',
            value : 'LINEBREAK',
        };
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
                return this.skipComment();
            }

            return convertLogicalOperator(token);
        }

        if (isPunctuation(char))
        {
            this.charStream.next();

            return {
                type : 'punc',
                value : char,
            };
        }

        if (isOperatorChar(char))
        {
            return {
                type : 'oper',
                value : this.readWhile((char, before, after, readString) => isOperatorChar(char)),
            };
        }

        this.throwError(`Cannot handle character : "${char}"`);
    }



    /**
     * Peek at the token before current.
     */
    public peekBefore(): Token | null
    {
        return this.tokenList[this.tokenList.length - 2] ?? null;
    }

    /**
     * Peek at the current token in stream.
     */
    public peek(): Token | null
    {
        return this.tokenList[this.tokenList.length - 1] ?? null;
    }


    public next(): Token | null
    {
        if (this.isEndOfStream())
        {
            return null;
        }

        let token = this.readNext();
        this.tokenList.push(token);

        return token;
    }


    public isEndOfStream(): boolean
    {
        const __lastToken = this.peek();
        if (__lastToken === null) return false;

        return __lastToken.type === 'spec' && __lastToken.value === 'ENDOFSTREAM';
    }


    public analyse(): Array<Token>
    {
        do
        {
            this.tokenList.push( this.readNext() );
        }
        while (!this.isEndOfStream())

        return this.tokenList;
    }
}
