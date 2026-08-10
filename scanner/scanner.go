package scanner

import (
	"fmt"
)

type Scanner struct {
	s   string
	pos int
}

func (scanner *Scanner) peek(pos int) (byte, error) {
	strlen := len(scanner.s)
	newPos := scanner.pos + pos

	if newPos < 0 || newPos >= strlen {
		return 0, fmt.Errorf("Trying to access character out of bounds (%d).", newPos)
	}

	return scanner.s[newPos], nil
}

func (scanner *Scanner) next() (byte, error) {
	scanner.pos++
	return scanner.peek(0)
}

// Returns true if current position is greater or equal to length of the input; otherwise returns false.
func (scanner *Scanner) isEOF() bool {
	strlen := len(scanner.s)
	return scanner.pos >= strlen
}

func NewScanner(s string) *Scanner {
	return &Scanner{
		s:   s,
		pos: 0,
	}
}
