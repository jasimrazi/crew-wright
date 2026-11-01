# Example Run: Markdown Table Formatter CLI (`table-wright`)

This walkthrough illustrates an end-to-end execution of `crew-wright` for a medium-preset software engineering task. It details how the orchestrator triages, plans, coordinates specialist sub-agents across waves, enforces blind review, gates on test evidence, and delivers the final software.

---

## 1. Initial Prompt & Phase 0: Triage

### User Request
> "Build a Node.js CLI tool called `table-wright` that parses messy Markdown tables or CSV from stdin or file, validates column alignment, formats padding cleanly with column alignments (left, right, center), and supports sorting by column. Include comprehensive unit and integration tests."

### Orchestrator Assessment & Confirmation
The orchestrator assesses the scope:
- Multi-file feature (CLI parser, table AST, formatter, sorter, test suites).
- Touches 5–7 files.
- Preset: **Medium**.
- Roles needed: **Planner**, **Designer**, **Coder (Core & Formatter)**, **Coder (CLI & I/O)**, **Blind Reviewer**, **Tester**.

**Orchestrator to User:**
> "I have analyzed your request for `table-wright`. Because this involves table parsing, alignment formatting, column sorting, CLI argument parsing, and test coverage, I will orchestrate a **Medium Preset** crew:
> - Roles: Planner, Designer, 2 Coders (Core Engine, CLI Interface), 1 Blind Reviewer, 1 Tester.
> - Execution: 2 build waves, blind correctness review, evidence-gated testing.
> - Estimated cost: ~$0.60–$0.90 across 6 specialist agent invocations.
>
> Operational assumption: We will use native Node.js (Node 20+) with TypeScript/ESM and standard testing (`node:test`).
> Proceeding with workspace initialization in `.crew/`."

### `.crew/state.json` (At Triage)
```json
{
  "version": "1.0",
  "task_name": "table-wright",
  "preset": "medium",
  "phase": "triage",
  "active_wave": 0,
  "round_count": 0,
  "tasks": {},
  "reports": {
    "contract": ".crew/contract.md",
    "plan": ".crew/plan.json",
    "review": ".crew/review.md",
    "test": ".crew/test-report.md"
  }
}
```

---

## 2. Phase 1: Planning

The orchestrator spawns the **Planner** sub-agent. The planner inspects the repository layout and returns `.crew/plan.json`.

### `.crew/plan.json`
```json
{
  "project": "table-wright",
  "preset": "medium",
  "waves": [
    {
      "wave": 1,
      "tasks": [
        {
          "id": "TASK-01",
          "title": "Core Table AST, Parser, and Sorter",
          "owner_role": "coder",
          "depends_on": [],
          "files_owned": [
            "src/types.ts",
            "src/parser.ts",
            "src/sorter.ts"
          ],
          "acceptance_check": "node --test tests/parser.test.js"
        },
        {
          "id": "TASK-02",
          "title": "Alignment and Padding Formatter",
          "owner_role": "coder",
          "depends_on": [],
          "files_owned": [
            "src/formatter.ts"
          ],
          "acceptance_check": "node --test tests/formatter.test.js"
        }
      ]
    },
    {
      "wave": 2,
      "tasks": [
        {
          "id": "TASK-03",
          "title": "CLI Entrypoint, Arguments, and Stdin Pipeline",
          "owner_role": "coder",
          "depends_on": ["TASK-01", "TASK-02"],
          "files_owned": [
            "src/cli.ts",
            "bin/table-wright.js"
          ],
          "acceptance_check": "node bin/table-wright.js --help"
        }
      ]
    }
  ]
}
```

### Plan Validation
The orchestrator checks:
1. `files_owned` disjointness: `src/types.ts`, `src/parser.ts`, `src/sorter.ts` vs `src/formatter.ts` (Disjoint: PASS).
2. Acyclic graph: TASK-03 depends on TASK-01 and TASK-02 (Acyclic: PASS).
3. Actionable checks: Specific `node --test` and `--help` checks defined (PASS).

---

## 3. Phase 2: Interface Contract

The **Designer** drafts shared interfaces and constraints into `.crew/contract.md`.

### `.crew/contract.md`
```markdown
# Crew Contract: table-wright

## 1. High-Level Objective & Done-Criteria
Deliver a standalone CLI tool that takes unaligned Markdown tables or CSV and formats them into clean, padded Markdown tables with optional column sorting and custom alignment (`left`, `center`, `right`).

Done-Criteria:
1. Correctly formats uneven column spacing and pipes.
2. Supports `--sort <column_name_or_index>` (ascending/descending).
3. Supports `--align <col:alignment,...>`.
4. Reads from both file path argument and stdin stream.
5. All automated unit and CLI integration tests pass.

## 2. Shared Interfaces & Data Models

### Types (`src/types.ts`)
```typescript
export type ColumnAlignment = 'left' | 'center' | 'right';

export interface TableColumn {
  name: string;
  alignment: ColumnAlignment;
  width: number;
}

export interface TableData {
  headers: string[];
  alignments: ColumnAlignment[];
  rows: string[][];
}

export interface FormatOptions {
  sortColumn?: string | number;
  sortDirection?: 'asc' | 'desc';
  customAlignments?: Record<number, ColumnAlignment>;
}
```

### Core Engine Signatures
- `parseMarkdownTable(rawText: string): TableData`
- `sortTable(table: TableData, column: string | number, direction: 'asc' | 'desc'): TableData`
- `formatMarkdownTable(table: TableData, options?: FormatOptions): string`

## 3. Constraints
- Zero external runtime dependencies; use native Node.js 20+ modules (`util.parseArgs`, `readline`, `stream`).
- Handle multi-byte characters and ANSI escapes gracefully during width calculation.

## 4. Acceptance Criteria
- AC-1: `parseMarkdownTable` parses 3x3 table with trailing/leading pipes.
- AC-2: `formatMarkdownTable` creates aligned hyphens and colons (`:---`, `:---:`, `---:`).
- AC-3: CLI reads from stdin pipeline: `cat table.md | table-wright`.

## 5. Orchestrator Decisions & Rulings Log
- Ruling #1: If header row lacks alignment indicators, default all columns to `left`.
- Ruling #2: CLI should exit with code 0 on success and code 1 on malformed table input with an informative stderr message.

## 6. File Ownership Map
- `TASK-01`: `src/types.ts`, `src/parser.ts`, `src/sorter.ts`
- `TASK-02`: `src/formatter.ts`
- `TASK-03`: `src/cli.ts`, `bin/table-wright.js`
- `TASK-TEST`: `tests/*.test.js`
```

---

## 4. Phase 3: Wave-Based Build

### Wave 1
The orchestrator launches **Coder 1** (TASK-01) and **Coder 2** (TASK-02) concurrently in a single turn.

- **Coder 1 Brief**: Focused on `src/types.ts`, `src/parser.ts`, and `src/sorter.ts`.
- **Coder 2 Brief**: Focused on `src/formatter.ts`.

Both coders read `.crew/contract.md` by path.
Upon completion, the orchestrator verifies:
- Files exist and compile cleanly.
- `TASK-01` and `TASK-02` status updated to `completed` in `.crew/state.json`.

### Wave 2
The orchestrator launches **Coder 3** (TASK-03) for CLI and stream handling.
- Implements `src/cli.ts` and executable `bin/table-wright.js`.
- Verifies `node bin/table-wright.js --help` outputs help flags.

---

## 5. Phase 4: Blind Review

The orchestrator invokes the **Blind Reviewer**. The reviewer receives `.crew/contract.md` and the git diff of `src/` and `bin/`. The reviewer does NOT receive coder summaries.

### `.crew/review.md`
```markdown
# Blind Code Review Report

## Summary
- MUST-FIX: 1
- SHOULD-FIX: 1
- NIT: 1

## Findings

### 1. MUST-FIX: CLI hangs when stdin is empty TTY [verified]
- Location: `src/cli.ts:42`
- Problem: The stdin reader awaits data from `process.stdin` without checking `process.stdin.isTTY`. Running `table-wright` without arguments or piped input causes the process to hang indefinitely.
- Suggested Fix: Check `if (process.stdin.isTTY && !filePath) { showHelpAndExit(1); }`.

### 2. SHOULD-FIX: Numeric column sort uses lexicographical ordering [verified]
- Location: `src/sorter.ts:28`
- Problem: Values like `["10", "2", "1"]` sort as `1, 10, 2` because values are compared strictly as strings.
- Suggested Fix: Attempt numeric parse (`Number(val)`) when both cell values are numeric before falling back to string comparison.

### 3. NIT: Redundant regex compilation inside loop [single-source]
- Location: `src/parser.ts:18`
- Problem: Pipe splitter regex is instantiated on every row.
- Suggested Fix: Move regex to module scope.
```

---

## 6. Phase 5 & 6: Testing & Fix Loop

### Fix Loop Round 1
The orchestrator triages findings:
- Item 1 (`MUST-FIX`) sent to Coder 3 (`src/cli.ts`).
- Item 2 (`SHOULD-FIX`) sent to Coder 1 (`src/sorter.ts`).
- Item 3 (`NIT`) deferred.

Coders apply targeted fixes.

### Phase 5: Evidence-Gated Testing
The **Tester** creates tests in `tests/` and executes the suite.

### `.crew/test-report.md`
```markdown
# Test Execution Report

## Environment & Commands
- Node Version: `v26.13.0`
- Command: `node --test tests/table.test.js`

## Raw Terminal Output
```
✔ parseMarkdownTable parses basic table (2.12ms)
✔ parseMarkdownTable handles missing outer pipes (1.05ms)
✔ sortTable sorts alphabetically (0.84ms)
✔ sortTable sorts numbers numerically (0.91ms)
✔ formatMarkdownTable aligns left, center, right correctly (1.76ms)
✔ CLI displays help on empty TTY input (45.12ms)
✔ CLI reads piped stdin stream (52.30ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 112.45
```

## Exit Code
`0` (PASS)
```

### Orchestrator Independent Check
The orchestrator executes the test command independently in its terminal:
```bash
node --test tests/table.test.js
```
The command terminates with exit code 0 and identical test counts. Verified.

---

## 7. Phase 7: Gate & Delivery

### Release Checklist
- [x] All tasks in `.crew/plan.json` completed.
- [x] Shared interfaces in `.crew/contract.md` honored.
- [x] All 7 automated tests passing with real terminal output verified.
- [x] Zero open MUST-FIX review findings.
- [x] CLI entrypoint executable and documentation ready.

### Final Summary to User
> **table-wright CLI is ready.**
>
> **What Was Built:**
> - Complete Markdown and CSV table parser supporting missing outer pipes and ragged rows.
> - Formatter with column padding, alignments (`:---`, `:---:`, `---:`), and numeric/lexical sorting.
> - CLI interface supporting file arguments and stdin streaming with TTY safety.
>
> **Delivered Files:**
> - `src/types.ts`: Shared data structures.
> - `src/parser.ts`: Table parsing logic.
> - `src/sorter.ts`: Numerical and alphabetical column sorter.
> - `src/formatter.ts`: Markdown alignment and padding engine.
> - `src/cli.ts` & `bin/table-wright.js`: CLI binary.
> - `tests/table.test.js`: 7 automated unit and integration tests.
> - `.crew/`: Full audit trail (contract, plan, review report, and test evidence).
>
> **Verification Proof:**
> `node --test tests/table.test.js` -> 7 tests passed, 0 failed (duration 112ms, exit code 0).
