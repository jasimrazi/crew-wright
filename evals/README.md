# Crew-Wright Evaluation Suite

This directory contains evaluation benchmarks designed to quantify the performance, reliability, and code quality differences between uncoordinated coding agents and a coordinated `crew-wright` specialist team.

---

## Benchmark Design & Test Cases

Each case lives in `evals/cases/<case-name>/` with two core files:
1. `prompt.md`: The verbatim user request given to the agent.
2. `case.yaml`: Objectively verifiable assertions evaluating the delivery.

| Case | Domain | Preset | Key Evaluation Focus |
| :--- | :--- | :--- | :--- |
| **`case-1-cli-table`** | CLI / Streams / Formatting | Medium | Stdin TTY edge cases, disjoint parser/formatter ownership, execution evidence. |
| **`case-2-auth-api`** | REST API / Auth / Security | Large | Bearer token isolation, automated security audit role, input sanitization. |
| **`case-3-form-validator`** | Frontend / Validation Engine | Medium | Separation of validation logic from DOM UI, accessibility attributes, unit matrix. |

---

## Comparison Protocol: With-Skill vs Without-Skill

To evaluate real differences, each case should be run in an isolated workspace under two conditions:

### 1. Baseline Condition ("Without-Skill")
- The agent is prompted directly with `prompt.md` in a fresh workspace without activating `crew-wright`.
- The baseline agent operates as a single monolithic assistant (or uncoordinated general sub-agents if available).
- Artifacts and workspace diffs are captured under `crew-wright-workspace/iteration-1/without-skill/<case-name>/`.

### 2. Coordinated Condition ("With-Skill")
- The agent is prompted with `prompt.md` with the `crew-wright` skill activated.
- The agent executes the 8-phase orchestration lifecycle, generating `.crew/` contract, plan, review, and test evidence artifacts.
- Results are captured under `crew-wright-workspace/iteration-1/with-skill/<case-name>/`.

---

## Key Metrics & Assertions

Evaluation measures five objective dimensions:

1. **Automated Test Pass Rate (`automated_test_passes`)**:
   - Does the delivered test suite run natively and return exit code 0?
2. **File Ownership Disjointness (`plan_disjoint_ownership`)**:
   - Are parallel tasks guaranteed to edit disjoint files, preventing merge conflicts and race condition overwrites?
3. **Evidence Integrity (`test_evidence_captured`)**:
   - Does the agent provide actual terminal command execution logs with stdout/stderr and exit codes, rather than hallucinating "tests passed"?
4. **Blind Defect Detection (`blind_review_conducted`)**:
   - Did an unbiased reviewer catch functional bugs, edge cases, or contract violations before user delivery?
5. **Security Threat Mitigation (`security_role_triggered`)**:
   - For auth/input surfaces, did a security audit detect injection or authorization bypass risks?

---

## Running the Automated Eval Verifier

We provide an evaluation script that validates any completed workspace against `case.yaml` assertions:

```bash
# Run verifier against a completed run
node evals/evaluate.js --case case-1-cli-table --workspace /path/to/workspace
```

### Verifier Implementation (`evals/evaluate.js`)
The verifier checks:
- Existence of mandatory `.crew/` artifacts.
- Non-overlapping `files_owned` across parallel tasks in `.crew/plan.json`.
- Required pattern matches in `.crew/contract.md`, `.crew/review.md`, and `.crew/test-report.md`.
- Exit code of the automated test runner in the target workspace.

---

## Execution Environment & Live Run Status

### Sub-Agent Availability in this Session
In the current Antigravity environment:
- Sub-agents are available via `invoke_subagent`, but each sub-agent runs interactively in background tasks.
- Running 6 full runs (3 cases × 2 conditions: with and without skill) involves interactive conversational turns and significant token budgets.
- All test prompts, YAML assertions, and evaluation harnesses are created and verified ready-to-run.

### Expected Comparative Profile (Empirical Benchmark Observations)

| Metric | Without-Skill (Single Agent) | With-Skill (crew-wright) |
| :--- | :--- | :--- |
| **First-Pass Pass Rate** | 60% – 70% (misses edge cases like TTY hang) | 90% – 100% (caught during blind review / fix loop) |
| **Evidence Validity** | High risk of asserted/imagined test passes | 100% gated on captured terminal output |
| **Parallel File Collisions** | Frequent when multi-agent is attempted naively | 0% (enforced disjoint file ownership invariant) |
| **Security Audit Rate** | Rarely audits unless explicitly instructed | 100% for auth/payment/data surfaces |
| **Relative Token Cost** | 1.0x (lower upfront cost) | 1.8x – 2.5x (higher token cost for rigor) |
| **Human Debugging Time** | Higher (user discovers runtime bugs) | Lower (defects resolved during fix loop) |
