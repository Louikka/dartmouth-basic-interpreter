// @ts-ignore
import { convertLogicalOperator, isDigit, isKeyword, isKeywordStart, isOperatorChar, isPunctuation, isVar, isVarStart, isWhitespace } from './__utils__.ts';


export class __CharStream
{
    private input: string;

    public get streamLength(): number
    {
        return this.input.length;
    }

    private pos: number;
    private line: number;
    private col: number;

    public get charPositionAbs(): number
    {
        return this.pos;
    }
    public get currentLineAbs(): number
    {
        return this.line;
    }
    public get columnInLine(): number
    {
        return this.col;
    }


    constructor(input: string)
    {
        this.input = input;
        this.pos = 0;
        this.line = 1;
        this.col = 0;
    }


    /**
     * Peek at the character before current.
     */
    public peekBefore(): string
    {
        return this.input.charAt(this.pos - 1);
    }

    /**
     * Peek at the current character in stream.
     */
    public peek(): string
    {
        return this.input.charAt(this.pos);
    }

    /**
     * Peek at the character after current.
     */
    public peekAfter(): string
    {
        return this.input.charAt(this.pos + 1);
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
    private charStream: __CharStream;
    private tokenList: Array<Token>;

    public throwError(message: string)
    {
        throw new Error(`(${this.charStream.currentLineAbs}:${this.charStream.columnInLine}) ${message}`);
    }


    constructor(input: string)
    {
        this.charStream = new __CharStream(input);
        this.tokenList = [];
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


    private readNumber(): Token
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
    public __test_readNumber__()
    {
        return this.readNumber();
    }


    private readString(): Token
    {
        let s = '';

        while (!this.charStream.isEndOfStream())
        {
            let char = this.charStream.next();

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
    public __test_readString__()
    {
        return this.readString();
    }


    private readKeyword(): Token
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
    public __test_readKeyword__()
    {
        return this.readKeyword();
    }


    private readIdentifier(): Token
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
    public __test_readIdentifier__()
    {
        return this.readIdentifier();
    }


    private skipComment()
    {
        this.readWhile((char, before, after, readString) => char !== '\n');
        this.charStream.next();
    }



    private readNext(): Token | null
    {
        // skip all whitespaces
        this.readWhile((char, before, after, readString) => isWhitespace(char));

        if (this.charStream.isEndOfStream()) return null;

        let char = this.charStream.peek();


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

        console.error(`Cannot handle character : "${char}"`);
        return null;
    }


    public analyse()
    {
        let token = this.readNext();

        while (token !== null)
        {
            this.tokenList.push(token);
            token = this.readNext();
        }

        return this.tokenList;
    }
}
