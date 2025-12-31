import {
    BASICConditionOperators,
    BASICFunctions,
    BASICOperators,
    BASICStatements,
    binTokens,
// @ts-ignore
} from './__helpers.ts';
// @ts-ignore
import { BASICErrors } from './errors.ts';


type ErrorLog = {
    basic: string | null;
    extended: string | null;
}

export const __ERROR_LOG__: ErrorLog = {
    basic : null,
    extended : null,
};


class __TokenStream
{
    private input: Array<Token>;

    public get streamLength(): number
    {
        return this.input.length;
    }

    private pos: number;

    public get currentPosition(): number
    {
        return this.pos;
    }

    /** Already read tokens from input. */
    public get __readAll(): Array<Token>
    {
        return this.input.slice(0, this.pos);
    }

    private readLine: Array<Token> = [];

    /** Already read tokens from input from last line-break token (`{ type : "spec", value : "LINEBREAK" }`). */
    public get __readLine(): Array<Token>
    {
        return this.readLine;
    }


    constructor(arr: Array<Token>)
    {
        this.input = arr;
        this.pos = 0;
    }


    public peek(step = 0): Token
    {
        return this.input[this.pos + step];
    }

    /** Alias for `__TokenStream.peek(-1)`. */
    public peekBefore(): Token
    {
        return this.peek(-1);
    }
    /** Alias for `__TokenStream.peek(1)`. */
    public peekAfter(): Token
    {
        return this.peek(1);
    }


    public next(): Token
    {
        const __token = this.peek();
        if (__token.type === 'spec' && __token.value === 'LINEBREAK')
        {
            this.readLine = [];
        }
        else
        {
            this.readLine.push(__token);
        }

        this.pos++;
        return this.peek();
    }


    public isEndOfStream(): boolean
    {
        const token = this.peek();

        const isOverflow = this.pos >= this.streamLength;
        const isTokenUndefined = token === undefined || token === null;

        return isOverflow || isTokenUndefined || (token.type === 'spec' && token.value === 'ENDOFSTREAM');
    }
}


export class Parser
{
    constructor(tokenList: Token[])
    {
        this.originalInput = tokenList;
        this.tokenStream = new __TokenStream(this.originalInput);
    }



    private originalInput: Token[];
    private tokenStream: __TokenStream;


    public __resetStream()
    {
        this.tokenStream = new __TokenStream(this.originalInput);
    }


    private readToken(errorMessage?: string): Token
    {
        const token = this.tokenStream.peek();
        if (token === undefined || token === null)
        {
            __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
            __ERROR_LOG__.extended = `Error at Parser.(private)readToken() : Cannot read token.`;
            throw new Error();
        }

        this.tokenStream.next();

        return token;
    }

    /**
     * @param predicate test function. Reads while returns `true`.
     */
    private readWhile(predicate: (token: Token, readList: Token[]) => boolean): Token[]
    {
        let tl: Token[] = [];

        while (!this.tokenStream.isEndOfStream() && predicate(this.tokenStream.peek(), tl))
        {
            tl.push( this.readToken() );
        }

        return tl;
    }


    private readParentheses(): Token[]
    {
        const __currToken = this.tokenStream.peek();
        if (__currToken === undefined || __currToken === null || __currToken.value !== '(')
        {
            __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
            __ERROR_LOG__.extended = `Error at Parser.(private)readParentheses() : Expected a parenthesis.`;
            throw new Error();
        }

        let depth = 1;
        let __return: Token[] = [];

        while (!__isLineBreakOrEOF(this.tokenStream.peek()))
        {
            const token = this.tokenStream.next();
            if (token === undefined || token === null)
            {
                __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
                __ERROR_LOG__.extended = `Error at Parser.(private)readParentheses() : Expected a closing parenthesis.`;
                throw new Error();
            }

            if (token.value === '(')
            {
                depth++;
                if (depth === 1) continue;
            }
            else if (token.value === ')' && depth > 0)
            {
                depth--;
                if (depth === 0) break;
            }

            if (depth > 0)
            {
                __return.push(token);
                continue;
            }
        }

        this.tokenStream.next();

        return __return;
    }

    private readExpressionUntilComma(): Token[]
    {
        return this.readWhile((t, tl) => !__isLineBreakOrEOF(t) && t.value !== ',');
    }


    private parseNumber(): NumNode
    {
        const token = this.readToken();
        if (token.type !== 'num')
        {
            __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
            __ERROR_LOG__.extended = `Error at Parser.(private)parseNumber() : Expected a number, but got "${token.type}".`;
            throw new Error();
        }

        return {
            type : 'NUMBER',
            value : token.value,
        };
    }

    private parseString(): StrNode
    {
        const token = this.readToken();
        if (token.type !== 'str')
        {
            __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
            __ERROR_LOG__.extended = `Error at Parser.(private)parseString() : Expected a string, but got "${token.type}".`;
            throw new Error();
        }

        return {
            type : 'STRING',
            value : token.value,
        };
    }

    private parseVariable(): VarNode
    {
        const token = this.readToken();
        if (token.type !== 'var')
        {
            __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
            __ERROR_LOG__.extended = `Error at Parser.(private)parseVariable() : Expected a variable name, but got "${token.type}".`;
            throw new Error();
        }

        const nextToken = this.tokenStream.peek();

        if (nextToken !== null && nextToken.value === '(')
        {
            let __readSubscript = this.readParentheses();
            let __subscript = parseCommaSeparatedValues(__readSubscript);

            if (__subscript.length > 1)
            {
                return {
                    type : 'TABLEVAR',
                    name : token.value,
                    subscripts : {
                        sub1 : this.parseExpression(__subscript[0]),
                        sub2 : this.parseExpression(__subscript[1]),
                    },
                };
            }
            else
            {
                return {
                    type : 'LISTVAR',
                    name : token.value,
                    subscript : this.parseExpression(__subscript[0]),
                };
            }
        }
        else
        {
            return {
                type : 'VARIABLE',
                name : token.value,
            };
        }
    }

    private parseExpression(input: Token[]): ExprNode
    {
        let pExpr = parenthesizeExpression(input);
        return parseParenthesizedExpression(pExpr);
    }

    private parseStatement(): ASTStatement
    {
        const lineNumber = this.parseNumber();

        const statement = this.readToken();
        if (statement.type !== 'keyw')
        {
            __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Expected a statement, but got "${statement.type}".`;
            throw new Error();
        }
        if (!BASICStatements.includes(statement.value))
        {
            __ERROR_LOG__.basic = BASICErrors.ILL_INSTRUCTION;
            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Expected a valid BASIC statement, but got "${statement.value}".`;
            throw new Error();
        }


        switch (statement.value)
        {
            // `break;` on the end of the case label is for safety reasons.
            // (Also, in VSCode it makes case label fold nicely)
            // Do not remove.

            case 'LET':
            {
                const variable = this.parseVariable();

                const __relation = this.readToken();
                if (__relation.type !== 'rel' || __relation.value !== '=')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse LET statement : Expected an assignment operator ("="), but got "${__relation.value}".`;
                    throw new Error();
                }

                const expression = this.readWhile((t, tl) => !__isLineBreakOrEOF(t));

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : {
                        variable : variable,
                        expression : this.parseExpression(expression),
                    },
                };
            }break;
            case 'READ':
            {
                let vars = [];

                while (!__isLineBreakOrEOF(this.tokenStream.peek()))
                {
                    vars.push( this.parseVariable() );

                    let maybeComma = this.tokenStream.peek();

                    if (maybeComma !== null && maybeComma.value === ',')
                    {
                        this.tokenStream.next();
                        continue;
                    }
                    else
                    {
                        if (__isLineBreakOrEOF(this.tokenStream.peek()))
                        {
                            break;
                        }
                        else
                        {
                            __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse READ statement : Expected a comma or a line break.`;
                            throw new Error();
                        }
                    }
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : vars,
                };
            }break;
            case 'DATA':
            {
                let data = [];

                while (!__isLineBreakOrEOF(this.tokenStream.peek()))
                {
                    data.push( this.parseNumber() );

                    let maybeComma = this.tokenStream.peek();

                    if (maybeComma !== null && maybeComma.value === ',')
                    {
                        this.tokenStream.next();
                        continue;
                    }
                    else
                    {
                        if (__isLineBreakOrEOF(this.tokenStream.peek()))
                        {
                            break;
                        }
                        else
                        {
                            __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DATA statement : Expected a comma or a line break.`;
                            throw new Error();
                        }
                    }
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : data,
                };
            }break;
            case 'PRINT':
            {
                let data: Array<StrNode | [ StrNode, ExprNode ] | ExprNode> = [];
                let isLastIsComma = false;

                while (!__isLineBreakOrEOF(this.tokenStream.peek()))
                {
                    const token = this.tokenStream.peek();
                    if (token === undefined || token === null)
                    {
                        __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                        __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse PRINT statement : Cannot parse label or expression.`;
                        throw new Error();
                    }

                    if (token.type === 'str')
                    {
                        const string = this.parseString();

                        const nextToken = this.tokenStream.peek();
                        if (!__isLineBreakOrEOF(nextToken) && nextToken !== null && nextToken.value !== ',')
                        {
                            const expression = this.readExpressionUntilComma();

                            data.push([ string, this.parseExpression(expression) ]);
                        }
                        else
                        {
                            data.push(string);
                        }

                        isLastIsComma = false;
                        continue;
                    }
                    else if (token.type === 'punc' && token.value === ',')
                    {
                        this.tokenStream.next();
                        isLastIsComma = true;
                        continue;
                    }
                    else
                    {
                        const expression = this.readExpressionUntilComma();

                        data.push(this.parseExpression(expression));
                        isLastIsComma = false;
                        continue;
                    }
                }

                //if (!isLastIsComma) data.push({ type : 'STRING', value : '\n', });

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : data,
                };
            }break;
            case 'GOTO':
            {
                const GOTOLineNumber = this.parseNumber();
                if (GOTOLineNumber.value < 0 || !Number.isInteger(GOTOLineNumber.value))
                {
                    __ERROR_LOG__.basic = BASICErrors.ILL_LINE_NUM;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse GOTO statement : Expected a line number (non-negative integer).`;
                    throw new Error();
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : GOTOLineNumber,
                };
            }break;
            case 'IF':
            {
                const exprLeft = this.readWhile((t, tl) => t.type !== 'rel');

                const relation = this.readToken();
                if (relation.type !== 'rel')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse IF statement : Expected a relation operator, but got "${relation.type}".`;
                    throw new Error();
                }
                if (!BASICConditionOperators.includes(relation.value))
                {
                    __ERROR_LOG__.basic = BASICErrors.ILL_REL;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse IF statement : Expected one of the six permissable relation operators ("<", ">", "=", "<=", ">=" or "<>"), but got "${relation.value}".`;
                    throw new Error();
                }

                const exprRight = this.readWhile((t, tl) => t.type !== 'keyw');

                const __THENKeyw = this.readToken();
                if (__THENKeyw.value !== 'THEN')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse IF statement : Expected a "THEN" keyword, but got "${__THENKeyw.value}".`;
                    throw new Error();
                }

                const THENLineNumber = this.parseNumber();
                if (THENLineNumber.value < 0 || !Number.isInteger(THENLineNumber.value))
                {
                    __ERROR_LOG__.basic = BASICErrors.ILL_LINE_NUM;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse IF statement : Expected a line number (non-negative integer).`;
                    throw new Error();
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : {
                        expression_left : this.parseExpression(exprLeft),
                        relation : relation.value,
                        expression_right : this.parseExpression(exprRight),
                        then : THENLineNumber,
                    },
                };
            }break;
            case 'FOR':
            {
                // unsubscripted variable
                const unsubVar = this.parseVariable();
                if (unsubVar.type !== 'VARIABLE')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse FOR statement : Expected an unsubscripted variable.`;
                    throw new Error();
                }

                // =
                const __relation = this.readToken();
                if (__relation.type !== 'rel' || __relation.value !== '=')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse FOR statement : Expected an assignment operator ("="), but got "${__relation.value}".`;
                    throw new Error();
                }

                // expression
                const assignExpression = this.readWhile((t, tl) => t.type !== 'keyw');

                // TO
                const __TOKeyw = this.readToken();
                if (__TOKeyw.value !== 'TO')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse FOR statement : Expected a "TO" keyword, but got "${__TOKeyw.value}".`;
                    throw new Error();
                }

                // expression
                const TOExpression = this.readWhile((t, tl) => t.type !== 'keyw');

                // (optional)

                // STEP
                const __STEPKeyw = this.tokenStream.peek();

                // expression
                let STEPExpr: Array<Token>;

                if (__isLineBreakOrEOF(__STEPKeyw))
                {
                    // if STEP is omitted (defaults to 1 (maybe))
                    // `Omitting the STEP part is the same as assuming the step-size to be unity.`
                    STEPExpr = [ { type : 'num', value : 1, } ];
                }
                else
                {
                    if (__STEPKeyw.value !== 'STEP')
                    {
                        __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                        __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse FOR statement : Expected a "STEP" keyword, but got "${__STEPKeyw.value}".`;
                        throw new Error();
                    }

                    this.tokenStream.next();
                    STEPExpr = this.readWhile((t, tl) => !__isLineBreakOrEOF(t));
                }


                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : {
                        variable : unsubVar,
                        expression : this.parseExpression(assignExpression),
                        to : this.parseExpression(TOExpression),
                        step : this.parseExpression(STEPExpr),
                    },
                };
            }break;
            case 'NEXT':
            {
                const unsubVar = this.parseVariable();
                if (unsubVar.type !== 'VARIABLE')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse NEXT statement : Expected an unsubscripted variable.`;
                    throw new Error();
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : unsubVar,
                };
            }break;
            case 'END':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                };
            }break;
            case 'STOP':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                };
            }break;
            case 'DEF':
            {
                // FN
                const __FNKeyw = this.readToken();
                if (__FNKeyw.value !== 'FN')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DEF statement : Expected a "FN" keyword, but got "${__FNKeyw.value}".`;
                    throw new Error();
                }

                // letter
                const letter = this.readToken();
                if (letter.type !== 'var')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DEF statement : Expected a function name.`;
                    throw new Error();
                }

                // unsubscripted variable
                const unsubVar = this.readParentheses();
                if (unsubVar.length > 1 || unsubVar[0].type !== 'var')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DEF statement : Expected an unsubscripted variable.`;
                    throw new Error();
                }

                // =
                const __relation = this.readToken();
                if (__relation.type !== 'rel' || __relation.value !== '=')
                {
                    __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DEF statement : Expected an assignment operator ("="), but got "${__relation.value}".`;
                    throw new Error();
                }

                // expression
                const expression = this.readWhile((t, tl) => !__isLineBreakOrEOF(t));

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : {
                        name : __FNKeyw.value + letter.value,
                        variable : {
                            type : 'VARIABLE',
                            name : unsubVar[0].value,
                        },
                        expression : this.parseExpression(expression),
                    },
                };
            }break;
            case 'GOSUB':
            {
                const GOSUBLineNumber = this.parseNumber();
                if (GOSUBLineNumber.value < 0 || !Number.isInteger(GOSUBLineNumber.value))
                {
                    __ERROR_LOG__.basic = BASICErrors.ILL_LINE_NUM;
                    __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse GOSUB statement : Expected a line number (non-negative integer).`;
                    throw new Error();
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : GOSUBLineNumber,
                };
            }break;
            case 'RETURN':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                };
            }break;
            case 'DIM':
            {
                let dims: __Dimension[] = [];

                while (!__isLineBreakOrEOF(this.tokenStream.peek()))
                {
                    const letter = this.readToken();
                    if (letter.type !== 'var')
                    {
                        __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                        __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DIM statement : Cannot parse a letter.`;
                        throw new Error();
                    }

                    const __paren = this.readParentheses();
                    if (__paren.length > 1)
                    {
                        const int1 = __paren[0];
                        if (int1.type !== 'num' || !Number.isInteger(int1.value))
                        {
                            __ERROR_LOG__.basic = BASICErrors.ILL_CONST;
                            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DIM statement : Expected an integer.`;
                            throw new Error();
                        }

                        const __comma = __paren[1];
                        if (__comma === undefined || __comma.value !== ',')
                        {
                            __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DIM statement : Expected a comma.`;
                            throw new Error();
                        }

                        const int2 = __paren[2];
                        if (int2 === undefined || int2.type !== 'num' || !Number.isInteger(int2.value))
                        {
                            __ERROR_LOG__.basic = BASICErrors.ILL_CONST;
                            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DIM statement : Expected an integer.`;
                            throw new Error();
                        }

                        dims.push({
                            type : 'table',
                            name : letter.value,
                            dim1 : int1.value,
                            dim2 : int2.value,
                        });
                    }
                    else if (__paren.length === 1)
                    {
                        const integer = __paren[0];
                        if (integer.type !== 'num' || !Number.isInteger(integer.value))
                        {
                            __ERROR_LOG__.basic = BASICErrors.ILL_CONST;
                            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DIM statement : Expected an integer.`;
                            throw new Error();
                        }

                        dims.push({
                            type : 'list',
                            name : letter.value,
                            dim : integer.value,
                        });
                    }
                    else
                    {
                        __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                        __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DIM statement : Cannot read parentheses.`;
                        throw new Error();
                    }


                    let maybeComma = this.tokenStream.peek();

                    if (maybeComma !== null && maybeComma.value === ',')
                    {
                        this.tokenStream.next();
                        continue;
                    }
                    else
                    {
                        if (__isLineBreakOrEOF(this.tokenStream.peek()))
                        {
                            break;
                        }
                        else
                        {
                            __ERROR_LOG__.basic = BASICErrors.INCORR_FORMAT;
                            __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Trying to parse DIM statement : Expected a comma or a line break.`;
                            throw new Error();
                        }
                    }
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : dims,
                };
            }break;
            case 'REM':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                };
            }break;

            default:
            {
                __ERROR_LOG__.extended = `Error at Parser.(private)parseStatement() : Cannot parse statement "${statement.value}".`;
                throw new Error();
            }
        }
    }


    public parse(): ASTRoot
    {
        if (this.tokenStream.currentPosition !== 0)
        {
            this.__resetStream();
        }

        let ASTStatements: Array<ASTStatement> = [];

        while (!this.tokenStream.isEndOfStream())
        {
            ASTStatements.push( this.parseStatement() );
            this.tokenStream.next();
        }

        return {
            type : 'PROGRAM',
            value : ASTStatements,
        };
    }
}



function parenthesizeExpression(input: Token[]): Token[]
{
    // https://en.wikipedia.org/wiki/Operator-precedence_parser#Full_parenthesization
    //

    let __return: Token[] = [];
    __return.push( ...new Array(4).fill(binTokens.parenOpen) );

    for (let i = 0; i !== input.length; i++)
    {
        const token = input[i];

        switch (token.value)
        {
            case '(':
            {
                __return.push( ...new Array(4).fill(binTokens.parenOpen) );
                continue;
            }
            case ')':
            {
                __return.push( ...new Array(4).fill(binTokens.parenClose) );
                continue;
            }
            case ',':
            {
                __return.push(
                    ...new Array(3).fill(binTokens.parenClose),
                    { type : 'punc', value : ',', },
                    ...new Array(3).fill(binTokens.parenOpen),
                );
                continue;
            }
            case '^':
            {
                __return.push(
                    binTokens.parenClose,
                    binTokens.caret,
                    binTokens.parenOpen
                );
                continue;
            }
            case '*':
            {
                __return.push(
                    ...new Array(2).fill(binTokens.parenClose),
                    binTokens.star,
                    ...new Array(2).fill(binTokens.parenOpen)
                );
                continue;
            }
            case '/':
            {
                __return.push(
                    ...new Array(2).fill(binTokens.parenClose),
                    binTokens.slash,
                    ...new Array(2).fill(binTokens.parenOpen)
                );
                continue;
            }
            case '+':
            {
                const prevToken = input[i - 1];

                // unary check: either first or had an operator expecting secondary argument
                if (i === 0 || (prevToken.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevToken.value)))
                {
                    __return.push(binTokens.plus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(binTokens.parenClose),
                        binTokens.plus,
                        ...new Array(3).fill(binTokens.parenOpen)
                    );
                }

                continue;
            }
            case '-':
            {
                const prevToken = input[i - 1];

                if (i === 0 || (prevToken.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevToken.value)))
                {
                    __return.push(binTokens.minus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(binTokens.parenClose),
                        binTokens.minus,
                        ...new Array(3).fill(binTokens.parenOpen)
                    );
                }

                continue;
            }
        }

        __return.push(token);
    }

    __return.push( ...new Array(4).fill(binTokens.parenClose) );

    return __return;
}

function parseParenthesizedExpression(pExpr: Token[]): ExprNode
{
    if (pExpr[0].value === '(')
    {
        // check if there is another binary expression on the same level
        let binPreParsed = __parseParenthesizedBinaryExpression(pExpr);
        if (binPreParsed.operator !== null)
        {
            return {
                type : 'BINARY',
                operator : binPreParsed.operator,
                left : parseParenthesizedExpression(binPreParsed.left),
                right : parseParenthesizedExpression(binPreParsed.right),
            };
        }

        let read = readParenthesesFromList(pExpr);
        let binParsed = __parseParenthesizedBinaryExpression(read);

        if (binParsed.operator === null)
        {
            return parseParenthesizedExpression(binParsed.expression);
        }
        else
        {
            return {
                type : 'BINARY',
                operator : binParsed.operator,
                left : parseParenthesizedExpression(binParsed.left),
                right : parseParenthesizedExpression(binParsed.right),
            };
        }
    }
    else
    {
        if (pExpr[0].type === 'num')
        {
            return {
                type : 'NUMBER',
                value : pExpr[0].value,
            };
        }
        else if (pExpr[0].type === 'var')
        {
            if (pExpr[1] !== undefined && pExpr[1].value === '(')
            {
                let __readSubscript = readParenthesesFromList(pExpr);
                let __subscript = parseCommaSeparatedValues(__readSubscript);

                if (__subscript.length > 1)
                {
                    return {
                        type : 'TABLEVAR',
                        name : pExpr[0].value,
                        subscripts : {
                            sub1 : parseParenthesizedExpression(readParenthesesFromList(__subscript[0])),
                            sub2 : parseParenthesizedExpression(readParenthesesFromList(__subscript[1])),
                        },
                    };
                }
                else
                {
                    return {
                        type : 'LISTVAR',
                        name : pExpr[0].value,
                        subscript : parseParenthesizedExpression(readParenthesesFromList(__subscript[0])),
                    };
                }
            }

            return {
                type : 'VARIABLE',
                name : pExpr[0].value,
            };
        }
        else if (pExpr[0].type === 'func')
        {
            if (!BASICFunctions.includes(pExpr[0].value))
            {
                __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
                __ERROR_LOG__.extended = `Error at parseParenthesizedExpression() : Cannot parse function call : Undefened function "${pExpr[0].value}".`;
                throw new Error();
            }

            return {
                type : 'FUNCCALL',
                name : pExpr[0].value,
                argument : parseParenthesizedExpression(readParenthesesFromList(pExpr)),
            };
        }
        else if (pExpr[0].type === 'keyw' && pExpr[0].value === 'FN')
        {
            if (pExpr[1] !== undefined && pExpr[1].type === 'var')
            {
                return {
                    type : 'UFUNCCALL',
                    name : pExpr[0].value + pExpr[1].value,
                    argument : parseParenthesizedExpression(readParenthesesFromList(pExpr)),
                };
            }
            else
            {
                __ERROR_LOG__.basic = BASICErrors.ILL_FORMULA;
                __ERROR_LOG__.extended = `Error at parseParenthesizedExpression() : Cannot parse function call : Unexpected token "${pExpr[1]}".`;
                throw new Error();
            }
        }
        else
        {
            __ERROR_LOG__.extended = `Error at parseParenthesizedExpression() : Cannot parse expression : Unexpected token "${pExpr[0]}".`;
            throw new Error();
        }
    }
}

/** Reads first encountered parentheses. */
function readParenthesesFromList(expr: Token[]): Token[]
{
    let depth = 0;
    let __return: Token[] = [];

    for (const token of expr)
    {
        if (token.value === binTokens.parenOpen.value)
        {
            depth++;
            if (depth === 1) continue;
        }
        else if (token.value === binTokens.parenClose.value && depth > 0)
        {
            depth--;
            if (depth === 0) break;
        }

        if (depth > 0)
        {
            __return.push(token);
            continue;
        }
    }

    return __return;
}


type __preBinNode = __preBinNodeOk | __preBinNodeNof;

/** If operator found. */
type __preBinNodeOk = {
    operator: string;
    left: Token[];
    right: Token[];
};
/** if operator not found. */
type __preBinNodeNof = {
    operator: null;
    expression: Token[];
};

function __parseParenthesizedBinaryExpression(pBinExpr: Token[]): __preBinNode
{
    let oper: Token | null = null;
    let left: Token[] = [];
    let right: Token[] = [];

    let depth = 0;
    let isLeftRead = false;

    for (const token of pBinExpr)
    {
        if (isLeftRead)
        {
            right.push(token);
            continue;
        }

        if (token.type === 'oper' && depth === 0)
        {
            oper = token;
            isLeftRead = true;
            continue;
        }
        else
        {
            left.push(token);
            if (token.value === '(') depth++;
            if (token.value === ')' && depth > 0) depth--;
            continue;
        }
    }

    if (oper === null)
    {
        return {
            operator : null,
            expression : left,
        };
    }
    else
    {
        return {
            operator : oper.value,
            left : left,
            right : right,
        };
    }
}

function parseCommaSeparatedValues(expr: Token[]): Array<Token[]>
{
    let values: Array<Token[]> = [];
    let __value: Token[] = [];

    let depth = 0;

    for (const token of expr)
    {
        if (token.value === ',' && depth === 0)
        {
            values.push(__value);
            __value = [];
            continue;
        }

        if (token.value === '(')
        {
            depth++;
        }
        else if (token.value === ')')
        {
            depth--;
        }

        __value.push(token);
    }

    values.push(__value);

    return values;
}

function __isLineBreakOrEOF(token: Token | null | undefined): boolean
{
    if (token === null || token === undefined) return true;

    return token.type === 'spec' && (token.value === 'LINEBREAK' || token.value === 'ENDOFSTREAM');
}
