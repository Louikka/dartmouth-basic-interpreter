export abstract class Token
{
    public abstract readonly value: any;

    public abstract readonly lexeme: string;
    public abstract readonly pos: number;

    public toString(): string
    {
        return String(this.value);
    }
}


export class TokenInvalid extends Token
{
    constructor()
    {
        super();
    }

    public readonly value = null;
    public readonly lexeme = '';
    public readonly pos = 0;
}

export class TokenNumber extends Token
{
    constructor(public readonly value: number,
                public readonly lexeme: string,
                public readonly pos: number)
    {
        super();
    }
}

export class TokenString extends Token
{
    constructor(public readonly value: string,
                public readonly lexeme: string,
                public readonly pos: number)
    {
        super();
    }
}

export type WordType = 'VARIABLE' | 'FUNCTION' | 'KEYWORD';

export class TokenWord extends Token
{
    constructor(public readonly value: string,
                public readonly type: WordType,
                public readonly lexeme: string,
                public readonly pos: number)
    {
        super();
    }
}

export class TokenOperator extends Token
{
    constructor(public readonly value: string,
                public readonly lexeme: string,
                public readonly pos: number)
    {
        super();
    }
}

export class TokenPunctuation extends Token
{
    constructor(public readonly value: string,
                public readonly lexeme: string,
                public readonly pos: number)
    {
        super();
    }
}
