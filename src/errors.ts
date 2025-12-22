export const BASICErrors = {
    /** The size of a list or a table is too large for the availible storage. Make them smaller. */
    DIM_TOO_LARGE    : 'DIMENSION TOO LARGE',
    /** More than nine digits or incorrect form in a constant number. */
    ILL_CONST        : 'ILLEGAL CONSTANT',
    /** Perhaps the most common error message, may indicate missing parentheses, illegal variable names, missing multiply signs, illegal numbers, or many other errors. Check the statement thoroughly */
    ILL_FORMULA      : 'ILLEGAL FORMULA',
    /** Something is wrong with the relational expression in an `IF-THEN` statement. Check to see if you used one of the six permissable relational symbols. */
    ILL_REL          : 'ILLEGAL RELATION',
    /** Line number is of incorrect form, or contains more than five digits. */
    ILL_LINE_NUM     : 'ILLEGAL LINE NUMBER',
    /** Other than one of the fifteen legal BASIC instructions has been used following the line number. */
    ILL_INSTRUCTION  : 'ILLEGAL INSTRUCTION',
    /** An illegal variable name has been used. */
    ILL_VAR          : 'ILLEGAL VARIABLE',
    /** The format of an instruction is wrong. See especially `IF-THEN`'s and `FOR`'s. */
    INCORR_FORMAT    : 'INCORRECT FORMAT',
    /** Self-explanatory, it also occurs if there are two or more `END` statements in the program. */
    END_NOT_LAST     : 'END IS NOT LAST',
    /** The program has no `END` statement. */
    NO_END           : 'NO END INSTRUCTION',
    /** There is at least one `READ` statement in the program, but no `DATA` statements. */
    NO_DATA          : 'NO DATA',
    /** A function such as `FNF( )` has been used without appearing in a `DEF` statement. Check for typographical errors. */
    UNDEF_FUNC       : 'UNDEFINED FUNCTION',
    /** The statement number appearing in a `GOTO` or `IF-THEN` statement does not appear as a line number in the program. */
    UNDEF_NUM        : 'UNDEFINED NUMBER',
    /** Either the program itself is too long for the available storage, or there are too many constants and printed labels. */
    PROGRAM_LONG     : 'PROGRAM TOO LONG',
    /** There is too mush data in the program. */
    TOO_MUCH_DATA    : 'TOO MUCH DATA',
    /** The total length of all printed labels in the program exceeds the limit. */
    TOO_MANY_LABLES  : 'TOO MANY LABLES',
    /** There are too many `FOR-NEXT` combinations in the program. The upper limit is 26. */
    TOO_MANY_LOOPS   : 'TOO MANY LOOPS',
    /** An incorrect `NEXT` statement, perhaps with a wrong variable given, Also, check for incorrectly nested `FOR` statement. */
    NOT_MATCH_W_FOR  : 'NOT MATCH WITH FOR',
    /** A missing `NEXT` statement. This message can also occur in conjunction with the previous one ("NOT MATCH WITH FOR"). */
    FOR_WO_NEXT      : 'FOR WITHOUT NEXT',
    /** Either the program is too long, or the amount of space reserved by the `DIM` statement is too much, or a combination of these. This message can be eliminated by either cutting the length of the program, or by reducing the size of the lists and tables. */
    CUT_PROGRAM_DIMS : 'CUT PROGRAM OR DIMS',
    /** A subscript has been called for that lies outside the range specified in the `DIM` statement, or if no `DIM` statement applies, outside the range 0 through 10. */
    SUBSCRIPT        : 'SUBSCRIPT ERROR',
    /** Occurs if a `RETURN` is encountered before the first `GOSUB` during the running of a program. (Note: BASIC does not require the `GOSUB` to have an earlier statement number -- only to perform a `GOSUB` before performing a `RETURN`.) */
    ILL_RETURN       : 'ILLEGAL RETURN',
};
