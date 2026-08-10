package scanner

import (
	"testing"
)

const test_str = "abcdefg"
const test_strlen = len(test_str)

func TestScannerInitialization(t *testing.T) {
	scanner := NewScanner(test_str)

	if scanner.s != test_str {
		t.Errorf("Strings not matched => \"%s\" != \"%s\".", test_str, scanner.s)
	}

	if scanner.pos != 0 {
		t.Errorf("Wrong current position initialization => %d.", scanner.pos)
	}
}

func TestScannerCoreFunctions(t *testing.T) {
	scanner := NewScanner(test_str)

	nextChar, err := scanner.next()
	if err != nil || nextChar != test_str[1] {
		t.Errorf("Scanner.Next() error => error or mismatched char \"%s\" != \"%s\".", test_str[1], nextChar)
	}

	peekedChar, err := scanner.peek(1)
	if err != nil || peekedChar != test_str[2] {
		t.Errorf("Scanner.Peek() error or peeking at wrong poition => error or mismatched char %s != %s.", test_str[2], peekedChar)
	}

	scanner.pos = test_strlen

	if !scanner.isEOF() {
		t.Errorf("Cannot determine if end of string => current position %d in string with length of %d.", scanner.pos, test_strlen)
	}

	scanner2 := NewScanner("abcdefghjk")
	for i := 0; !scanner2.isEOF(); i++ {
		_, err := scanner2.peek(0)
		if err != nil {
			t.Errorf("Iteration failed => Scanner.Peek() error at iteration %d.", i)
		}

		scanner2.next()
	}
}
