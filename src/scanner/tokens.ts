export abstract class Token
{
    public abstract readonly value: any;

    public abstract readonly pos: number;
    public abstract readonly literal: string;


    public toString(): string
    {
        return String(this.value);
    }
}


export class TokenInvalid extends Token
{
    constructor(pos?: number, literal?: string)
    {
        super();

        this.pos = pos ?? 0;
        this.literal = literal ?? '';
    }

    public readonly value = null;
    public readonly literal;
    public readonly pos;
}

export class TokenNumber extends Token
{
    constructor(value: number, pos: number, literal: string)
    {
        super();

        this.value = value;
        this.pos = pos;
        this.literal = literal;
    }

    public readonly value: number;
    public readonly literal;
    public readonly pos;
}

export class TokenString extends Token
{
    constructor(value: string, pos: number, literal: string)
    {
        super();

        this.value = `"${value}"`;
        this.pos = pos;
        this.literal = literal;
    }

    public readonly value: string;
    public readonly literal;
    public readonly pos;
}

export type WordType = 'VARIABLE' | 'FUNCTION' | 'KEYWORD';

export class TokenWord extends Token
{
    constructor(value: string, type: WordType, pos: number, literal: string)
    {
        super();

        this.value = value;
        this.type = type;
        this.pos = pos;
        this.literal = literal;
    }

    public readonly value: string;
    public readonly type: WordType;
    public readonly literal;
    public readonly pos;
}

export class TokenOperator extends Token
{
    constructor(value: string, pos: number, literal: string)
    {
        super();

        this.value = value;
        this.pos = pos;
        this.literal = literal;
    }

    public readonly value: string;
    public readonly literal;
    public readonly pos;
}

export class TokenPunctuation extends Token
{
    constructor(value: string, pos: number, literal: string)
    {
        super();

        this.value = value;
        this.pos = pos;
        this.literal = literal;
    }

    public readonly value: string;
    public readonly literal;
    public readonly pos;
}
