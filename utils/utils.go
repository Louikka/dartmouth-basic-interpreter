package utils

import (
	"strconv"
	"strings"
)

// Indices matches as follow:
//
//	0 = "DIMENSION TOO LARGE" // The size of a list or a table is too large for the availible storage. Make them smaller.
//	1 = "ILLEGAL CONSTANT" // More than nine digits or incorrect form in a constant number.
//	2 = "ILLEGAL FORMULA" // Perhaps the most common error message, may indicate missing parentheses, illegal variable names, missing multiply signs, illegal numbers, or many other errors. Check the statement thoroughly.
//	3 = "ILLEGAL RELATION" // Something is wrong with the relational expression in an `IF-THEN` statement. Check to see if you used one of the six permissable relational symbols.
//	4 = "ILLEGAL LINE NUMBER" // Line number is of incorrect form, or contains more than five digits.
//	5 = "ILLEGAL INSTRUCTION" // Other than one of the fifteen legal BASIC instructions has been used following the line number.
//	6 = "ILLEGAL VARIABLE" // An illegal variable name has been used.
//	7 = "INCORRECT FORMAT" // The format of an instruction is wrong. See especially `IF-THEN`'s and `FOR`'s.
//	8 = "END IS NOT LAST" // Self-explanatory, it also occurs if there are two or more `END` statements in the program.
//	9 = "NO END INSTRUCTION" // The program has no `END` statement.
//	10 = "NO DATA" // There is at least one `READ` statement in the program, but no `DATA` statements.
//	11 = "UNDEFINED FUNCTION" // A function such as `FNF( )` has been used without appearing in a `DEF` statement. Check for typographical errors.
//	12 = "UNDEFINED NUMBER" // The statement number appearing in a `GOTO` or `IF-THEN` statement does not appear as a line number in the program.
//	13 = "PROGRAM TOO LONG" // Either the program itself is too long for the available storage, or there are too many constants and printed labels.
//	14 = "TOO MUCH DATA" // There is too mush data in the program.
//	15 = "TOO MANY LABLES" // The total length of all printed labels in the program exceeds the limit.
//	16 = "TOO MANY LOOPS" // There are too many `FOR-NEXT` combinations in the program. The upper limit is 26.
//	17 = "NOT MATCH WITH FOR" // An incorrect `NEXT` statement, perhaps with a wrong variable given, Also, check for incorrectly nested `FOR` statement.
//	18 = "FOR WITHOUT NEXT" // A missing `NEXT` statement. This message can also occur in conjunction with the previous one ("NOT MATCH WITH FOR").
//	19 = "CUT PROGRAM OR DIMS" // Either the program is too long, or the amount of space reserved by the `DIM` statement is too much, or a combination of these. This message can be eliminated by either cutting the length of the program, or by reducing the size of the lists and tables.
//	20 = "SUBSCRIPT ERROR" // A subscript has been called for that lies outside the range specified in the `DIM` statement, or if no `DIM` statement applies, outside the range 0 through 10.
//	21 = "ILLEGAL RETURN" // Occurs if a `RETURN` is encountered before the first `GOSUB` during the running of a program. (Note: BASIC does not require the `GOSUB` to have an earlier statement number -- only to perform a `GOSUB` before performing a `RETURN`.)
var BASICErrors = []string{
	"DIMENSION TOO LARGE",
	"ILLEGAL CONSTANT",
	"ILLEGAL FORMULA",
	"ILLEGAL RELATION",
	"ILLEGAL LINE NUMBER",
	"ILLEGAL INSTRUCTION",
	"ILLEGAL VARIABLE",
	"INCORRECT FORMAT",
	"END IS NOT LAST",
	"NO END INSTRUCTION",
	"NO DATA",
	"UNDEFINED FUNCTION",
	"UNDEFINED NUMBER",
	"PROGRAM TOO LONG",
	"TOO MUCH DATA",
	"TOO MANY LABLES",
	"TOO MANY LOOPS",
	"NOT MATCH WITH FOR",
	"FOR WITHOUT NEXT",
	"CUT PROGRAM OR DIMS",
	"SUBSCRIPT ERROR",
	"ILLEGAL RETURN",
}

type ParsedDevError struct {
	// Parsed index of error in [BASICErrors].
	Index           int
	OriginalMessage string
	BasicMessage    string
}

// Note, that in `errmsg` first 3 symbols should be the numbers or spaces (e.g. `"001sdhsjaagsd"` or `"  5 shdhjj"`).
func ParseDevErrorMessage(errmsg string) ParsedDevError {
	var e ParsedDevError = ParsedDevError{}

	errmsgIndex := strings.TrimSpace(errmsg[:3])
	errmsgString := strings.TrimSpace(errmsg[4:])

	e.OriginalMessage = errmsgString

	i, err := strconv.Atoi(errmsgIndex)
	if err != nil {
		return e
	}

	e.Index = i

	if i < 0 || i >= len(BASICErrors) {
		return e
	}

	e.BasicMessage = BASICErrors[i]

	return e
}
