type Token = PuncToken | NumToken | StrToken | KeywToken | VarToken | OperToken | SpecToken;

type PuncToken = {
    type: 'punc';
    value: string;
};
type NumToken = {
    type: 'num';
    value: number;
};
type StrToken = {
    type: 'str';
    value: string;
};
type KeywToken = {
    type: 'keyw';
    value: string;
};
type VarToken = {
    type: 'var';
    value: string;
};
type OperToken = {
    type: 'oper';
    value: string;
};
type SpecToken = {
    type: 'spec';
    value: 'LINEBREAK' | 'ENDOFSTREAM';
};



type Node = NumNode | StrNode | VarNode | BinNode | AsgnNode;

type NumNode = {
    type: 'NUMBER';
    value: number;
};
type StrNode = {
    type: 'STRING';
    value: string;
};
type VarNode = {
    type: 'VARIABLE';
    name: string;
};
type BinNode = {
    type: 'BINARY';
    operator: BASICOperator;
    left: NumNode | VarNode | BinNode;
    right: NumNode | VarNode | BinNode;
};
type ExprNode = { // ???
    type: 'EXPRESSION';
    value: NumNode | VarNode | BinNode;
};
type AsgnNode = {
    type: 'ASSIGN';
    variable: VarNode;
    value: ExprNode;
};



type ASTStatement = LETStatement | READStatement | DATAStatement | PRINTStatement | GOTOStatement | IFTHENStatement | FORStatement | NEXTStatement | ENDStatement | STOPStatement | DEFStatement | GOSUBStatement | RETURNStatement | DIMStatement;

type LETStatement = {
    line_number: number;
    statement: 'LET';
    value: AsgnNode;
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
    value: Array<StrNode | VarNode>;
};
type GOTOStatement = {
    line_number: number;
    statement: 'GOTO';
    value: NumNode;
};
type IFTHENStatement = {
    line_number: number;
    statement: 'IF';
    value: {
        condition_left: ExprNode;
        condition: BASICCondition;
        condition_right: ExprNode;
        then: NumNode;
    };
};
type FORStatement = {
    line_number: number;
    statement: 'FOR';
    value: {
        variable: VarNode;
        expression: ExprNode;
        to: ExprNode;
        step: ExprNode;
    };
};
type NEXTStatement = {
    line_number: number;
    statement: 'NEXT';
    value: VarNode;
};
type ENDStatement = {
    line_number: number;
    statement: 'END';
};
type STOPStatement = {
    line_number: number;
    statement: 'STOP';
};
type DEFStatement = {                // TO-DO
    line_number: number;
    statement: 'DEF';
    value: {
        variable: VarNode;
        expression: ExprNode;
    };
};
type GOSUBStatement = {
    line_number: number;
    statement: 'GOSUB';
    value: NumNode;
};
type RETURNStatement = {
    line_number: number;
    statement: 'RETURN';
};
type DIMStatement = {                // TO-DO
    line_number: number;
    statement: 'DIM';
    value: VarNode;
};
type REMStatement = {
    line_number: number;
    statement: 'REM';
    value?: string;
};



type ASTRoot = {
    type: 'PROGRAM';
    value: Array<ASTStatement>;
};
