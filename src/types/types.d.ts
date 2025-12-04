type AST = {
    type: 'PROGRAM';
    value: Array<ProgramLine>;
};

type ProgramLine = {
    line_number: number;
    statement: BASICStatement;
    value: Array<Token>;
};


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
