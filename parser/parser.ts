class ParserError extends Error
{
    constructor(message?: string)
    {
        super(message);
        this.name = this.constructor.name;
    }
}



class Parser
{
    constructor(tl: Token[])
    {
        this.tl = tl;
    }


    private tl: Array<Token>;
    private pos = 0;


    private peek(step = 0): Token
    {
        const newPos = this.pos + step;
        const t = this.tl[newPos];
        if (t === undefined)
        {
            throw new ParserError(`Trying to access index out of bounds (${newPos} of range 0-${this.tl.length - 1}).`);
        }

        return t;
    }

    private next(): Token
    {
        this.pos++;
        return this.peek();
    }

    private isEOF(): boolean
    {
        return this.pos >= this.tl.length;
    }
}



interface ParseOptions {
    //
}

export function parse(tokenList: Token[], options?: ParseOptions)
{
    //
}