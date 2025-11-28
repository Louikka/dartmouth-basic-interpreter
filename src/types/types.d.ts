type AST = {
    type: 'PROGRAM';
    value: Array<ProgramLine>;
};

type ProgramLine = {
    line_number: number;
    statement: BASICStatement;
    value: Array<Token>;
};


type Token = {
    type: 'punc' | 'num' | 'str' | 'keyw' | 'var' | 'oper';
    value: any;
};
