type __BASICOperator = '+' | '-' | '*' | '/' | '^';

type __BASICConditionOperator = '<' | '>' | '=' | '<=' | '>=' | '<>';



type __FuncDef = {
    /** `FN` + single letter. */
    name: string;
    variable: UnsubVarNode;
    expression: ExprNode;
};

type __Dimension = __ListDim | __TableDim;
type __ListDim = {
    type: 'list';
    name: string;
    dim: number;
};
type __TableDim = {
    type: 'table';
    name: string;
    dim1: number;
    dim2: number;
};
