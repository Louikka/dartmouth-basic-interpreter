import {
    BASICConditionOperators,
    BASICFunctions,
    BASICOperators,
    BASICStatements,
// @ts-ignore
} from './helpers/BASICLexemes.ts';
// @ts-ignore
import { BASICErrors } from './helpers/BASICErrors.ts';


interface ParserParseOptions {
    /** Rethrows parser error, if any occures. */
    rethrow: boolean;
}

const DEFAULT_PARSER_PARSE_OPTIONS: ParserParseOptions = {
    rethrow : false,
}

export function Parse(tokenList: Token[], options?: ParserParseOptions): [ ASTRoot, ErrorMessage ]
{
    if (options === undefined)
    {
        options = structuredClone(DEFAULT_PARSER_PARSE_OPTIONS);
    }
    else
    {
        for (const [key, value] of Object.entries(options))
        {
            if (value === undefined)
            {
                options[key as keyof ParserParseOptions] = DEFAULT_PARSER_PARSE_OPTIONS[key as keyof ParserParseOptions];
            }
        }
    }


    const tokenStream = new __TokenStream(tokenList);
    let astRoot: ASTRoot = {
        type : 'ROOT',
        value : [],
    };

    try
    {
        while (!tokenStream.isEndOfStream())
        {
            astRoot.value.push( parseStatementLine(tokenStream) );
            tokenStream.next();
        }
    }
    catch (err)
    {
        if (err instanceof Error)
        {
            if (options.rethrow) throw err;
            return [astRoot, err.message];
        }
        else
        {
            throw err;
        }
    }

    return [astRoot, null];
}



/* Helpers *******************************************************************/

class __TokenStream
{
    constructor(arr: Array<Token>)
    {
        this.input = arr;
    }


    private input: Array<Token>;

    public get streamLength(): number
    {
        return this.input.length;
    }

    private pos = 0;

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
        const token = this.peek();
        if (token.type === 'spec' && token.value === 'LINEBREAK')
        {
            this.readLine = [];
        }
        else
        {
            this.readLine.push(token);
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



function parenthesizeExpression(input: Token[]): Token[]
{
    // https://en.wikipedia.org/wiki/Operator-precedence_parser#Full_parenthesization
    //

    const tokenParenOpen: PuncToken = {
        type : 'punc',
        value : '(',
    };
    const tokenParenClose: PuncToken = {
        type : 'punc',
        value : ')',
    };
    const tokenPlus: OperToken = {
        type : 'oper',
        value : '+',
    };
    const tokenMinus: OperToken = {
        type : 'oper',
        value : '-',
    };


    let __return: Token[] = [];

    __return.push( ...new Array(4).fill(tokenParenOpen) );

    for (let i = 0; i !== input.length; i++)
    {
        const token = input[i];

        switch (token.value)
        {
            case '(':
            {
                __return.push( ...new Array(4).fill(tokenParenOpen) );
                continue;
            }
            case ')':
            {
                __return.push( ...new Array(4).fill(tokenParenClose) );
                continue;
            }
            case ',':
            {
                __return.push(
                    ...new Array(3).fill(tokenParenClose),
                    { type : 'punc', value : ',', },
                    ...new Array(3).fill(tokenParenOpen),
                );
                continue;
            }
            case '^':
            {
                __return.push(
                    tokenParenClose,
                    { type : 'oper', value : '^', },
                    tokenParenOpen
                );
                continue;
            }
            case '*':
            {
                __return.push(
                    ...new Array(2).fill(tokenParenClose),
                    { type : 'oper', value : '*', },
                    ...new Array(2).fill(tokenParenOpen)
                );
                continue;
            }
            case '/':
            {
                __return.push(
                    ...new Array(2).fill(tokenParenClose),
                    { type : 'oper', value : '/', },
                    ...new Array(2).fill(tokenParenOpen)
                );
                continue;
            }
            case '+':
            {
                const prevToken = input[i - 1];

                // unary check: either first or had an operator expecting secondary argument
                if (i === 0 || (prevToken.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevToken.value)))
                {
                    __return.push(tokenPlus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(tokenParenClose),
                        tokenPlus,
                        ...new Array(3).fill(tokenParenOpen)
                    );
                }

                continue;
            }
            case '-':
            {
                const prevToken = input[i - 1];

                if (i === 0 || (prevToken.type === 'punc' && [ ...BASICOperators, '(' ].includes(prevToken.value)))
                {
                    __return.push(tokenMinus);
                }
                else
                {
                    __return.push(
                        ...new Array(3).fill(tokenParenClose),
                        tokenMinus,
                        ...new Array(3).fill(tokenParenOpen)
                    );
                }

                continue;
            }
        }

        __return.push(token);
    }

    __return.push( ...new Array(4).fill(tokenParenClose) );

    return __return;
}

/** Reads the first parentheses encountered. */
function readParentheses(expr: Token[]): Token[]
{
    let depth = 0;
    let __return: Token[] = [];

    for (const token of expr)
    {
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

    return __return;
}

/**
 * Reads parentheses from the stream; current token should be opening parenthesis.
 * Parentheses from output are omitted.
 */
function readParenthesesFromStream(stream: __TokenStream): Token[]
{
    const __currToken = stream.peek();
    if (__currToken === undefined || __currToken === null || __currToken.value !== '(')
    {
        throw new Error(BASICErrors.ILL_FORMULA);
    }

    let depth = 1;
    let __return: Token[] = [];

    while (!__isLineBreakOrEOF(stream.peek()))
    {
        const token = stream.next();
        if (token === undefined || token === null)
        {
            throw new Error(BASICErrors.ILL_FORMULA);
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

    stream.next();

    return __return;
}

function parseParenthesizedExpression(pExpr: Token[]): ExpressionNode
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

        let read = readParentheses(pExpr);
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
                let __readSubscript = readParentheses(pExpr);
                let __subscript = parseCommaSeparatedValues(__readSubscript);

                if (__subscript.length > 1)
                {
                    return {
                        type : 'TABLEVAR',
                        name : pExpr[0].value,
                        subscript1 : parseParenthesizedExpression(readParentheses(__subscript[0])),
                        subscript2 : parseParenthesizedExpression(readParentheses(__subscript[1])),
                    };
                }
                else
                {
                    return {
                        type : 'LISTVAR',
                        name : pExpr[0].value,
                        subscript : parseParenthesizedExpression(readParentheses(__subscript[0])),
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
                throw new Error(BASICErrors.ILL_FORMULA);
            }

            return {
                type : 'FUNCCALL',
                name : pExpr[0].value,
                argument : parseParenthesizedExpression(readParentheses(pExpr)),
            };
        }
        else if (pExpr[0].type === 'keyw' && pExpr[0].value === 'FN')
        {
            if (pExpr[1] !== undefined && pExpr[1].type === 'var')
            {
                return {
                    type : 'UFUNCCALL',
                    name : pExpr[0].value + pExpr[1].value,
                    argument : parseParenthesizedExpression(readParentheses(pExpr)),
                };
            }
            else
            {
                throw new Error(BASICErrors.ILL_FORMULA);
            }
        }
        else
        {
            throw new Error(BASICErrors.ILL_FORMULA);
        }
    }
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



function readToken(stream: __TokenStream): Token
{
    const token = stream.peek();
    if (token === undefined || token === null)
    {
        throw new Error(BASICErrors.ILL_FORMULA);
    }

    stream.next();

    return token;
}

type __PredicateFunction = (token: Token, readList: Token[]) => boolean;

function readWhile(stream: __TokenStream, predicate: __PredicateFunction): Token[]
{
    let tl: Token[] = [];

    while (!stream.isEndOfStream() && predicate(stream.peek(), tl))
    {
        tl.push( readToken(stream) );
    }

    return tl;
}

function readUntilComma(stream: __TokenStream): Token[]
{
    return readWhile(stream, (t, tl) => !__isLineBreakOrEOF(t) && t.value !== ',');
}


function parseNumber(stream: __TokenStream): NumberNode
{
    const token = readToken(stream);

    if (token.type === 'oper' && (token.value === '+' || token.value === '-'))
    {
        const tokenNext = readToken(stream);
        if (tokenNext.type !== 'num')
        {
            throw new Error(BASICErrors.ILL_FORMULA);
        }

        return {
            type : 'NUMBER',
            value : 0 - tokenNext.value,
        };
    }

    if (token.type !== 'num')
    {
        throw new Error(BASICErrors.ILL_FORMULA);
    }

    return {
        type : 'NUMBER',
        value : token.value,
    };
}

function parseString(stream: __TokenStream): StringNode
{
    const token = readToken(stream);
    if (token.type !== 'str')
    {
        throw new Error(BASICErrors.ILL_FORMULA);
    }

    return {
        type : 'STRING',
        value : token.value,
    };
}

function parseVariable(stream: __TokenStream): VariableNode
{
    const token = readToken(stream);
    if (token.type !== 'var')
    {
        throw new Error(BASICErrors.ILL_FORMULA);
    }

    const nextToken = stream.peek();

    if (nextToken !== undefined && nextToken.value === '(')
    {
        let __readSubscript = readParenthesesFromStream(stream);
        let __subscript = parseCommaSeparatedValues(__readSubscript);

        if (__subscript.length > 1)
        {
            return {
                type : 'TABLEVAR',
                name : token.value,
                subscript1 : parseExpression(__subscript[0]),
                subscript2 : parseExpression(__subscript[1]),
            };
        }
        else
        {
            return {
                type : 'LISTVAR',
                name : token.value,
                subscript : parseExpression(__subscript[0]),
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

function parseExpression(input: Token[]): ExpressionNode
{
    let pExpr = parenthesizeExpression(input);
    return parseParenthesizedExpression(pExpr);
}

function parseStatementLine(stream: __TokenStream): BASICStatement
{
    const lineNumber = parseNumber(stream);

    const statement = readToken(stream);
    if (statement.type !== 'keyw')
    {
        throw new Error(BASICErrors.ILL_FORMULA);
    }
    if (!BASICStatements.includes(statement.value))
    {
        throw new Error(BASICErrors.ILL_INSTRUCTION);
    }


    switch (statement.value)
    {
        // `break;` on the end of the case is for safety reasons.
        // (Also, in VSCode it makes case fold nicely)
        // Do not remove.

        case 'LET':
        {
            const variable = parseVariable(stream);

            const __relation = readToken(stream);
            if (__relation.type !== 'rel' || __relation.value !== '=')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            const expression = readWhile(stream, (t, tl) => !__isLineBreakOrEOF(t));

            return {
                line_number : lineNumber.value,
                statement : statement.value,
                value : {
                    variable : variable,
                    expression : parseExpression(expression),
                },
            };
        }break;
        case 'READ':
        {
            let vars = [];

            while (!__isLineBreakOrEOF(stream.peek()))
            {
                vars.push( parseVariable(stream) );

                let maybeComma = stream.peek();

                if (maybeComma !== undefined && maybeComma.value === ',')
                {
                    stream.next();
                    continue;
                }
                else
                {
                    if (__isLineBreakOrEOF(stream.peek()))
                    {
                        break;
                    }
                    else
                    {
                        throw new Error(BASICErrors.INCORR_FORMAT);
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

            while (!__isLineBreakOrEOF(stream.peek()))
            {
                data.push( parseNumber(stream) );

                let maybeComma = stream.peek();

                if (maybeComma !== null && maybeComma.value === ',')
                {
                    stream.next();
                    continue;
                }
                else
                {
                    if (__isLineBreakOrEOF(stream.peek()))
                    {
                        break;
                    }
                    else
                    {
                        throw new Error(BASICErrors.INCORR_FORMAT);
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
            let data: Array<StringNode | [ StringNode, ExpressionNode ] | ExpressionNode> = [];
            let isLastIsComma = false;

            while (!__isLineBreakOrEOF(stream.peek()))
            {
                const token = stream.peek();
                if (token === undefined || token === null)
                {
                    throw new Error(BASICErrors.INCORR_FORMAT);
                }

                if (token.type === 'str')
                {
                    const string = parseString(stream);

                    const nextToken = stream.peek();
                    if (!__isLineBreakOrEOF(nextToken) && nextToken !== null && nextToken.value !== ',')
                    {
                        const expression = readUntilComma(stream);

                        data.push([ string, parseExpression(expression) ]);
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
                    stream.next();
                    isLastIsComma = true;
                    continue;
                }
                else
                {
                    const expression = readUntilComma(stream);

                    data.push(parseExpression(expression));
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
            const GOTOLineNumber = parseNumber(stream);
            if (GOTOLineNumber.value < 0 || !Number.isInteger(GOTOLineNumber.value))
            {
                throw new Error(BASICErrors.ILL_LINE_NUM);
            }

            return {
                line_number : lineNumber.value,
                statement : statement.value,
                value : GOTOLineNumber,
            };
        }break;
        case 'IF':
        {
            const exprLeft = readWhile(stream, (t, tl) => t.type !== 'rel');

            const relation = readToken(stream);
            if (relation.type !== 'rel')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }
            if (!BASICConditionOperators.includes(relation.value))
            {
                throw new Error(BASICErrors.ILL_REL);
            }

            const exprRight = readWhile(stream, (t, tl) => t.type !== 'keyw');

            const __THENKeyw = readToken(stream);
            if (__THENKeyw.value !== 'THEN')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            const THENLineNumber = parseNumber(stream);
            if (THENLineNumber.value < 0 || !Number.isInteger(THENLineNumber.value))
            {
                throw new Error(BASICErrors.ILL_LINE_NUM);
            }

            return {
                line_number : lineNumber.value,
                statement : statement.value,
                value : {
                    expression_left : parseExpression(exprLeft),
                    relation : relation.value,
                    expression_right : parseExpression(exprRight),
                    then : THENLineNumber,
                },
            };
        }break;
        case 'FOR':
        {
            // unsubscripted variable
            const unsubVar = parseVariable(stream);
            if (unsubVar.type !== 'VARIABLE')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            // =
            const __relation = readToken(stream);
            if (__relation.type !== 'rel' || __relation.value !== '=')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            // expression
            const assignExpression = readWhile(stream, (t, tl) => t.type !== 'keyw');

            // TO
            const __TOKeyw = readToken(stream);
            if (__TOKeyw.value !== 'TO')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            // expression
            const TOExpression = readWhile(stream, (t, tl) => t.type !== 'keyw');

            // (optional)

            // STEP
            const __STEPKeyw = stream.peek();

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
                    throw new Error(BASICErrors.INCORR_FORMAT);
                }

                stream.next();
                STEPExpr = readWhile(stream, (t, tl) => !__isLineBreakOrEOF(t));
            }


            return {
                line_number : lineNumber.value,
                statement : statement.value,
                value : {
                    variable : unsubVar,
                    expression : parseExpression(assignExpression),
                    to : parseExpression(TOExpression),
                    step : parseExpression(STEPExpr),
                },
            };
        }break;
        case 'NEXT':
        {
            const unsubVar = parseVariable(stream);
            if (unsubVar.type !== 'VARIABLE')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
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
            const __FNKeyw = readToken(stream);
            if (__FNKeyw.value !== 'FN')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            // letter
            const letter = readToken(stream);
            if (letter.type !== 'var')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            // unsubscripted variable
            const unsubVar = readParenthesesFromStream(stream);
            if (unsubVar.length > 1 || unsubVar[0].type !== 'var')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            // =
            const __relation = readToken(stream);
            if (__relation.type !== 'rel' || __relation.value !== '=')
            {
                throw new Error(BASICErrors.INCORR_FORMAT);
            }

            // expression
            const expression = readWhile(stream, (t, tl) => !__isLineBreakOrEOF(t));

            return {
                line_number : lineNumber.value,
                statement : statement.value,
                value : {
                    name : __FNKeyw.value + letter.value,
                    variable : {
                        type : 'VARIABLE',
                        name : unsubVar[0].value,
                    },
                    expression : parseExpression(expression),
                },
            };
        }break;
        case 'GOSUB':
        {
            const GOSUBLineNumber = parseNumber(stream);
            if (GOSUBLineNumber.value < 0 || !Number.isInteger(GOSUBLineNumber.value))
            {
                throw new Error(BASICErrors.ILL_LINE_NUM);
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

            while (!__isLineBreakOrEOF(stream.peek()))
            {
                const letter = readToken(stream);
                if (letter.type !== 'var')
                {
                    throw new Error(BASICErrors.INCORR_FORMAT);
                }

                const __paren = readParenthesesFromStream(stream);
                if (__paren.length > 1)
                {
                    const int1 = __paren[0];
                    if (int1.type !== 'num' || !Number.isInteger(int1.value))
                    {
                        throw new Error(BASICErrors.ILL_CONST);
                    }

                    const __comma = __paren[1];
                    if (__comma === undefined || __comma.value !== ',')
                    {
                        throw new Error(BASICErrors.INCORR_FORMAT);
                    }

                    const int2 = __paren[2];
                    if (int2 === undefined || int2.type !== 'num' || !Number.isInteger(int2.value))
                    {
                        throw new Error(BASICErrors.ILL_CONST);
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
                        throw new Error(BASICErrors.ILL_CONST);
                    }

                    dims.push({
                        type : 'list',
                        name : letter.value,
                        dim : integer.value,
                    });
                }
                else
                {
                    throw new Error(BASICErrors.INCORR_FORMAT);
                }


                let maybeComma = stream.peek();

                if (maybeComma !== null && maybeComma.value === ',')
                {
                    stream.next();
                    continue;
                }
                else
                {
                    if (__isLineBreakOrEOF(stream.peek()))
                    {
                        break;
                    }
                    else
                    {
                        throw new Error(BASICErrors.INCORR_FORMAT);
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
            throw new Error(BASICErrors.ILL_FORMULA);
        }
    }
}
