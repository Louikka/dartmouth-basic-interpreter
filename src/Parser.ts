import {
    __Streamer,
    BASICOperators,
    BASICStatements,
    binTokens,
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
    public isDevLogging = false;

    private tokenStream: __Streamer<Token>;


    /**
     * @param predicate test function. Reads while returns `true`.
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


    private readParentheses(): Token[]
    {
        const __currToken = this.tokenStream.peek();
        if (__currToken === null || __currToken.value !== '(')
        {
            if (this.isDevLogging) console.log(__currToken);
            throwError(`Parser error : Expected a parenthesis.`);
        }

        let depth = 1;
        let __return: Token[] = [];

        while (!__isLineBreakOrEOF(this.tokenStream.peek()))
        {
            const token = this.tokenStream.next();
            if (token === null)
            {
                if (this.isDevLogging) console.log(token);
                throwError(`Parser error : Cannot read a token.`);
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


    private parseNumber(): NumNode
    {
        const token = this.tokenStream.peek();
        if (token === null || token.type !== 'num')
        {
            if (this.isDevLogging) console.log(token);
            throwError(`Parser error : Expected a number.`);
        }

        this.tokenStream.next();

        return {
            type : 'NUMBER',
            value : token.value,
        };
    }

    private parseString(): StrNode
    {
        const token = this.tokenStream.peek();
        if (token === null || token.type !== 'str')
        {
            if (this.isDevLogging) console.log(token);
            throwError(`Parser error : Expected a string.`);
        }

        this.tokenStream.next();

        return {
            type : 'STRING',
            value : token.value,
        };
    }

    private parseVariable(): VarNode
    {
        const token = this.tokenStream.peek();
        if (token === null || token.type !== 'var')
        {
            if (this.isDevLogging) console.log(token);
            throwError(`Parser error : Expected a variable name.`);
        }

        const tokenNext = this.tokenStream.next();

        if (tokenNext !== null && tokenNext.value === '(')
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

    private parseAssign(): AsgnNode
    {
        const varToken = this.parseVariable();

        const operToken = this.tokenStream.peek()!;
        if (operToken === null || operToken.type !== 'oper' || operToken.value !== '=')
        {
            if (this.isDevLogging) console.log(operToken);
            throwError(`Parser error : Expected an assignment operator ("=").`);
        }

        const expression = this.readWhile((t, tl) => !__isLineBreakOrEOF(t));

        return {
            type : 'ASSIGN',
            variable : varToken,
            expression : this.parseExpression(expression),
        };
    }

    private parseStatement(): ASTStatement
    {
        const lineNumber = this.parseNumber();

        const statement = this.tokenStream.peek();
        if (statement === null || statement.type !== 'keyw' || !BASICStatements.includes(statement.value))
        {
            if (this.isDevLogging) console.log(statement);
            throwError(`Parser error : Expected a statement.`);
        }

        this.tokenStream.next();


        switch (statement.value)
        {
            case 'LET':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : this.parseAssign(),
                };
            }
            case 'READ':
            {
                let vars = [];

                while (!__isLineBreakOrEOF(this.tokenStream.peek()))
                {
                    vars.push(this.parseVariable());

                    let isComma = this.tokenStream.peek();

                    if (isComma !== null && isComma.value === ',')
                    {
                        this.tokenStream.next();
                        continue;
                    }
                    else
                    {
                        break;
                    }
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : vars,
                };
            }
            case 'DATA':
            {
                let data = [];

                while (!__isLineBreakOrEOF(this.tokenStream.peek()))
                {
                    data.push(this.parseNumber());

                    let isComma = this.tokenStream.peek();

                    if (isComma !== null && isComma.value === ',')
                    {
                        this.tokenStream.next();
                        continue;
                    }
                    else
                    {
                        break;
                    }
                }

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : data,
                };
            }
            case 'PRINT':
            {
                throw new Error(); // TO-DO
            }
            case 'GOTO':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : this.parseNumber(),
                };
            }
            case 'IF':
            {
                throw new Error(); // TO-DO
            }
            case 'FOR':
            {
                throw new Error(); // TO-DO
            }
            case 'NEXT':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : this.parseVariable(),
                };
            }
            case 'END':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                };
            }
            case 'STOP':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                };
            }
            case 'DEF':
            {
                throw new Error(); // TO-DO
            }
            case 'GOSUB':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : this.parseNumber(),
                };
            }
            case 'RETURN':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                };
            }
            case 'DIM':
            {
                throw new Error(); // TO-DO
            }
            case 'REM':
            {
                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
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
            if (pExpr[1].value === '(')
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
            return {
                type : 'FUNCCALL',
                name : pExpr[0].value,
                argument : parseParenthesizedExpression(readParenthesesFromList(pExpr)),
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
                argument : parseParenthesizedExpression(readParenthesesFromList(pExpr)),
            };
        }
        else
        {
            throwError(`Parser error : Cannot parse expression : unexpected token : "${pExpr[0].type}".`);
        }
    }
}

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

function __isLineBreakOrEOF(token: Token | null): boolean
{
    if (token === null) return true;

    return token.type === 'spec' && (token.value === 'LINEBREAK' || token.value === 'ENDOFSTREAM');
}
