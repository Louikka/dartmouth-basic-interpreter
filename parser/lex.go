package parser

import "fmt"

type Scanner struct {
	String          string
	CurrentPosition int
}

func (scanner Scanner) Peek(pos int) (byte, error) {
	strlen := len(scanner.String)
	newPos := scanner.CurrentPosition + pos

	if newPos < 0 || newPos >= strlen {
		return 0, fmt.Errorf("(E001) Scanner trying to access character that out of bounds (peeking at position %d in string with length %d).", newPos, strlen)
	}

	return scanner.String[newPos], nil
}

func (scanner Scanner) IsEndOfString() bool {
	strlen := len(scanner.String)

	return scanner.CurrentPosition >= strlen
}

func NewScanner(s string) *Scanner {
	return &Scanner{
		String:          s,
		CurrentPosition: 0,
	}
}
