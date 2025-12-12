// @ts-ignore
import { BASICStatements } from './__constants__.ts';
import {
    parenthesizeExpression,
    parseParenthesizedBinaryExpression,
    readParenthesis
// @ts-ignore
} from './__helpers__.ts';
// @ts-ignore
import { Lexer } from './Lexer.ts';


export class Parser
{
    private lexer: Lexer;

    public throwError: typeof this.lexer.throwError;


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
        let tList: Array<Token> = [];

        while (!this.lexer.isEndOfStream() && predicate(this.lexer.next(), tList))
        {
            tList.push(this.lexer.peek()!);
        }

        return tList;
    }


    private parseNumber(): NumNode
    {
        const T = this.lexer.next();
        if (T === null || T.type !== 'num')
        {
            this.throwError(`Expected a number (reading "${T.value}").`);
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
            this.throwError(`Expected a string (reading "${T.value}").`);
        }

        return {
            type : 'STRING',
            value : T.value,
        };
    }

    private parseVariable(): VarNode
    {
        const T = this.lexer.next();
        if (T === null || T.type !== 'var')
        {
            this.throwError(`Expected a variable name (reading "${T.type}").`);
        }

        return {
            type : 'VARIABLE',
            name : T.value,
        };
    }

    private parseExpression(parenthesizedExpr: Token[]): __ExprNode
    {
        if (parenthesizedExpr[0].value === '(')
        {
            // check if there is another binary expression on the same level
            let binPreParsed = parseParenthesizedBinaryExpression(parenthesizedExpr);
            if (binPreParsed.operator !== null)
            {
                return {
                    type : 'BINARY',
                    operator : binPreParsed.operator,
                    left : this.parseExpression(binPreParsed.left),
                    right : this.parseExpression(binPreParsed.right),
                };
            }

            let read = readParenthesis(parenthesizedExpr);
            let binParsed = parseParenthesizedBinaryExpression(read);

            if (binParsed.operator === null)
            {
                return this.parseExpression(binParsed.expression);
            }
            else
            {
                return {
                    type : 'BINARY',
                    operator : binParsed.operator,
                    left : this.parseExpression(binParsed.left),
                    right : this.parseExpression(binParsed.right),
                };
            }
        }
        else
        {
            if (parenthesizedExpr[0].type === 'num')
            {
                return {
                    type : 'NUMBER',
                    value : parenthesizedExpr[0].value,
                };
            }
            else if (parenthesizedExpr[0].type === 'var')
            {
                return {
                    type : 'VARIABLE',
                    name : parenthesizedExpr[0].value,
                };
            }
            else
            {
                this.throwError(`Cannot parse expression : unexpected token (reading "${parenthesizedExpr[0].type}").`);
            }
        }
    }

    private parseAssign(): AsgnNode
    {
        const variable = this.parseVariable();

        const operator = this.lexer.next();
        if (operator.type !== 'oper' || operator.value !== '=')
        {
            this.throwError(`Expected an assignment operator ("=") (reading "${operator.type}").`);
        }

        const expression = this.readWhile((T, tl) => T.type !== 'spec' || T.value !== 'LINEBREAK');
        const parenthesizedExpr = parenthesizeExpression(expression);

        return {
            type : 'ASSIGN',
            variable : variable,
            expression : this.parseExpression(parenthesizedExpr),
        };
    }


    private parseStatement(): ASTStatement
    {
        const __lineNumber = this.parseNumber();

        const __statement = this.lexer.next();
        if (__statement.type !== 'keyw' || !BASICStatements.includes(__statement.value))
        {
            this.throwError(`Expected a statement (reading "${__statement.value}").`);
        }


        switch (__statement.value)
        {
            case 'LET':
            {
                return {
                    line_number : __lineNumber.value,
                    statement : 'LET',
                    value : this.parseAssign(),
                };
            }

            default:
            {
                this.throwError(`Cannot parse statement.`);
            }
        }
    }



    public parse(): ASTRoot
    {
        let __return: Array<ASTStatement> = [];

        while (!this.lexer.isEndOfStream())
        {
            __return.push( this.parseStatement() );
        }

        return {
            type : 'PROGRAM',
            value : __return,
        };
    }
}
