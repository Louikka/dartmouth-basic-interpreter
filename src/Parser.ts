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


    /*
    private parseLETStatement(): LETStatement | null
    {
        const __lineNumber = this.parseNumber();
        const __statement = this.parseStatement();
        if (__statement !== 'LET')
        {
            return null;
        }

        let rest = this.readWhile((t) => t.type === 'spec' && t.value === 'LINEBREAK');

        return {
            line_number : __lineNumber,
            statement : 'LET',
            value : {
                type : 'ASSIGN',
                operator : '=',
                left : VarNode,
                right : NumNode | VarNode | BinNode;
            },
        };
    }
    */
}
