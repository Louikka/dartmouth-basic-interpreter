// @ts-ignore
import { parenthesizeExpression } from './__helpers__.ts';
// @ts-ignore
import { Lexer } from './Lexer.ts';


export class Parser
{
    private lexer: Lexer;

    public throwError: (message: string) => never;


    constructor(lexer: Lexer)
    {
        this.lexer = lexer;
        this.throwError = this.lexer.throwError;
    }


    /**
     * @param predicate test function.
     */
    private readWhile(predicate: (token: Token, readList: Token[]) => boolean): Token[]
    {
        let tList: Token[] = [];

        while (!this.lexer.isEndOfStream() && this.lexer.peek() !== null && predicate(this.lexer.peek()!, tList))
        {
            tList.push(this.lexer.peek()!);
            this.lexer.next();
        }

        return tList;
    }


    private parseNumber(): NumNode
    {
        const T = this.lexer.next();
        if (T === null || T.type !== 'num')
        {
            this.throwError(`Expected a number.`);
        }

        return {
            type : 'NUMBER',
            value : T.value,
        };
    }

    private parseString(): StrNode
    {
        const T = this.lexer.next();
        if (T === null || T.type !== 'str')
        {
            this.throwError(`Expected a string.`);
        }

        return {
            type : 'STRING',
            value : T.value,
        };
    }

    private parseBinary()//: BinNode
    {
        //
    }

    private readExpression()
    {
        let expr = this.readWhile((T, tl) => T.type === 'spec' && T.value === 'LINEBREAK');
        let parenthesized = parenthesizeExpression(expr);
    }


    /*
    private parseStatement()
    {
        const __lineNumber = this.lexer.next();
        if (__lineNumber === null) return;
        const __statement = this.lexer.next();
        if (__statement === null) return;

        if (__statement.type !== 'keyw')
        {
            return;
        }

        let __value: any;

        switch (__statement.value)
        {
            case 'LET':
            {
                __value = this.parseLETStatement();
            }

            default:
            {
                this.throwError(`Cannot parse statement.`);
            }
        }
    }

    private parseLETStatement()
    {
        //let rest = this.readWhile((t) => t.type === 'spec' && t.value === 'LINEBREAK');
        const __variable = this.lexer.next();
        const __operator = this.lexer.next();
        const __expression = this.lexer.next();
    }
    */
}
