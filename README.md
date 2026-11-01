# crew-wright: a multi-agent crew for your coding agent

`crew-wright` is an open-source agent skill that orchestrates a coordinated team of specialist sub-agents to deliver non-trivial software engineering tasks from start to finish. Instead of relying on a single context window to juggle architecture, implementation, critique, and testing all at once, `crew-wright` decomposes the goal into bounded task waves, assigns specialized roles (planners, designers, modular coders, blind reviewers, testers, security auditors), coordinates shared interfaces via a binding contract, and enforces evidence-based verification before anything is marked done.

> **Why the name?** A *wright* is a builder or craftsman—like a playwright who crafts plays or a shipwright who builds vessels. `crew-wright` builds and runs an expert crew tailored specifically to your software task.
>
> **Independence Notice**: `crew-wright` is an independent, open-source project. It is not affiliated with, sponsored by, or associated with CrewAI Inc. or any other commercial "crew" framework.

---

## Quick Start & Installation

Install `crew-wright` into your coding agent environment using the Vercel Skills CLI (`skills`). It automatically discovers the skill definition from GitHub or your local path:

```bash
# Install to your current project repository
npx skills add <YOUR-GITHUB-USER>/crew-wright

# Install globally for all project workspaces (-g)
npx skills add <YOUR-GITHUB-USER>/crew-wright -g

# Install only the crew-wright skill if part of a multi-skill repository
npx skills add <YOUR-GITHUB-USER>/crew-wright@crew-wright

# Test / install locally from source
npx skills add ./skills/crew-wright
```

Supported coding agents include **Claude Code**, **Google Antigravity**, **Codex**, **OpenCode**, and any environment compatible with the agent skills specification.

---

## How to Trigger

The skill is designed to activate automatically when a task requires coordination, planning, and multi-pass rigor. You can trigger it naturally with prompts such as:

1. *"Assemble a crew of specialist agents to build a high-performance Markdown table formatter CLI in TypeScript with full test coverage."*
2. *"Run a multi-agent team to implement token-based authentication and rate limiting for our Express REST API. Do a blind review and security audit before declaring done."*
3. *"Plan, build, review, and test a responsive customer checkout form with client-side validation using parallel sub-agents."*

*(For quick one-line bug fixes or single-file changes, the skill deliberately steps aside to avoid unnecessary agent coordination overhead.)*

---

## Lifecycle Phase Diagram

`crew-wright` moves through 8 well-defined phases to ensure quality and prevent parallel work collisions:

```text
+-------------------------------------------------------------------------+
| Phase 0: Triage                                                         |
| - Clarify goal (max 1 question) & pick preset (small / medium / large)  |
| - Scan for custom roles in .crew/roles/ & check resumable state         |
| - Present planned roles & cost estimate; obtain user confirmation       |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Phase 1: Plan & Research                                                |
| - Spawn Planner (and parallel Researcher if libraries are unfamiliar)   |
| - Produce .crew/plan.json with disjoint file ownership across tasks     |
| - Validate: zero shared files in same wave, no cycles, actionable AC    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Phase 2: Interface Contract                                             |
| - Populate .crew/contract.md (shared interfaces, schemas, rulings)     |
| - Numbered rulings log resolves ambiguities; all sub-agents read this   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Phase 3: Wave-Based Build                                               |
| - Group tasks into dependency waves; launch wave agents in parallel     |
| - Enforce strict 5-part brief with file boundaries (files_owned)        |
| - Verify outputs (files exist, code compiles) after each wave           |
| - Integrator wires modules in large builds                              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Phase 4: Blind Review                                                   |
| - Reviewer inspects diff & contract WITHOUT coder self-summaries       |
| - Large preset: 2 reviewers with different lenses (correctness vs arch) |
| - Security Auditor inspects auth, payments, shell/SQL, and inputs      |
| - Findings tagged MUST-FIX / SHOULD-FIX / NIT with file coordinates     |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Phase 5: Evidence-Gated Testing                                         |
| - Tester writes & executes tests; logs raw output to test-report.md     |
| - "Done" requires real command output and exit code 0                   |
| - Orchestrator re-runs test command independently to verify evidence   |
| - Large preset: test-the-tests mutation check (proves tests catch bugs) |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Phase 6: Fix Loop (Capped at 2 Rounds)                                  |
| - Triage MUST-FIX issues to responsible coders by file ownership        |
| - Re-test; stop and report if issues persist after 2 rounds            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| Phase 7: Gate & Delivery                                                |
| - Release checklist sign-off: AC met, tests green, zero open MUST-FIX   |
| - One clean merged delivery summary with test proof; no agent log dumps |
+-------------------------------------------------------------------------+
```

---

## Presets & Cost Expectations

`crew-wright` abstracts models into three generic intelligence tiers: **Strong** (high reasoning for planning, blind review, security), **Standard** (efficient coding, interface design, testing), and **Cheap** (high-throughput external research).

| Preset | Target Scope | Active Specialist Roles | Expected Cost & Concurrency |
| :--- | :--- | :--- | :--- |
| **Small** | 1–3 files, focused components, localized utilities | Planner (inline), 1 Coder, 1 Tester | Minimal (~$0.05–$0.20), 1–2 sequential/parallel calls |
| **Medium** | 3–10 files, standalone features, standard REST APIs | Planner, Designer, Coders (by module), 1 Reviewer, 1 Tester | Moderate (~$0.50–$1.50), 2–4 parallel agents in waves |
| **Large** | Full systems, multi-module apps, auth/security surfaces | Planner, Researcher, Designer, Coders (by module), Integrator, 2 Blind Reviewers, Security, Tester, Docs | Comprehensive (~$2.00–$6.00), 4–8 parallel agents across waves |

*For Medium and Large presets, the orchestrator always tells you the planned roles and estimated cost, requesting your confirmation before spawning sub-agents.*

---

## Custom Roles (`.crew/roles/`)

Need a specialized Database Administrator, Performance Benchmarker, or Compliance Auditor? You can override standard roles or introduce brand-new specialists by adding markdown files to `.crew/roles/`:

```text
my-project/
└── .crew/
    └── roles/
        ├── reviewer.md       # Overrides the default blind reviewer
        └── dba.md            # Adds a custom DBA role
```

Each role brief template should define:
1. **Objective**: Exactly one primary goal.
2. **Context**: Paths to `.crew/contract.md` and relevant code (avoid pasting raw file contents).
3. **Boundaries**: Explicit whitelist of `files_owned`.
4. **Output Contract**: Capped at ~200 words plus modified file paths.
5. **Honesty Clause**: Mandate to report unverified assumptions and failures.

The orchestrator automatically scans `.crew/roles/` during Phase 0 (Triage).

---

## Resumable State

All coordination metadata is preserved in `.crew/state.json`. If your terminal disconnects, a background job times out, or you pause a run, `crew-wright` detects the existing state upon relaunch and offers to resume from the active wave without repeating completed work.

---

## Comparison with Similar Approaches

| Dimension | Monolithic Agent | Swarms / AutoGen | Static Workflow Skills | `crew-wright` |
| :--- | :--- | :--- | :--- | :--- |
| **Context Window** | Monolithic (polluted by chatter & code churn) | Separate agents with high conversational chatter | Single context following fixed linear steps | Clean, isolated contexts per specialist brief |
| **File Ownership** | Ad-hoc (overwrites self) | Common collisions when working simultaneously | Single sequential author | Enforced disjoint ownership across parallel tasks |
| **Code Review** | Self-review (blind to own mistakes) | Peer chat (often sycophantic approval) | Post-hoc self-check | True blind review without author self-summaries |
| **Verification Gate** | Asserts "tests passed" (often unexecuted) | Loose finish condition based on chat sentiment | Checklist based | Evidence-gated: requires real terminal stdout & exit 0 |
| **Failure Recovery** | Ad-hoc apologetic patching | Potential infinite conversational ping-pong | Limited | Capped 2-round fix loop; reports blockers if stuck |

---

## Evaluation & Benchmarks

The `evals/` directory contains 3 realistic evaluation suites:
- `evals/cases/case-1-cli-table/`: CLI tool parsing stdin/files with alignment and sorting.
- `evals/cases/case-2-auth-api/`: REST API with Bearer token authentication and payload validation.
- `evals/cases/case-3-form-validator/`: Interactive form with decoupled validation logic and accessible DOM state.

### Automated Verifier
Verify any workspace against objective YAML assertions using our evaluation harness:
```bash
node evals/evaluate.js --case case-1-cli-table --workspace /path/to/workspace
```

---

## Limitations

- **Sub-Agent Dependency**: For maximum speed, `crew-wright` relies on environments supporting concurrent sub-agents (e.g., Claude Code, Google Antigravity). In single-agent environments, it falls back to sequential role switching (see [references/adapters.md](skills/crew-wright/references/adapters.md)).
- **Token Investment**: Running modular planning, blind review, security auditing, and test generation uses roughly 1.8x–2.5x more tokens than a single unverified prompt. It is designed for tasks where correctness matters more than token frugality.
- **Environment Tooling**: Automated verification requires an executable test environment (e.g., `node`, `python`, `cargo`) on the host system to capture genuine exit codes.

---

## Repository Structure

```text
crew-wright/
├── README.md                      # Documentation and quick start
├── LICENSE                        # MIT License (2026)
├── skills/
│   └── crew-wright/
│       ├── SKILL.md               # Main orchestrator (under 500 lines)
│       └── references/
│           ├── roles.md           # Full brief templates for all 9 roles
│           ├── contract-template.md # Template for shared contract
│           ├── presets.md         # Small / Medium / Large presets & tiers
│           └── adapters.md        # Concrete mappings for agent harnesses
├── evals/
│   ├── cases/                     # 3 test cases with prompt.md & case.yaml
│   │   ├── case-1-cli-table/
│   │   ├── case-2-auth-api/
│   │   └── case-3-form-validator/
│   ├── evaluate.js                # Assertion verifier script
│   └── README.md                  # Benchmark methodology
└── examples/
    └── example-run.md             # Complete walkthrough with .crew/ artifacts
```

---

## License

MIT License. Copyright (c) 2026 crew-wright contributors. See [LICENSE](LICENSE) for details.
