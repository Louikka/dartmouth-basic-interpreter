type Node = NumberNode | StringNode | VariableNode | ExpressionNode;

type NumberNode = {
    type: 'NUMBER';
    value: number;
};
type StringNode = {
    type: 'STRING';
    value: string;
};
type VariableNode = UnsubVarNode | ListVarNode | TableVarNode;
type UnsubVarNode = {
    type: 'VARIABLE';
    name: string;
};
type ListNode = {
    type: 'LISTVAR';
    name: string;
    subscript: ExpressionNode;
};
type TableNode = {
    type: 'TABLEVAR';
    name: string;
    subscript1: ExpressionNode;
    subscript2: ExpressionNode;
};
type FunctionNode = DefFuncNode | UserFuncNode;
type DefFuncNode = {
    type: 'FUNCCALL';
    name: string;
    argument: ExpressionNode; // all BASIC function can have only one parameter
};
type UserFuncNode = {
    type: 'UFUNCCALL';
    /** Single letter. */
    name: string;
    argument: ExpressionNode;
};
type BinaryNode = {
    type: 'BINARY';
    operator: string;
    left: ExpressionNode;
    right: ExpressionNode;
};
type ExpressionNode = NumberNode | VariableNode | BinaryNode | FunctionNode;
