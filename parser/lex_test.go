package parser

import "testing"

func TestScanner(t *testing.T) {
	const test_str = "abcdefg"
	const test_strlen = len(test_str)

	scanner := NewScanner(test_str)

	if scanner.String != test_str {
		t.Errorf("Strings not matched => %s != %s.", test_str, scanner.String)
	}

	if scanner.CurrentPosition != 0 {
		t.Errorf("Wrong current position initialization => %d.", scanner.CurrentPosition)
	}

	scanner.CurrentPosition++

	peekedChar, err := scanner.Peek(0)
	if err != nil || peekedChar != test_str[1] {
		t.Errorf("Cannot peek or peeking at wrong poition => error or mismatched char %q != %q.", test_str[1], peekedChar)
	}

	scanner.CurrentPosition = test_strlen

	if !scanner.IsEndOfString() {
		t.Errorf("Cannot determine if end of string => current position %d in string with length of %d.", scanner.CurrentPosition, test_strlen)
	}
}
