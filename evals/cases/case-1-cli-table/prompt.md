# Eval Case 1: Markdown Table Formatter CLI

Build a Node.js command-line tool named `md-table-formatter` that reads Markdown tables from standard input or a specified file path, parses table rows and pipes, normalizes irregular whitespace, and formats columns according to specified alignments (`left`, `center`, `right`).

Requirements:
1. Support both file argument `md-table-formatter input.md` and stdin stream `cat input.md | md-table-formatter`.
2. Support custom column alignment via flag `--align <alignments>` (e.g., `--align left,center,right`).
3. Support sorting table rows alphabetically or numerically by column header name or 1-based index via `--sort <col>` and `--desc`.
4. Ensure non-interactive safety: do not hang if stdin is a TTY without inputs; output clean usage instructions and exit with code 1.
5. Provide comprehensive automated tests covering parsing, alignment, sorting, and CLI streaming.
6. Use native Node.js (Node 20+) with zero external runtime dependencies.
