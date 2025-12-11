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
export const puncTokens = {
    parenOpen : {
        type : 'punc',
        value : '(',
    } as PuncToken,
    parenClose : {
        type : 'punc',
        value : ')',
    } as PuncToken,
    plus : {
        type : 'punc',
        value : '+',
    } as PuncToken,
    minus : {
        type : 'punc',
        value : '-',
    } as PuncToken,
    star : {
        type : 'punc',
        value : '*',
    } as PuncToken,
    slash : {
        type : 'punc',
        value : '/',
    } as PuncToken,
    caret : {
        type : 'punc',
        value : '^',
    } as PuncToken,
} as const;
