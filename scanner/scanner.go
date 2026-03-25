package scanner

import (
	"fmt"
)

type Scanner struct {
	Input           string
	CurrentPosition int
}

func (scanner *Scanner) Peek(pos int) (byte, error) {
	strlen := len(scanner.Input)
	newPos := scanner.CurrentPosition + pos

	if newPos < 0 || newPos >= strlen {
		return 0, fmt.Errorf("002Scanner trying to access character that out of bounds (peeking at position %d in string with length %d).", newPos, strlen)
	}

	return scanner.Input[newPos], nil
}

func (scanner *Scanner) Next() (byte, error) {
	scanner.CurrentPosition++
	return scanner.Peek(0)
}

// Returns true if current position is greater or equal to length of the input; otherwise returns false.
func (scanner *Scanner) IsEndOfString() bool {
	strlen := len(scanner.Input)
	return scanner.CurrentPosition >= strlen
}

func NewScanner(s string) *Scanner {
	return &Scanner{
		Input:           s,
		CurrentPosition: 0,
	}
}
