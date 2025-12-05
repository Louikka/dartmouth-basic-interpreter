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
}
