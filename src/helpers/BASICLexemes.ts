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

export const BASICKeywords = [ ...BASICStatements, 'THEN', 'TO', 'STEP', 'FN', ];

// manual 2.2 and 3.3
export const BASICFunctions = [ 'SIN', 'COS', 'TAN', 'ATN', 'EXP', 'ABS', 'LOG', 'SQR', 'INT', 'RND', ];

export const BASICOperators = [ '+', '-', '*', '/', '^', ];

export const BASICRelationOperators = [ '<', '>', '=', '<=', '>=', '<>', ];
export const BASICConditionOperators = [ '<', '>', '=', '<=', '>=', '<>', ];
