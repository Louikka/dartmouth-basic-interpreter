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

    /*
    private maybeBinary(left, my_prec)
    {
        let tok = is_op();

        if (tok)
        {
            let his_prec = PRECEDENCE[tok.value];
            if (his_prec > my_prec)
            {
                input.next();
                let right = this.maybeBinary(parse_atom(), his_prec) // (*);
                let binary = {
                    type     : tok.value == "=" ? "assign" : "binary",
                    operator : tok.value,
                    left     : left,
                    right    : right
                };

                return this.maybeBinary(binary, my_prec);
            }
        }

        return left;
    }
    */


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
