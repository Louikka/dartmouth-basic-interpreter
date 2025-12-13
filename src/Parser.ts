import {
    __Streamer,
    BASICOperators,
    BASICStatements,
    binTokens,
    stringifyTokens,
    throwError
// @ts-ignore
} from './__helpers__.ts';


export class Parser
{
    constructor(tokenList: Token[])
    {
        this.tokenStream = new __Streamer(tokenList);
        this.tokenStream.isEndOfStream = function ()
        {
            const token = this.peek();

            const isOverflow = this.currentPosition >= this.streamLength;

            return isOverflow || token === null || (token.type === 'spec' && token.value === 'ENDOFSTREAM');
        };
    }


    /** Enable or disable developer logging to console. */
    public devlog = false;

    private tokenStream: __Streamer<Token>;


    /**
     * @param predicate test function.
     */
    private readWhile(predicate: (token: Token, readList: Token[]) => boolean): Array<Token>
    {
        let tl: Token[] = [];

        while (!this.tokenStream.isEndOfStream() && predicate(this.tokenStream.next()!, tl))
        {
            tl.push(this.tokenStream.peek()!);
        }

        return tl;
    }


    private parseNumber(token?: Token): NumNode
    {
        const t = token ?? this.tokenStream.peek();
        if (t === null || t.type !== 'num')
        {
            if (this.devlog) console.log(t);
            throwError(`Parser error : Expected a number.`);
        }

        return {
            type : 'NUMBER',
            value : t.value,
        };
    }

    private parseString(token?: Token): StrNode
    {
        const t = token ?? this.tokenStream.peek();
        if (t === null || t.type !== 'str')
        {
            if (this.devlog) console.log(t);
            throwError(`Parser error : Expected a string.`);
        }

        return {
            type : 'STRING',
            value : t.value,
        };
    }

    private parseVariable(token?: Token): VarNode
    {
        const t = token ?? this.tokenStream.peek();
        if (t === null || t.type !== 'var')
        {
            if (this.devlog) console.log(t);
            throwError(`Parser error : Expected a variable name.`);
        }

        return {
            type : 'VARIABLE',
            name : t.value,
        };
    }

    private parseExpression(input: Token[]): ExprNode
    {
        let pExpr = parenthesizeExpression(input);
        return parseParenthesizedExpression(pExpr);
    }

    private parseAssign(): AsgnNode
    {
        const varToken = this.parseVariable();

        const operToken = this.tokenStream.next()!;
        if (operToken === null || operToken.type !== 'oper' || operToken.value !== '=')
        {
            if (this.devlog) console.log(operToken);
            throwError(`Parser error : Expected an assignment operator ("=").`);
        }

        const expression = this.readWhile((t, tl) => t.type !== 'spec');

        return {
            type : 'ASSIGN',
            variable : varToken,
            expression : this.parseExpression(expression),
        };
    }

    private parseStatement(): ASTStatement
    {
        /*
        const __t = this.tokenStream.peek();
        if (__t !== null && __t.type === 'spec' && __t.value === 'LINEBREAK') this.tokenStream.next();
        */

        const lineNumber = this.parseNumber();

        const statement = this.tokenStream.next();
        if (statement === null || statement.type !== 'keyw' || !BASICStatements.includes(statement.value))
        {
            if (this.devlog) console.log(statement);
            throwError(`Parser error : Expected a statement.`);
        }

        this.tokenStream.next();


        switch (statement.value)
        {
            case 'LET':
            {
                return {
                    line_number : lineNumber.value,
                    statement : 'LET',
                    value : this.parseAssign(),
                };
            }

            default:
            {
                throwError(`Parser error : Cannot parse statement "${statement.value}".`);
            }
        }
    }


    public parse(): ASTRoot
    {
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

        let read = readParenthesis(pExpr);
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
            if (pExpr[1].value === '(')
            {
                let __readSubscript = readParenthesis(pExpr);

                if (__readSubscript.some((t) => t.type === 'punc' && t.value === ','))
                {
                    return {
                        type : 'TABLEVAR',
                        name : {
                            type : 'VARIABLE',
                            name : pExpr[0].value,
                        },
                        subscripts : __parseTableSubscript(__readSubscript),
                    };
                }

                return {
                    type : 'LISTVAR',
                    name : {
                        type : 'VARIABLE',
                        name : pExpr[0].value,
                    },
                    subscript : parseParenthesizedExpression(readParenthesis(pExpr)),
                };
            }

            return {
                type : 'VARIABLE',
                name : pExpr[0].value,
            };
        }
        else if (pExpr[0].type === 'func')
        {
            return {
                type : 'FUNCCALL',
                name : pExpr[0].value,
                argument : parseParenthesizedExpression(readParenthesis(pExpr)),
            };
        }
        else if (pExpr[0].type === 'keyw' && pExpr[0].value === 'FN' && pExpr[1].type === 'var')
        {
            return {
                type : 'UFUNCCALL',
                name : {
                    type : 'VARIABLE',
                    name : pExpr[1].value,
                },
                argument : parseParenthesizedExpression(readParenthesis(pExpr)),
            };
        }
        else
        {
            throwError(`Parser error : Cannot parse expression : unexpected token : "${pExpr[0].type}".`);
        }
    }
}

function readParenthesis(expr: Token[]): Token[]
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

/** If operator found. */
type __preBinNodeOk = {
    operator: string;
    left: Token[];
    right: Token[];
}
/** if operator not found. */
type __preBinNodeNof = {
    operator: null;
    expression: Token[];
}
type __preBinNode = __preBinNodeOk | __preBinNodeNof;

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

function __parseTableSubscript(pExpr: Token[]): { sub1: ExprNode; sub2: ExprNode; }
{
    let sub1: Token[] = [];
    let sub2: Token[] = [];

    let isLeftRead = false;

    for (const token of pExpr)
    {
        if (isLeftRead)
        {
            sub2.push(token);
            continue;
        }

        if (token.type === 'punc' && token.value === ',')
        {
            isLeftRead = true;
            continue;
        }

        sub1.push(token);
    }

    return {
        sub1 : parseParenthesizedExpression(sub1),
        sub2 : parseParenthesizedExpression(sub2),
    }
}
