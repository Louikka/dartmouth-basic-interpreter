abstract class BASICError extends Error
{
    constructor(message?: string, options?: ErrorOptions)
    {
        super(message, options);
        this.name = this.constructor.name;
    }

    /** Original BASIC error message. */
    public abstract readonly originalMessage: string;

    /** Message description from Dartmouth manual. */
    public abstract readonly description: string;
}


export class BASICDimTooLargeError extends BASICError
{
    constructor(message?: string, options?: ErrorOptions)
    {
        super(message, options);
    }

    public readonly originalMessage = 'DIMENSION TOO LARGE';
    public readonly description = 'The size of a list or a table is too large for the availible storage. Make them smaller.';
}

//   {
//     "name": "ERR_ILL_CONST",
//     "message": "ILLEGAL CONSTANT",
//     "description": "More than nine digits or incorrect form in a constant number."
//   },

export class BASICIllFormulaError extends BASICError
{
    constructor(message?: string, options?: ErrorOptions)
    {
        super(message, options);
    }

    public readonly originalMessage = 'ILLEGAL FORMULA';
    public readonly description = 'Perhaps the most common error message, may indicate missing parentheses, illegal variable names, missing multiply signs, illegal numbers, or many other errors. Check the statement thoroughly.';
}

//   {
//     "name": "ERR_ILL_REL",
//     "message": "ILLEGAL RELATION",
//     "description": "Something is wrong with the relational expression in an `IF-THEN` statement. Check to see if you used one of the six permissable relational symbols."
//   },
//   {
//     "name": "ERR_ILL_LINE_NUM",
//     "message": "ILLEGAL LINE NUMBER",
//     "description": "Line number is of incorrect form, or contains more than five digits."
//   },
//   {
//     "name": "ERR_ILL_INSTRUCTION",
//     "message": "ILLEGAL INSTRUCTION",
//     "description": "Other than one of the fifteen legal BASIC instructions has been used following the line number."
//   },
//   {
//     "name": "ERR_ILL_VAR",
//     "message": "ILLEGAL VARIABLE",
//     "description": "An illegal variable name has been used."
//   },
//   {
//     "name": "ERR_INCORR_FORMAT",
//     "message": "INCORRECT FORMAT",
//     "description": "The format of an instruction is wrong. See especially `IF-THEN`'s and `FOR`'s."
//   },
//   {
//     "name": "ERR_END_NOT_LAST",
//     "message": "END IS NOT LAST",
//     "description": "Self-explanatory, it also occurs if there are two or more `END` statements in the program."
//   },
//   {
//     "name": "ERR_NO_END",
//     "message": "NO END INSTRUCTION",
//     "description": "The program has no `END` statement."
//   },
//   {
//     "name": "ERR_NO_DATA",
//     "message": "NO DATA",
//     "description": "There is at least one `READ` statement in the program, but no `DATA` statements."
//   },
//   {
//     "name": "ERR_UNDEF_FUNC",
//     "message": "UNDEFINED FUNCTION",
//     "description": "A function such as `FNF( )` has been used without appearing in a `DEF` statement. Check for typographical errors."
//   },
//   {
//     "name": "ERR_UNDEF_NUM",
//     "message": "UNDEFINED NUMBER",
//     "description": "The statement number appearing in a `GOTO` or `IF-THEN` statement does not appear as a line number in the program."
//   },
//   {
//     "name": "ERR_PROG_TOO_LONG",
//     "message": "PROGRAM TOO LONG",
//     "description": "Either the program itself is too long for the available storage, or there are too many constants and printed labels."
//   },
//   {
//     "name": "ERR_TOO_MUCH_DATA",
//     "message": "TOO MUCH DATA",
//     "description": "There is too mush data in the program."
//   },
//   {
//     "name": "ERR_TOO_MANY_LABLES",
//     "message": "TOO MANY LABLES",
//     "description": "The total length of all printed labels in the program exceeds the limit."
//   },
//   {
//     "name": "ERR_TOO_MANY_LOOPS",
//     "message": "TOO MANY LOOPS",
//     "description": "There are too many `FOR-NEXT` combinations in the program. The upper limit is 26."
//   },
//   {
//     "name": "ERR_NOT_MATCH_W_FOR",
//     "message": "NOT MATCH WITH FOR",
//     "description": "An incorrect `NEXT` statement, perhaps with a wrong variable given, Also, check for incorrectly nested `FOR` statement."
//   },
//   {
//     "name": "ERR_FOR_WO_NEXT",
//     "message": "FOR WITHOUT NEXT",
//     "description": "A missing `NEXT` statement. This message can also occur in conjunction with the previous one (\"NOT MATCH WITH FOR\")."
//   },
//   {
//     "name": "ERR_CUT_PROG_OR_DIMS",
//     "message": "CUT PROGRAM OR DIMS",
//     "description": "Either the program is too long, or the amount of space reserved by the `DIM` statement is too much, or a combination of these. This message can be eliminated by either cutting the length of the program, or by reducing the size of the lists and tables."
//   },
//   {
//     "name": "ERR_SUBSCRIPT",
//     "message": "SUBSCRIPT ERROR",
//     "description": "A subscript has been called for that lies outside the range specified in the `DIM` statement, or if no `DIM` statement applies, outside the range 0 through 10."
//   },
//   {
//     "name": "ERR_ILL_RETURN",
//     "message": "ILLEGAL RETURN",
//     "description": "Occurs if a `RETURN` is encountered before the first `GOSUB` during the running of a program. (Note: BASIC does not require the `GOSUB` to have an earlier statement number -- only to perform a `GOSUB` before performing a `RETURN`.)"
//   }
