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


    /** Enables developer logging to console. */
    public enableDevLogging = false;

    private tokenStream: __Streamer<Token>;


    /**
     * @param predicate test function. Reads while returns `true`.
     */
    private readWhile(predicate: (token: Token, readList: Token[]) => boolean): Token[]
    {
        let tl: Token[] = [];

        while (!this.tokenStream.isEndOfStream() && predicate(this.tokenStream.peek()!, tl))
        {
            tl.push(this.tokenStream.peek()!);
            this.tokenStream.next();
        }

        return tl;
    }


    private readToken(errorMessage?: string): Token
    {
        const token = this.tokenStream.peek();
        if (token === null)
        {
            throwError(`Parser error : ${ errorMessage ?? 'Cannot read a token' }.`);
        }

        this.tokenStream.next();

        return token;
    }

    private readParentheses(): Token[]
    {
        const __currToken = this.tokenStream.peek();
        if (__currToken === null || __currToken.value !== '(')
        {
            throwError(`Parser error : Expected a parenthesis.`);
        }

        let depth = 1;
        let __return: Token[] = [];

        while (!__isLineBreakOrEOF(this.tokenStream.peek()))
        {
            const token = this.tokenStream.next();
            if (token === null)
            {
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

    private readExpressionUntilComma(currentToken: Token): Token[]
    {
        return this.readWhile((t, tl) => !__isLineBreakOrEOF(t) && t.value !== ',');
    }


    private parseNumber(lineNumber?: number): NumNode
    {
        const token = this.readToken();
        if (token.type !== 'num')
        {
            const ln = (lineNumber !== undefined) ? ` (${lineNumber})` : '';

            if (this.enableDevLogging)
            {
                console.log(`Parser.(private)parseNumber() : Expexted to see a number, but got '${token.type}'.`);
                console.log(JSON.stringify(token, null, 2) + '\n');
            }

            throwError(`Parser error :${ln} Expected a number.`);
        }

        return {
            type : 'NUMBER',
            value : token.value,
        };
    }

    private parseString(lineNumber?: number): StrNode
    {
        const token = this.readToken();
        if (token.type !== 'str')
        {
            const ln = (lineNumber !== undefined) ? ` (${lineNumber})` : '';

            if (this.enableDevLogging)
            {
                console.log(`Parser.(private)parseString() : Expexted to see a string, but got '${token.type}'.`);
                console.log(JSON.stringify(token, null, 2) + '\n');
            }

            throwError(`Parser error :${ln} Expected a string.`);
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
            throwError(`Parser error : Expected a variable name.`);
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
        if (statement.type !== 'keyw' || !BASICStatements.includes(statement.value))
        {
            throwError(`Parser error : (${lineNumber.value}) Expected a statement.`);
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
                    throwError(`Parser error : (${lineNumber.value}) Expected an assignment operator ("=").`);
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
                            throwError(`Parser error : (${lineNumber.value}) Expected a comma or a line break.`);
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
                            throwError(`Parser error : (${lineNumber.value}) Expected a comma or a line break.`);
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
                    if (token === null)
                    {
                        throwError(`Parser error : (${lineNumber.value}) Cannot parse label or expression.`);
                    }

                    if (token.type === 'str')
                    {
                        const string = this.parseString();

                        const nextToken = this.tokenStream.peek();
                        if (!__isLineBreakOrEOF(nextToken) && nextToken !== null && nextToken.value !== ',')
                        {
                            const expression = this.readExpressionUntilComma(nextToken);

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
                        const expression = this.readExpressionUntilComma(token);

                        data.push(this.parseExpression(expression));
                        isLastIsComma = false;
                        continue;
                    }
                }

                if (!isLastIsComma) data.push({ type : 'STRING', value : '\n', });

                return {
                    line_number : lineNumber.value,
                    statement : statement.value,
                    value : data,
                };
            }break;
            case 'GOTO':
            {
                const GOTOLineNumber = this.parseNumber();
                if (!Number.isInteger(GOTOLineNumber.value))
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected a line number.`);
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
                    throwError(`Parser error : (${lineNumber.value}) Expected a relation operator.`);
                }

                const exprRight = this.readWhile((t, tl) => t.type !== 'keyw');

                const __THENKeyw = this.readToken();
                if (__THENKeyw.value !== 'THEN')
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected a "THEN" keyword.`);
                }

                const THENLineNumber = this.parseNumber();
                if (!Number.isInteger(THENLineNumber.value))
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected a line number.`);
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
                    throwError(`Parser error : (${lineNumber.value}) Expected an unsubscripted variable.`);
                }

                // =
                const __relation = this.readToken();
                if (__relation.type !== 'rel' || __relation.value !== '=')
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected an assignment operator ("=").`);
                }

                // expression
                const assignExpression = this.readWhile((t, tl) => t.type !== 'keyw');

                // TO
                const __TOKeyw = this.readToken();
                if (__TOKeyw.value !== 'TO')
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected a "TO" keyword.`);
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
                    // `Omitting the STEP part is the same as assuming the step-size to be unity`
                    STEPExpr = [ { type : 'num', value : 1, } ];
                }
                else
                {
                    if (__STEPKeyw === null || __STEPKeyw.value !== 'STEP')
                    {
                        throwError(`Parser error : (${lineNumber.value}) Expected a "STEP" keyword.`);
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
                    throwError(`Parser error : (${lineNumber.value}) Expected an unsubscripted variable.`);
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
                    throwError(`Parser error : (${lineNumber.value}) Expected a "FN" keyword.`);
                }

                // letter
                const letter = this.readToken();
                if (letter.type !== 'var')
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected a function name.`);
                }

                // unsubscripted variable
                const unsubVar = this.readParentheses();
                if (unsubVar.length > 1 || unsubVar[0].type !== 'var')
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected an unsubscripted variable.`);
                }

                // =
                const __relToken = this.readToken();
                if (__relToken.type !== 'rel' || __relToken.value !== '=')
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected an assignment operator ("=").`);
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
                if (!Number.isInteger(GOSUBLineNumber.value))
                {
                    throwError(`Parser error : (${lineNumber.value}) Expected a line number.`);
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
                let dims = [];

                while (!__isLineBreakOrEOF(this.tokenStream.peek()))
                {
                    const letter = this.readToken();
                    if (letter.type !== 'var')
                    {
                        if (this.enableDevLogging) console.log(letter);
                        throwError(`Parser error : (${lineNumber.value}) Cannot parse a letter.`);
                    }

                    const __paren = this.readParentheses();
                    if (__paren.length > 1)
                    {
                        const int1 = __paren[0];
                        if (int1.type !== 'num' || !Number.isInteger(int1.value))
                        {
                            throwError(`Parser error : (${lineNumber.value}) Expected an integer.`);
                        }

                        const __comma = __paren[1];
                        if (__comma === undefined || __comma.value !== ',')
                        {
                            throwError(`Parser error : (${lineNumber.value}) Expected a comma.`);
                        }

                        const int2 = __paren[2];
                        if (int2 === undefined || int2.type !== 'num' || !Number.isInteger(int2.value))
                        {
                            throwError(`Parser error : (${lineNumber.value}) Expected an integer.`);
                        }

                        dims.push({
                            letter : letter.value,
                            int1 : int1.value,
                            int2 : int2.value,
                        });
                    }
                    else if (__paren.length === 1)
                    {
                        const integer = __paren[0];
                        if (integer.type !== 'num' || !Number.isInteger(integer.value))
                        {
                            throwError(`Parser error : (${lineNumber.value}) Expected an integer.`);
                        }

                        dims.push({
                            letter : letter.value,
                            integer : integer.value,
                        });
                    }
                    else
                    {
                        throwError(`Parser error : (${lineNumber.value}) Cannot read parentheses.`);
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
                            throwError(`Parser error : (${lineNumber.value}) Expected a comma or a line break.`);
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
                throwError(`Parser error : (${lineNumber.value}) Cannot parse statement "${statement.value}".`);
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
                throwError(`Parser error : Cannot parse function call : unexpected token : "${pExpr[1]}".`);
            }
        }
        else
        {
            throwError(`Parser error : Cannot parse expression : unexpected token : "${pExpr[0]}".`);
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
