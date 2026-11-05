EXE_EXT :=
MKDIR := mkdir -p
RMDIR := rm -rf

ifeq ($(OS),Windows_NT)
	EXE_EXT := .exe
	MKDIR := mkdir
	RMDIR := rmdir /s /q
endif

TEMP_DIR := temp
BIN_DIR := bin

ESBUILD_INPUT := jsrt.ts
ESBUILD_OUTPUT := $(TEMP_DIR)/jsrt_bundle.js

QJS_OUTPUT := $(BIN_DIR)/jsrt$(EXE_EXT)


default: build


mkdir:
	$(MKDIR) temp bin


clean:
	$(RMDIR) temp bin


build: mkdir
	npx esbuild $(ESBUILD_INPUT) --bundle --outfile=$(ESBUILD_OUTPUT) --external:qjs:* --platform=neutral
	qjs -c $(ESBUILD_OUTPUT) -o $(QJS_OUTPUT)
	go build -o $(BIN_DIR)/


.PHONY: default mkdir clean build
