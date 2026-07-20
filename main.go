package main

import (
	"fmt"
	"log"
	"os/exec"
)

func main() {
	INPUT := "2 + 3"

	cmd := exec.Command("./jsrt", INPUT)

	stdout, err := cmd.Output()
	if err != nil {
		log.Fatalf("Execution failed: %s", err)
	}

	fmt.Println(string(stdout))
}
