export function throwError(message: string, ...optionalParams: any[]): never
{
    console.error(message, ...optionalParams);
    process.exit(0);
}



export function isNumeric(v: any): boolean
{
    if (typeof v === 'number') return true;
    if (typeof v !== 'string') return false;
    return !isNaN(+v) && !isNaN(parseFloat(v));
}



export function convertNumTokenToNode(token: NumToken): NumNode
{
    return {
        type : 'NUMBER',
        value : token.value,
    };
}

export function convertStrTokenToNode(token: StrToken): StrNode
{
    return {
        type : 'STRING',
        value : token.value,
    };
}



export function stringifyJSON(input: any, indentation = 2): string
{
    return JSON.stringify(input, null, indentation);
}

export function stringifyTokens(input: Token[]): string
{
    let __return = '';

    for (const token of input)
    {
        const token_s = token.value.toString();
        __return += token_s + ' ';
    }

    return __return.trim();
}


export function convertLogicalOperator(token: Token): Token
{
    switch (token.value)
    {
        case 'EQU': return { type : 'rel', value : '=', };
        case 'LSS': return { type : 'rel', value : '<', };
        case 'GRT': return { type : 'rel', value : '>', };
        case 'LQU': return { type : 'rel', value : '<=', };
        case 'GQU': return { type : 'rel', value : '>=', };
        case 'NQU': return { type : 'rel', value : '<>', };

        default: return token;
    }
}

export function getPrecedence(o: string): number
{
    switch (o)
    {
        case '+':
        case '-':
        {
            return 1;
        }
        case '*':
        case '/':
        {
            return 2;
        }
        case '^':
        {
            return 3;
        }

        default:
        {
            return -1;
        }
    }
}

export function testTokenValue(token: Token | null, expectedValue: string, errMessage?: string)
{
    if (token === null || token.value !== expectedValue)
    {
        throwError(`Parser error : ${errMessage ?? `Expected to see "${expectedValue}".`}.`);
    }
}

/**
 * Keeps only the last of duplicated object.
 * @param key the key of the object filtering based on.
 */
export function removeDuplicatesFromArrayOfObjects<T, K extends keyof T>(arr: Array<T>, key: K): Array<T>
{
    const reversedArr = [ ...arr ].reverse();

    const uniqueReversed = reversedArr.filter((val, i, self) =>
    {
        return i === self.findIndex((__val) => __val[key] === val[key]);
    });

    return uniqueReversed.reverse();
}

export function padStringToModulo(s: string, from: 'start' | 'end', mod: number): string
{
    if (from === 'start')
    {
        return ' '.repeat(mod - s.length % mod) + s;
    }
    else
    {
        return s + ' '.repeat(mod - s.length % mod);
    }
}

// Input  : [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
// Output : [ [1, 2, 3], [4, 5, 6], [7, 8, 9], [10] ]
export function sliceArrayIntoChunks<T>(arr: Array<T>, chunkSize: number): Array<T[]>
{
    let res = [];

    for (let i = 0; i < arr.length; i += chunkSize)
    {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }

    return res;
}
