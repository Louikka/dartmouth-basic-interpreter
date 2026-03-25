package scanner

import (
	"testing"
)

func TestScanner(t *testing.T) {
	const test_str = "abcdefg"
	const test_strlen = len(test_str)

	scanner := NewScanner(test_str)

	if scanner.Input != test_str {
		t.Errorf("Strings not matched => %s != %s.", test_str, scanner.Input)
	}

	if scanner.CurrentPosition != 0 {
		t.Errorf("Wrong current position initialization => %d.", scanner.CurrentPosition)
	}

	nextChar, err := scanner.Next()
	if err != nil || nextChar != test_str[1] {
		t.Errorf(".Next() error => error or mismatched char %q != %q.", test_str[1], nextChar)
	}

	peekedChar, err := scanner.Peek(1)
	if err != nil || peekedChar != test_str[2] {
		t.Errorf(".Peek() error or peeking at wrong poition => error or mismatched char %q != %q.", test_str[2], peekedChar)
	}

	scanner.CurrentPosition = test_strlen

	if !scanner.IsEndOfString() {
		t.Errorf("Cannot determine if end of string => current position %d in string with length of %d.", scanner.CurrentPosition, test_strlen)
	}

	scanner2 := NewScanner("abcdefghjk")
	for i := 0; !scanner2.IsEndOfString(); {
		_, err := scanner2.Peek(0)
		if err != nil {
			t.Errorf("Iteration failed => .Peek() error at iteration %d.", i)
		}

		scanner2.Next()
	}
}
