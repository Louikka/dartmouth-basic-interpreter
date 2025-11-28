export function __RUN__(input: string)
{
    //
}


export function __PARSE__(input: string): AST
{
    let ASTNodesInput = input.split('\n');
    let ASTNodesOutput: AST = [];

    for (let i = 0; i < ASTNodesInput.length; i++)
    {
        const line = ASTNodesInput[i].trim();

        let lineNumber: number;
        let lineStatement: string;
        let lineContent: string;

        if (line.length === 0) continue;


        /*
        ASTNodesOutput.push({
            LINE_NUMBER : lineNumber,
            STATEMENT : lineStatement,
            CONTENT : lineContent,
        });
        */
    }

    return ASTNodesOutput;
}
