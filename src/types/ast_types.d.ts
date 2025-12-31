type ASTRoot = {
    type: 'PROGRAM';
    value: Array<ASTStatement>;
};





//type ASTStatement = LETStatement | READStatement | DATAStatement | PRINTStatement | GOTOStatement | IFTHENStatement | FORStatement | NEXTStatement | ENDStatement | STOPStatement | DEFStatement | GOSUBStatement | RETURNStatement | DIMStatement | REMStatement;

type ASTStatement = LETStatement | READStatement | DATAStatement | PRINTStatement | GOTOStatement | IFTHENStatement | FORStatement | NEXTStatement | ENDStatement | STOPStatement | DEFStatement | GOSUBStatement | RETURNStatement | DIMStatement | REMStatement;

type BASICStatement =
    | LETStatement
    | READStatement
    | DATAStatement
    | PRINTStatement
    | GOTOStatement
    | IFTHENStatement
    | FORStatement
    | NEXTStatement
    | ENDStatement
    | STOPStatement
    | DEFStatement
    | GOSUBStatement
    | RETURNStatement
    | DIMStatement
    | REMStatement
;

type LETStatement = {
    line_number: number;
    statement: 'LET';
    value: {
        variable: VarNode;
        expression: ExprNode;
    };
};
type READStatement = {
    line_number: number;
    statement: 'READ';
    value: Array<VarNode>;
};
type DATAStatement = {
    line_number: number;
    statement: 'DATA';
    value: Array<NumNode>;
};
type PRINTStatement = {
    line_number: number;
    statement: 'PRINT';
    value: Array<StrNode | [ StrNode, ExprNode ] | ExprNode>;
};
type GOTOStatement = {
    line_number: number;
    statement: 'GOTO';
    /** Line number. */
    value: NumNode;
};
type IFTHENStatement = {
    line_number: number;
    statement: 'IF';
    value: {
        expression_left: ExprNode;
        relation: string;
        expression_right: ExprNode;
        /** Line number. */
        then: NumNode;
    };
};
type FORStatement = {
    line_number: number;
    statement: 'FOR';
    value: {
        variable: UnsubVarNode;
        expression: ExprNode;
        to: ExprNode;
        step: ExprNode;
    };
};
type NEXTStatement = {
    line_number: number;
    statement: 'NEXT';
    value: UnsubVarNode;
};
type ENDStatement = {
    line_number: number;
    statement: 'END';
};
type STOPStatement = {
    line_number: number;
    statement: 'STOP';
};
type DEFStatement = {
    line_number: number;
    statement: 'DEF';
    value: __FuncDef;
};
type GOSUBStatement = {
    line_number: number;
    statement: 'GOSUB';
    /** Line number. */
    value: NumNode;
};
type RETURNStatement = {
    line_number: number;
    statement: 'RETURN';
};
type DIMStatement = {
    line_number: number;
    statement: 'DIM';
    value: Array<__Dimension>;
};
type REMStatement = {
    line_number: number;
    statement: 'REM';
    value?: string;
};





type Node = StrNode | ExprNode | AsgnNode;

type NumNode = {
    type: 'NUMBER';
    value: number;
};
type StrNode = {
    type: 'STRING';
    value: string;
};
type VarNode = UnsubVarNode | ListNode | TableNode;
type UnsubVarNode = {
    type: 'VARIABLE';
    name: string;
};
type ListNode = {
    type: 'LISTVAR';
    name: string;
    subscript: ExprNode;
};
type TableNode = {
    type: 'TABLEVAR';
    name: string;
    subscripts: {
        sub1: ExprNode;
        sub2: ExprNode;
    };
};
type FuncNode = DefFuncNode | UserFuncNode;
type DefFuncNode = {
    type: 'FUNCCALL';
    name: string;
    argument: ExprNode; // all BASIC function can have only one parameter
};
type UserFuncNode = {
    type: 'UFUNCCALL';
    /** `FN` + single letter. */
    name: string;
    argument: ExprNode;
};
type BinNode = {
    type: 'BINARY';
    operator: string;
    left: ExprNode;
    right: ExprNode;
};
type ExprNode = NumNode | VarNode | BinNode | FuncNode;
