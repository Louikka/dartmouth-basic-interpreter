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


    public normalize(ast = this.ASTtree): ASTRoot
    {
        let step1 = removeDuplicatesFromArrayOfObjects(ast.value, 'line_number');
        let step2 = step1.sort((a, b) => a.line_number - b.line_number);

        return {
            type : 'PROGRAM',
            value : step2,
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


        FIRST_LOOP:
        for (const line of ASTRootValue)
        {
            //
        }


        SECOND_LOOP:
        for (const line of ASTRootValue)
        {
            //
        }
    }
}
