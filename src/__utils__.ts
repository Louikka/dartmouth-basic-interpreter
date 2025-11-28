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
    return ' \t\n'.includes(char);
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
