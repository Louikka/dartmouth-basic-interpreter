type ASTRoot = {
    type: 'ROOT';
    value: Array<BASICStatement>;
};



//type ASTStatement = LETStatement | READStatement | DATAStatement | PRINTStatement | GOTOStatement | IFTHENStatement | FORStatement | NEXTStatement | ENDStatement | STOPStatement | DEFStatement | GOSUBStatement | RETURNStatement | DIMStatement | REMStatement;

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
        variable: VariableNode;
        expression: ExpressionNode;
    };
};
type READStatement = {
    line_number: number;
    statement: 'READ';
    value: Array<VariableNode>;
};
type DATAStatement = {
    line_number: number;
    statement: 'DATA';
    value: Array<NumberNode>;
};
type PRINTStatement = {
    line_number: number;
    statement: 'PRINT';
    value: Array<StringNode | [ StringNode, ExpressionNode ] | ExpressionNode>;
};
type GOTOStatement = {
    line_number: number;
    statement: 'GOTO';
    /** Line number. */
    value: NumberNode;
};
type IFTHENStatement = {
    line_number: number;
    statement: 'IF';
    value: {
        expression_left: ExpressionNode;
        relation: string;
        expression_right: ExpressionNode;
        /** Line number. */
        then: NumberNode;
    };
};
type FORStatement = {
    line_number: number;
    statement: 'FOR';
    value: {
        variable: UnsubVarNode;
        expression: ExpressionNode;
        to: ExpressionNode;
        step: ExpressionNode;
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
    value: NumberNode;
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
