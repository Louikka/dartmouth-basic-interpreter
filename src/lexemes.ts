/** List of statements which can appear as an instruction after the line number. */
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

export const BASICKeywords = [ ...BASICStatements, 'THEN', 'TO', 'STEP', 'FN' ];

export function isKeyword(s: string): boolean
{
    return BASICKeywords.includes(s);
}


// manual 2.2 and 3.3
export const BASICFunctions = [ 'SIN', 'COS', 'TAN', 'ATN', 'EXP', 'ABS', 'LOG', 'SQR', 'INT', 'RND' ];

export function isFunction(s: string): boolean
{
    return BASICFunctions.includes(s);
}


export const BASICOperators = [ '+', '-', '*', '/', '^' ];

export function isOperator(s: string): boolean
{
    return BASICOperators.includes(s);
}


export const BASICRelationOperators = [ '<', '>', '=', '<=', '>=', '<>' ];

export function isRelation(s: string): boolean
{
    return BASICRelationOperators.includes(s);
}


export const BASICPunctuation = [ '(', ')', ',', ';' ];

export function isPunctuation(s: string): boolean
{
    return BASICPunctuation.includes(s);
}
