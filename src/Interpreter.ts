// @ts-ignore
import { BASICErrors } from './errors.ts';


export let __LAST_ERROR__: string | null = null;


type __VariableTypes = 'var' | __ListAndTableTypes;
type __ListAndTableTypes = 'list' | 'table';

type ProgramDim = __Dimension;
type ProgramFunction = __FuncDef;

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


    public allowedStatementsAfterEND = [ 'DATA', 'DEF', 'DIM', 'REM', ];


    private PROGRAM_DATA: number[] = [];
    private PROGRAM_DIMS: ProgramDim[] = [];

    public getProgramDim(type: __ListAndTableTypes, name: string): ProgramDim
    {
        const __LIST_DIM_DEFAULT: __ListDim = { type : 'list', name : name, dim : 10, };
        const __TABLE_DIM_DEFAULT: __TableDim = { type : 'table', name : name, dim1 : 10, dim2 : 10 };

        const v = this.PROGRAM_DIMS.find(v => (v.type === type && v.name === name));

        return v ?? (type === 'list') ? __LIST_DIM_DEFAULT : __TABLE_DIM_DEFAULT;
    }
    public addProgramDim(dim: ProgramDim)
    {
        this.PROGRAM_DIMS.push(dim);
    }

    private PROGRAM_FUNCTIONS: ProgramFunction[] = [];

    public getProgramFunction(name: string): ProgramFunction
    {
        const v = this.PROGRAM_FUNCTIONS.find(v => v.name === name);
        if (v === undefined)
        {
            __LAST_ERROR__ = `Error at Interpreter.(private)getProgramVariable() : Undeclared fucntion.`;
            throw new Error(BASICErrors.ILL_FORMULA);
        }

        return v;
    }
    public addProgramFunction(func: ProgramFunction)
    {
        // find index of function, if already declared
        let index = this.PROGRAM_FUNCTIONS.findIndex(v => v.name === func.name);

        if (index < 0)
        {
            this.PROGRAM_FUNCTIONS.push(func);
        }
        else
        {
            this.PROGRAM_FUNCTIONS[index] = func;
        }
    }

    private PROGRAM_VARIABLES: ProgramVariable[] = [];

    public getProgramVariable(type: __VariableTypes, name: string): ProgramVariable
    {
        const v = this.PROGRAM_VARIABLES.find(v => (v.type === type && v.name === name));
        if (v === undefined)
        {
            __LAST_ERROR__ = `Error at Interpreter.(private)getProgramVariable() : Undeclared variable.`;
            throw new Error(BASICErrors.ILL_FORMULA);
        }

        return v;
    }
    public addProgramVariable(variable: ProgramVariable)
    {
        // find index of variable, if already declared
        let index = this.PROGRAM_VARIABLES.findIndex(v => (v.name === variable.name && v.type === variable.type));

        if (index < 0)
        {
            this.PROGRAM_VARIABLES.push(variable);
        }
        else
        {
            this.PROGRAM_VARIABLES[index] = variable;
        }
    }


    private parseExpression(expr: ExprNode): number
    {
        if (expr.type === 'NUMBER')
        {
            return expr.value;
        }

        if (expr.type === 'VARIABLE')
        {
            const value = (this.getProgramVariable('var', expr.name) as UnsubscriptedVariable).getValue();
            if (value === null)
            {
                __LAST_ERROR__ = `Error at Interpreter.(private)parseExpression() : Undeclared variable.`;
                throw new Error(BASICErrors.ILL_FORMULA);
            }

            return value;
        }
        if (expr.type === 'LISTVAR')
        {
            const value = (this.getProgramVariable('list', expr.name) as ListVariable).getValue(this.parseExpression(expr.subscript));
            if (value === null)
            {
                __LAST_ERROR__ = `Error at Interpreter.(private)parseExpression() : Undeclared list.`;
                throw new Error(BASICErrors.ILL_FORMULA);
            }

            return value;
        }
        if (expr.type === 'TABLEVAR')
        {
            const value = (this.getProgramVariable('table', expr.name) as TableVariable).getValue(this.parseExpression(expr.subscripts.sub1), this.parseExpression(expr.subscripts.sub2));
            if (value === null)
            {
                __LAST_ERROR__ = `Error at Interpreter.(private)parseExpression() : Undeclared table.`;
                throw new Error(BASICErrors.ILL_FORMULA);
            }

            return value;
        }

        if (expr.type === 'BINARY')
        {
            switch (expr.operator)
            {
                case '+': return this.parseExpression(expr.left) + this.parseExpression(expr.right);
                case '-': return this.parseExpression(expr.left) - this.parseExpression(expr.right);
                case '*': return this.parseExpression(expr.left) * this.parseExpression(expr.right);
                case '/': return this.parseExpression(expr.left) / this.parseExpression(expr.right);
                case '^': return this.parseExpression(expr.left) ** this.parseExpression(expr.right);

                default:
                {
                    __LAST_ERROR__ = `Error at Interpreter.(private)parseExpression() : Undefined operator "${expr.operator}".`;
                    throw new Error(BASICErrors.ILL_FORMULA);
                }
            }
        }

        if (expr.type === 'FUNCCALL')
        {
            switch (expr.name)
            {
                case 'SIN': return Math.sin(this.parseExpression(expr.argument));
                case 'COS': return Math.cos(this.parseExpression(expr.argument));
                case 'TAN': return Math.tan(this.parseExpression(expr.argument));
                case 'ATN': return Math.atan(this.parseExpression(expr.argument));
                case 'EXP': return Math.exp(this.parseExpression(expr.argument));
                case 'ABS': return Math.abs(this.parseExpression(expr.argument));
                case 'LOG': return Math.log( Math.abs(this.parseExpression(expr.argument)) );
                case 'SQR': return Math.sqrt( Math.abs(this.parseExpression(expr.argument)) );
                case 'INT': return Math.trunc(this.parseExpression(expr.argument));
                case 'RND': return Math.random();

                default:
                {
                    __LAST_ERROR__ = `Error at Interpreter.(private)parseExpression() : Cannot parse function call : Undefened function "${expr.name}".`;
                    throw new Error(BASICErrors.ILL_FORMULA);
                }
            }
        }
        if (expr.type === 'UFUNCCALL')
        {
            let __arg = this.parseExpression(expr.argument);

            // find function declaration
            let __func = this.getProgramFunction(expr.name);

            // initialize unsubscripted variable
            let __newVar = new UnsubscriptedVariable(__func.name, __arg);
            this.addProgramVariable(__newVar);

            return this.parseExpression(__func.expression);
        }

        __LAST_ERROR__ = `Error at Interpreter.(private)parseExpression() : Undefined expression "${expr}".`;
        throw new Error();
    }


    /**
     * @param ast parsed AST tree. If abscent, takes the AST given to the class.
     */
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
            __LAST_ERROR__ = `Error at Interpreter.(public)execute() : Expected a "PROGRAM" AST type.`;
            throw new Error();
        }
        const ASTRootValue = this.ASTtreeNormalized.value;


        // flags
        let isENDEncountered = false;


        FIRST_LOOP:
        for (const line of ASTRootValue)
        {
            if (line === undefined) continue;

            if (isENDEncountered && !this.allowedStatementsAfterEND.includes(line.statement))
            {
                __LAST_ERROR__ = `Error at Interpreter.(public)execute() in FIRST_LOOP.`;
                throw new Error(BASICErrors.END_NOT_LAST);
            }

            switch (line.statement)
            {
                case 'DATA':
                {
                    for (const n of line.value)
                    {
                        this.PROGRAM_DATA.push(n.value);
                    }

                    continue;
                }
                case 'END':
                {
                    isENDEncountered = true;
                    continue;
                }
                case 'DEF':
                {
                    this.addProgramFunction(line.value);

                    continue;
                }
                case 'DIM':
                {
                    for (const dim of line.value)
                    {
                        this.addProgramDim(dim);

                        const v = this.PROGRAM_VARIABLES.find(v => (v.type === dim.type && v.name === dim.name));
                        if (v !== undefined)
                        {
                            if (v.type === 'list' && dim.type === 'list')
                            {
                                v.setDimension(dim.dim);
                            }
                            else if (v.type === 'table' && dim.type === 'table')
                            {
                                v.setDimensions(dim.dim1, dim.dim2);
                            }
                        }
                    }

                    continue;
                }

                default:
                {
                    continue;
                }
            }
        }

        if (!isENDEncountered)
        {
            __LAST_ERROR__ = `Error at Interpreter.(public)execute().`;
            throw new Error(BASICErrors.NO_END);
        }

        // generally, should not be used in the `SECOND_LOOP` loop
        isENDEncountered = true;


        SECOND_LOOP:
        for (let i = 0; i < ASTRootValue.length; i++)
        {
            const line = ASTRootValue[i];

            if (line === undefined) continue;

            switch (line.statement)
            {
                case 'LET':
                {
                    const lv = line.value;
                    let __newVar: ProgramVariable;

                    if (lv.variable.type === 'VARIABLE')
                    {
                        __newVar = new UnsubscriptedVariable(lv.variable.name, this.parseExpression(lv.expression));
                    }
                    else if (lv.variable.type === 'LISTVAR')
                    {
                        const subscript = this.parseExpression(lv.variable.subscript);
                        const value = this.parseExpression(lv.expression);

                        const __dim = this.getProgramDim('list', lv.variable.name) as __ListDim;
                        let __list: number[] = new Array(__dim.dim + 1);
                        __list[subscript] = value;

                        __newVar = new ListVariable(lv.variable.name, __list);
                    }
                    else
                    {
                        const sub1 = this.parseExpression(lv.variable.subscripts.sub1);
                        const sub2 = this.parseExpression(lv.variable.subscripts.sub2);
                        const value = this.parseExpression(lv.expression);

                        const __dim = this.getProgramDim('table', lv.variable.name) as __TableDim;
                        let __table: number[][] = (new Array(__dim.dim1 + 1)).fill(new Array(__dim.dim2 + 1));
                        __table[sub1][sub2] = value;

                        __newVar = new TableVariable(lv.variable.name, __table);
                    }

                    this.addProgramVariable(__newVar);

                    continue;
                }
                case 'READ':
                {
                    for (const v of line.value)
                    {
                        let __newVar: ProgramVariable;

                        if (v.type === 'VARIABLE')
                        {
                            const value = this.PROGRAM_DATA.shift();
                            if (value === undefined)
                            {
                                __LAST_ERROR__ = `Error at Interpreter.(public)execute() : Failed READ statement : No data availible.`;
                                throw new Error(BASICErrors.ILL_FORMULA);
                            }

                            __newVar = new UnsubscriptedVariable(v.name, value);
                        }
                        else if (v.type === 'LISTVAR')
                        {
                            const subscript = this.parseExpression(v.subscript);
                            const value = this.PROGRAM_DATA.shift();
                            if (value === undefined)
                            {
                                __LAST_ERROR__ = `Error at Interpreter.(public)execute() : Failed READ statement : No data availible.`;
                                throw new Error(BASICErrors.ILL_FORMULA);
                            }

                            const __dim = this.getProgramDim('list', v.name) as __ListDim;
                            let __list: number[] = new Array(__dim.dim + 1);
                            __list[subscript] = value;

                            __newVar = new ListVariable(v.name, __list);
                        }
                        else
                        {
                            const sub1 = this.parseExpression(v.subscripts.sub1);
                            const sub2 = this.parseExpression(v.subscripts.sub2);
                            const value = this.PROGRAM_DATA.shift();
                            if (value === undefined)
                            {
                                __LAST_ERROR__ = `Error at Interpreter.(public)execute() : Failed READ statement : No data availible.`;
                                throw new Error(BASICErrors.ILL_FORMULA);
                            }

                            const __dim = this.getProgramDim('table', v.name) as __TableDim;
                            let __table: number[][] = (new Array(__dim.dim1 + 1)).fill(new Array(__dim.dim2 + 1));
                            __table[sub1][sub2] = value;

                            __newVar = new TableVariable(v.name, __table);
                        }

                        this.addProgramVariable(__newVar);
                    }

                    continue;
                }
                case 'GOTO':
                {
                    i = line.value.value - 1;
                    continue;
                }
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


type ProgramVariable = UnsubscriptedVariable | ListVariable | TableVariable;

class UnsubscriptedVariable
{
    constructor(name: string, value: number | null)
    {
        this.__name = name;
        this.__value = value;
    }


    public readonly type = 'var';

    private __name: string;
    public get name()
    {
        return this.__name;
    }

    private __value: number | null;

    public getValue(): number | null
    {
        return this.__value;
    }
    public setValue(value: number | null)
    {
        this.__value = value;
    }
}

/**
 * `value` dimension should be in accordance with corresponded DIM.
 */
class ListVariable
{
    constructor(name: string, value: number[])
    {
        this.__name = name;
        this.__value = value;
        this.__dim = value.length - 1;
    }


    public readonly type = 'list';

    private __name: string;
    public get name()
    {
        return this.__name;
    }


    private __value: number[];

    public getValue(i: number): number | null
    {
        if (!Number.isInteger(i))
        {
            __LAST_ERROR__ = `Error at ListVariable.(public)getValue().`;
            throw new Error(BASICErrors.ILL_CONST);
        }
        if (i < 0 || i > this.dim)
        {
            __LAST_ERROR__ = `Error at ListVariable.(public)getValue().`;
            throw new Error(BASICErrors.SUBSCRIPT);
        }

        return this.__value[i] ?? null;
    }
    public setValue(v: number, i: number)
    {
        if (!Number.isInteger(i))
        {
            __LAST_ERROR__ = `Error at ListVariable.(public)setValue().`;
            throw new Error(BASICErrors.ILL_CONST);
        }
        if (i < 0 || i > this.dim)
        {
            __LAST_ERROR__ = `Error at ListVariable.(public)setValue().`;
            throw new Error(BASICErrors.SUBSCRIPT);
        }

        this.__value[i] = v;
    }


    private __dim: number;
    public get dim()
    {
        return this.__dim;
    }

    public setDimension(to: number)
    {
        if (!Number.isInteger(to))
        {
            __LAST_ERROR__ = `Error at ListVariable.(public)setDimension().`;
            throw new Error(BASICErrors.ILL_CONST);
        }
        if (to < 0 || to > 1500)
        {
            __LAST_ERROR__ = `Error at ListVariable.(public)setDimension().`;
            throw new Error(BASICErrors.SUBSCRIPT);
        }

        this.__dim = to;
    }
}

/**
 * `value` dimensions should be in accordance with corresponded DIM.
 */
class TableVariable
{
    constructor(name: string, value: number[][])
    {
        this.__name = name;
        this.__value = value;

        this.__dimRow = value.length;
        this.__dimCol = value[0].length;
    }


    public readonly type = 'table';

    private __name: string;
    public get name()
    {
        return this.__name;
    }


    private __value: number[][];

    public getValue(i1: number, i2: number): number | null
    {
        if (!Number.isInteger(i1) || !Number.isInteger(i2))
        {
            __LAST_ERROR__ = `Error at TableVariable.(public)getValue().`;
            throw new Error(BASICErrors.ILL_CONST);
        }
        if (i1 < 0 || i1 > this.dimRow || i2 < 0 || i2 > this.dimCol)
        {
            __LAST_ERROR__ = `Error at TableVariable.(public)getValue().`;
            throw new Error(BASICErrors.SUBSCRIPT);
        }

        return this.__value[i1][i2] ?? null;
    }
    public setValue(v: number, i1: number, i2: number)
    {
        if (!Number.isInteger(i1) || !Number.isInteger(i2))
        {
            __LAST_ERROR__ = `Error at TableVariable.(public)setValue().`;
            throw new Error(BASICErrors.ILL_CONST);
        }
        if (i1 < 0 || i1 > this.dimRow || i2 < 0 || i2 > this.dimCol)
        {
            __LAST_ERROR__ = `Error at TableVariable.(public)setValue().`;
            throw new Error(BASICErrors.SUBSCRIPT);
        }

        this.__value[i1][i2] = v;
    }


    private __dimRow: number;
    public get dimRow()
    {
        return this.__dimRow;
    }

    private __dimCol: number;
    public get dimCol()
    {
        return this.__dimCol;
    }

    public setDimensions(row: number, col: number)
    {
        if (!Number.isInteger(row) || !Number.isInteger(col))
        {
            __LAST_ERROR__ = `Error at TableVariable.(public)setDimensions().`;
            throw new Error(BASICErrors.ILL_CONST);
        }
        if (row < 0 || row > 1500 || col < 0 || col > 1500)
        {
            __LAST_ERROR__ = `Error at TableVariable.(public)setDimensions().`;
            throw new Error(BASICErrors.SUBSCRIPT);
        }

        this.__dimRow = row;
        this.__dimCol = col;
    }
}
