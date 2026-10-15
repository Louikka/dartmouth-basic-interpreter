export type Token = TokenNumber | TokenString | TokenVariable;

export interface TokenNumber {
    type: 'NUMBER';
    value: number;
}

export interface TokenString {
    type: 'STRING';
    value: string;
}

export interface TokenVariable {
    type: 'VARIABLE';
    /** Name of the variable. */
    value: string;
}
