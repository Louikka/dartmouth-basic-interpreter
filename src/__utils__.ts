export const BASICStatements = [
    'LET',
    'READ',
    'DATA',
    'PRINT',
    'GOTO',
    'IF',
    'FOR',
    'NEXT',
    'END',
    'STOP',
    'DEF',
    'GOSUB',
    'RETURN',
    'DIM',
    'REM',
];

export const KEYWORDS = [
    'LET',
    'READ',
    'DATA',
    'PRINT',
    'GOTO',
    'IF', 'THEN',
    'FOR', 'TO', 'STEP',
    'NEXT',
    'END',
    'STOP',
    'DEF', 'FN',
    'GOSUB',
    'RETURN',
    'DIM',
    'REM',

    'EQU',
    'LSS',
    'GRT',
    'LQU',
    'GQU',
    'NQU',
];

export const BASICOperators: Array<BASICOperator> = [ '+', '-', '*', '/', '^', ];



export function isStatement(s: string)
{
    return BASICStatements.includes(s);
}


export function isKeywordStart(char: string): boolean
{
    return /[A-Z]/i.test(char);
}

export function isKeyword(s: string): boolean
{
    return KEYWORDS.includes(s);
}

export function isDigit(char: string): boolean
{
    return /\d/.test(char);
}

export function isVarStart(char: string): boolean
{
    return /[A-Z]/i.test(char);
}

/**
 * `isVar(...)` will read characters as long as they are allowed as part of a variable.
 */
export function isVar(char: string): boolean
{
    return /[0-9]/i.test(char);
}

export function isOperatorChar(char: string): boolean
{
    return [ '+', '-', '*', '/', '^', '=', '<', '>', /*'<=', '>=', '<>',*/ ].includes(char);
}

export function isPunctuation(char: string): boolean
{
    return [ ',', '(', ')', ].includes(char);
}

export function isWhitespace(char: string): boolean
{
    return ' \t\r'.includes(char);
}


export function isNumeric(str: string): boolean
{
    if (typeof str === 'number') return true;
    if (typeof str !== 'string') return false;
    return !isNaN(+str) && !isNaN(parseFloat(str));
}


export function convertLogicalOperator(token: Token): Token
{
    switch (token.value)
    {
        case 'EQU':
        {
            return {
                type : 'oper',
                value : '=',
            };
        }
        case 'LSS':
        {
            return {
                type : 'oper',
                value : '<',
            };
        }
        case 'GRT':
        {
            return {
                type : 'oper',
                value : '>',
            };
        }
        case 'LQU':
        {
            return {
                type : 'oper',
                value : '<=',
            };
        }
        case 'GQU':
        {
            return {
                type : 'oper',
                value : '>=',
            };
        }
        case 'NQU':
        {
            return {
                type : 'oper',
                value : '<>',
            };
        }

        default:
        {
            return token;
        }
    }
}

export function getPrecedence(o: BASICOperator): number
{
    switch (o)
    {
        case '+':
        case '-':
        {
            return 1;
        }
        case '*':
        case '/':
        {
            return 2;
        }
        case '^':
        {
            return 3;
        }

        default:
        {
            return -1;
        }
    }
}



export function convertInfixToRPN(stack: (NumToken | PuncToken)[]): Array<NumToken | PuncToken>
{
    let returnStack: (NumToken | PuncToken)[] = [];
    let memoryStack: (NumToken | PuncToken)[] = [];

    for (const T of stack)
    {
        if (T.type === 'num')
        {
            returnStack.push(T);
        }
        else if (T.value === '(')
        {
            memoryStack.push(T);
        }
        else if (T.value === ')')
        {
            while (memoryStack[memoryStack.length - 1].value !== '(')
            {
                returnStack.push(memoryStack.pop()!);
            }
            memoryStack.pop();
        }
        // @ts-ignore
        else if (BASICOperators.includes(T.value))
        {
            // @ts-ignore
            while (getPrecedence(memoryStack[memoryStack.length - 1]) >= getPrecedence(T.value))
            {
                returnStack.push(memoryStack.pop()!);
            }
            memoryStack.push(T);
        }
    }

    returnStack.push( ...memoryStack.reverse() );

    return returnStack;
}

export function calculateRPN(stack: (NumToken | PuncToken)[]): NumToken | null
{
    if (stack.length < 3)
    {
        console.error(`Not enough tokens in stack.`);
        return null;
    }
    if (stack[0].type !== 'num' || stack[1].type !== 'num')
    {
        console.error(`First or second token in not of number type.`);
        return null;
    }

    let returnStack: NumToken[] = [];

    for (const T of stack)
    {
        if (T.type === 'num')
        {
            returnStack.push(T);
        }
        else
        {
            let n1 = returnStack.shift()!.value;
            let n2 = returnStack.shift()!.value;

            switch (T.value)
            {
                case '+':
                {
                    returnStack.push({
                        type : 'num',
                        value : n1 + n2,
                    });
                }
                case '-':
                {
                    returnStack.push({
                        type : 'num',
                        value : n1 - n2,
                    });
                }
                case '*':
                {
                    returnStack.push({
                        type : 'num',
                        value : n1 * n2,
                    });
                }
                case '/':
                {
                    returnStack.push({
                        type : 'num',
                        value : n1 / n2,
                    });
                }
                case '^':
                {
                    returnStack.push({
                        type : 'num',
                        value : n1 ** n2,
                    });
                }

                default:
                {
                    console.error(`Unexpected token "${ T.value }".`);
                    return null;
                }
            }
        }
    }

    return returnStack[0];
}
