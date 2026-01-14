type Token =
    | PuncToken
    | NumToken
    | StrToken
    | KeywToken
    | VarToken
    | FuncToken
    | OperToken
    | RelToken
    | SpecToken
;

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
type VarToken = {
    type: 'var';
    value: string;
};
type KeywToken = {
    type: 'keyw';
    value: string;
};
type FuncToken = {
    type: 'func';
    value: string;
};
type OperToken = {
    type: 'oper';
    value: string;
};
type RelToken = {
    type: 'rel';
    value: string;
};
type SpecToken = {
    type: 'spec';
    value: 'LINEBREAK' | 'ENDOFSTREAM';
};
