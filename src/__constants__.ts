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

export type BASICStatement = typeof BASICStatements[any];



export const BASICKeywords = [
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



export const BASICOperators = [ '+', '-', '*', '/', '^', ];

export type BASICOperator = typeof BASICOperators[any];


export const BASICConditionOperators = [ '<', '>', '=', '<=', '>=', '<>', ];

export type BASICCondition = typeof BASICConditionOperators[any];



/** Do not use for direct comparison. */
export const binTokens = {
    parenOpen : {
        type : 'punc',
        value : '(',
    } as PuncToken,
    parenClose : {
        type : 'punc',
        value : ')',
    } as PuncToken,
    plus : {
        type : 'oper',
        value : '+',
    } as OperToken,
    minus : {
        type : 'oper',
        value : '-',
    } as OperToken,
    star : {
        type : 'oper',
        value : '*',
    } as OperToken,
    slash : {
        type : 'oper',
        value : '/',
    } as OperToken,
    caret : {
        type : 'oper',
        value : '^',
    } as OperToken,
} as const;
