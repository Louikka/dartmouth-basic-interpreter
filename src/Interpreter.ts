import {
    removeDuplicatesFromArrayOfObjects,
    throwError
// @ts-ignore
} from './__helpers__.ts';

export class Interpreter
{
    constructor(ast: ASTRoot)
    {
        this.ASTtree = ast;
        this.ASTtreeNormalized = this.normalize();
    }



    private ASTtree: ASTRoot;
    private ASTtreeNormalized: ASTRoot;

    public get normalizedASTTree(): ASTRoot
    {
        return this.ASTtreeNormalized;
    }


    public allowedStatementsAfterEND = [ 'DATA', ];


    public normalize(ast = this.ASTtree): ASTRoot
    {
        let __return: typeof ast.value = [];

        for (const statement of ast.value)
        {
            __return[ statement.line_number ] = statement;
        }

        return {
            type : 'PROGRAM',
            value : __return,
        };
    }


    public execute()
    {
        const ASTRootType = this.ASTtreeNormalized.type;
        if (ASTRootType !== 'PROGRAM')
        {
            throwError(`Interpreter error : Expected a "PROGRAM" AST type.`);
        }
        const ASTRootValue = this.ASTtreeNormalized.value;


        // program data
        let isENDEncountered = false;

        let PROGRAM_DATA = [];


        FIRST_LOOP:
        for (const line of ASTRootValue)
        {
            if (line === undefined) continue;

            if (isENDEncountered && !this.allowedStatementsAfterEND.includes(line.statement))
            {
                throwError(`END IS NOT LAST.`);
            }

            switch (line.statement)
            {
                case 'DATA':
                {
                    PROGRAM_DATA.push(...line.value);
                    continue;
                }
                case 'END':
                {
                    isENDEncountered = true;
                    continue;
                }

                default:
                {
                    continue;
                }
            }
        }

        // generally, should not be used in the `SECOND_LOOP` loop
        isENDEncountered = false;


        SECOND_LOOP:
        for (let i = 0; i < ASTRootValue.length; i++)
        {
            const line = ASTRootValue[i];

            switch (line.statement)
            {
                case 'END':
                {
                    break SECOND_LOOP;
                }

                default:
                {
                    continue;
                }
            }
        }
    }
}
