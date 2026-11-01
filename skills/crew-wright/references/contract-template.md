# Crew Contract

> **Role & Purpose**: This contract is the single source of truth for all specialist sub-agents participating in this crew run. Specialist agents start with a clean context window; this document provides shared ground truths, interface definitions, architectural boundaries, and binding decisions.

---

## 1. High-Level Objective & Done-Criteria

- **Task Name**: `[Project / Task Name]`
- **Goal Statement**: `[One-sentence unambiguous declaration of the desired end state]`
- **Preset**: `[small | medium | large]`
- **Done-Criteria**:
  1. `[Concrete, observable completion condition 1]`
  2. `[Concrete, observable completion condition 2]`
  3. `[All automated tests passing with real execution logs captured in .crew/test-report.md]`
  4. `[Zero unresolved MUST-FIX review items]`

---

## 2. Shared Interfaces & Data Models

Specialist coders must adhere strictly to the signatures, schemas, and data structures specified below to avoid cross-module integration failures.

### Types & Data Shapes
```typescript
// Define shared data models, schema interfaces, or DTOs
export interface ModelConfig {
  id: string;
  name: string;
  enabled: boolean;
}
```

### Signatures & Endpoints / Functions
```typescript
// Define function contracts, endpoints, or CLI signatures
// e.g. function processData(input: InputModel): Promise<OutputModel>;
// e.g. POST /api/v1/resource -> { status: 201, data: ... }
```

---

## 3. Architectural Constraints & Boundaries

- **Language / Runtime**: `[e.g. Node.js 22+, Python 3.12+, Go 1.22+]`
- **Permitted Dependencies**: `[Explicitly allowed libraries or 'standard library only']`
- **Forbidden Dependencies / Practices**: `[e.g. No external HTTP frameworks, no mutable global state]`
- **Error Handling Protocol**: `[e.g. Return Result<T, E> types or throw structured ApplicationError]`
- **Testing Framework**: `[e.g. native node:test, pytest, jest]`

---

## 4. Acceptance Criteria & Verification Checks

| ID | Feature / Component | Verification Command / Check | Expected Behavior |
| :--- | :--- | :--- | :--- |
| AC-1 | `[Component A]` | `[e.g. npm test -- -t "auth"]` | `[Passes with exit code 0]` |
| AC-2 | `[Component B]` | `[e.g. node dist/cli.js --help]` | `[Outputs flags and usage correctly]` |
| AC-3 | `[Security / Edge]`| `[e.g. curl -i localhost:3000/unauthed]` | `[Returns 401 Unauthorized]` |

---

## 5. Orchestrator Decisions & Rulings Log

When interfaces, constraints, or designs must change mid-flight, the orchestrator updates this log with a numbered ruling. Agents must consult this log for any prevailing override.

- **Ruling #1**: `[Date/Time] - [Context and final orchestrator decision on an interface or ambiguity]`
- **Ruling #2**: `[Date/Time] - [Additional ruling or interface change]`

---

## 6. File & Module Ownership Map

No two parallel tasks may own the same file. Agents must touch only files assigned to their task.

| File / Directory Path | Owning Task ID | Owning Role | Notes |
| :--- | :--- | :--- | :--- |
| `src/core/` | `TASK-01` | Coder (Core) | Core engine logic |
| `src/api/` | `TASK-02` | Coder (API) | API routes and handlers |
| `tests/` | `TASK-04` | Tester | Unit and integration test suite |
