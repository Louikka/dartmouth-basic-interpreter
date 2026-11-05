import { BASICIllFormulaError } from '../errors';
import { isFunction, isKeyword, isOperator, isPunctuation, isRelation } from './lexemes';
import { isDigit, isLetter, isWhitespace } from './is';
import {
    Token,
    TokenNumber,
    TokenOperator,
    TokenPunctuation,
    TokenString,
    TokenWord,
    type WordType,
} from './tokens';


/**
 * @param c current character.
 * @param b character before current (`null` if current character is first).
 * @param a character after current (`null` if current character is last).
 * @param s currently read string.
 */
type PredicateFunc = (c: string,
                      b: string | null,
                      a: string | null,
                      s: string) => boolean;


export class Scanner
{
    constructor(s: string)
    {
        // (maybe) TODO: transform to upper case everything except strings?
        this.s = s.trim().toUpperCase();
    }


    public s: string;
    public pos = 0;

    /** Peeks at the current character without consuming it. */
    public peek(offset = 0): string
    {
        const newPos = this.pos + offset;
        if (newPos < 0 || newPos >= this.s.length)
        {
            throw new BASICIllFormulaError('Overflow error: new position is out of bounds.');
        }

        return this.s.charAt(newPos);
    }

    /** Increments position by 1 and returns new character. */
    public next(): string
    {
        this.pos++;
        return this.peek();
    }

    /** Checks if character at current position is first. */
    public isFirst(): boolean
    {
        return this.pos === 0;
    }

    /** Checks if character at current position is last. */
    public isLast(): boolean
    {
        return this.pos === this.s.length - 1;
    }

    /**
     * Reports whether there is still characters to read.
     * @note if this is `true`, `peek()` will fail.
     */
    public isEOF(): boolean
    {
        return this.pos >= this.s.length;
    }


    public readwhile(predicate: PredicateFunc): string
    {
        let s = '';

        while (!this.isEOF())
        {
            const c = this.peek();
            const b = this.isFirst() ? null : this.peek(-1);
            const a = this.isLast() ? null : this.peek(1);

            if (!predicate(c, b, a, s)) break;

            s += c;
            this.pos++;
        }

        return s;
    }


    public readNumber(): TokenNumber
    {
        const currPos = this.pos;

        let ifFloat = false;
        let isScientific = false;

        let n = this.readwhile((c, b, a) =>
        {
            if (c === '.')
            {
                if (ifFloat) return false;
                ifFloat = true;
                return true;
            }

            if (c === 'E' && (a === '-' || isDigit(a)))
            {
                if (isScientific) return false;
                isScientific = true;
                return true;
            }

            if (c === '-' && isScientific && b === 'E')
            {
                return true;
            }

            return isDigit(c);
        });

        return new TokenNumber(Number(n), currPos, n);
    }

    public readString(): TokenString
    {
        const currPos = this.pos;

        let s = '';

        // skip initial quotation mark
        this.pos++;

        while (true)
        {
            if (this.isEOF())
            {
                throw new BASICIllFormulaError('Encountered unexpected end of string without quotation mark.');
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

            this.pos++;
        }

        return new TokenString(s, currPos, `"${s}"`);
    }

    public readWord(): TokenWord
    {
        const currPos = this.pos;
        let type: WordType | undefined = undefined;

        let v = this.readwhile((c, b, a, s) =>
        {
            if (s.length === 2 && isDigit(b))
            {
                return false;
            }

            if (isFunction(s))
            {
                return false;
            }

            if (isKeyword(s))
            {
                return false;
            }

            return isLetter(c) || (isDigit(c) && s.length === 1);
        });

        if (/^[A-Z][0-9]?$/.test(v))
        {
            type = 'VARIABLE';
        }
        else if (isFunction(v))
        {
            type = 'FUNCTION';
        }
        else if (isKeyword(v))
        {
            type = 'KEYWORD';
        }
        else
        {
            throw new BASICIllFormulaError(`Cannot determine keyword type (reading "${v}").`);
        }

        return new TokenWord(v, type, currPos, v);
    }

    public readOperator(): TokenOperator
    {
        const currPos = this.pos;

        let s = this.peek();

        if (!this.isLast())
        {
            const c2 = this.next();
            if (c2 === '=' || c2 === '>')
            {
                s += c2;
                this.pos++;
            }
        }

        return new TokenOperator(s, currPos, s);
    }

    public readPunctuation(): TokenPunctuation
    {
        const char = this.peek();
        this.pos++;
        return new TokenPunctuation(char, this.pos, char);
    }


    public skipComment()
    {
        const s = this.readwhile((c) => c !== '\n');
    }

    public readNextToken(): Token
    {
        // skip all whitespaces
        this.readwhile((char) => isWhitespace(char));

        if (this.isEOF())
        {
            throw new BASICIllFormulaError('Encountered end of file.');
        }

        const char = this.peek();

        if (isDigit(char))
        {
            return this.readNumber();
        }

        if (char === '"')
        {
            return this.readString();
        }

        if (isLetter(char))
        {
            const tw = this.readWord();
            if (tw.value === 'REM')
            {
                this.skipComment();
            }

            return tw;
        }

        if (isOperator(char) || isRelation(char))
        {
            return this.readOperator();
        }

        if (isPunctuation(char))
        {
            return this.readPunctuation();
        }

        throw new BASICIllFormulaError(`Undefined character "${char}".`);
    }
}


export function scanLine(line: string): Token[]
{
    if (line.includes('\n'))
    {
        throw new Error('Cannot scan line: line contains new line character ("\\n").');
    }

    const sc = new Scanner(line);
    const r: Token[] = [];

    while (!sc.isEOF())
    {
        r.push(sc.readNextToken());
    }

    return r;
}

export function scan(s: string): Array<Token[]>
{
    return s
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(scanLine);
}
