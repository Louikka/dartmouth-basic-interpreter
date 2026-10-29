import { BASICIllFormulaError } from '../errors';
import { isFunction, isKeyword, isOperator, isPunctuation, isRelation } from '../lexemes';
import { isDigit, isLetter, isWhitespace } from './is';
import {
    Token,
    TokenInvalid,
    TokenNumber,
    TokenString,
    TokenWord,
    type WordType,
} from './tokens';


class Scanner
{
    constructor(s: string)
    {
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

    /** Reports whether there is still characters to read. */
    public isEOF(): boolean
    {
        return this.pos >= this.s.length;
    }


    public readwhile(predicate: (char: string, before: string, after: string, s: string) => boolean): string
    {
        let s = '';

        while (!this.isEOF() && predicate(this.peek(), this.peek(-1), this.peek(1), s))
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

        return new TokenNumber(parseFloat(n), n, 0);
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
                throw new BASICIllFormulaError(`Encountered end of input (expected '"').`);
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

        return new TokenString(s, `"${s}"`, 0);
    }

    public readVariable(): TokenWord
    {
        let v = this.readwhile((char, b, a, s) =>
        {
            if (s.length === 0 && isLetter(char)) return true;
            if (s.length === 1 && isDigit(char)) return true;
            // if (s.length === 2) return false;
            return false;
        });

        return new TokenWord(v, 'VARIABLE', v, 0);
    }

    public readWord(): TokenWord
    {
        let type: WordType | undefined = undefined;
        let v = this.readwhile((char, b, a, s) =>
        {
            if (isKeyword(s))
            {
                type = 'KEYWORD';
                return false;
            }

            if (isFunction(s))
            {
                type = 'FUNCTION';
                return false;
            }

            return /[A-Z]/i.test(char);
        });

        if (type === undefined)
        {
            throw new BASICIllFormulaError(`Cannot determine keyword type (reading "${v}").`);
        }

        return new TokenWord(v, type, v, 0);
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

        if (char === '"')
        {
            return this.readString();
        }

        if (isDigit(char))
        {
            return this.readNumber();
        }

        if (isLetter(char) && !isLetter(this.peek(1)))
        {
            return this.readVariable();
        }

        if (isLetter(char))
        {
            const token = this.readWord();

            if (token.value === 'REM')
            {
                //this.skipComment();
            }

            return token;
        }

        if (isPunctuation(char))
        {
            this.next();

            return new TokenInvalid();
        }

        if (isOperator(char))
        {
            return new TokenInvalid();
        }

        if (isRelation(char))
        {
            return new TokenInvalid();
        }

        throw new BASICIllFormulaError(`Undefined character "${char}".`);
    }
}


















// function readNextToken(stream: __CharStream): Token
// {
//     // skip all whitespaces
//     readWhile(stream, (char, before, after, readString) => isWhitespace(char));


//     if (char === '\n')
//     {
//         stream.next();

//         return {
//             type : 'spec',
//             value : 'LINEBREAK',
//         };
//     }

//     if (char === '"')
//     {
//         return readString(stream);
//     }

//     if (isDigit(char))
//     {
//         return readNumber(stream);
//     }

//     if (isVarStart(char) && !isKeywordStart(stream.peekAfter()))
//     {
//         return readIdentifier(stream);
//     }

//     if (isKeywordStart(char))
//     {
//         const token = readKeyword(stream);

//         if (token.value === 'REM')
//         {
//             skipComment(stream);
//         }

//         return token;
//     }

//     if (isPunctuation(char))
//     {
//         stream.next();

//         return {
//             type : 'punc',
//             value : char,
//         };
//     }

//     if (isOperator(char))
//     {
//         stream.next();

//         return {
//             type : 'oper',
//             value : char,
//         };
//     }

//     if (isRelation(char))
//     {
//         return {
//             type : 'rel',
//             value : readWhile(stream, (char, before, after, readString) => isRelation(char)),
//         };
//     }

//     throw new Error(BASICErrors.ILL_FORMULA);
// }
