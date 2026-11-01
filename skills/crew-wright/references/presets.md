# Run Presets & Model Tiers

This reference defines the execution presets, model intelligence tiers, agent assignments, and cost/concurrency characteristics for crew runs.

---

## 1. Generic Model Intelligence Tiers

To remain vendor-agnostic and durable across different LLM backends (Anthropic, OpenAI, Google, local runners), `crew-wright` abstracts models into three tiers:

| Tier | Capability Profile | Typical Latency & Cost | Best Suited Roles |
| :--- | :--- | :--- | :--- |
| **Strong** | High reasoning depth, nuanced constraint handling, subtle bug detection, architecture judgment. | Higher cost, moderate speed | **Planner**, **Reviewer**, **Security** |
| **Standard** | Robust coding, refactoring, test generation, schema adherence, structured execution. | Moderate cost, fast speed | **Coder**, **Designer**, **Tester**, **Docs**, **Integrator** |
| **Cheap** | Fast lookups, broad search summarization, mechanical formatting, boilerplate translation. | Low cost, high throughput | **Researcher**, routine syntax checks |

### Role-to-Tier Mapping Table

| Role | Default Model Tier | Rationale |
| :--- | :--- | :--- |
| **Planner** | `Strong` | Flawed breakdowns and overlapping file ownership ruin downstream parallel work. High-tier reasoning prevents planning failures. |
| **Designer** | `Standard` | Balances system clarity, interface ergonomics, and domain modeling. |
| **Coder** | `Standard` | Follows explicit contracts and task specs effectively without over-engineering. |
| **Reviewer** | `Strong` | Needs deep adversarial evaluation to detect silent concurrency, logic, and semantic edge cases. |
| **Security** | `Strong` | Requires threat modeling intuition, taint tracking, and awareness of bypass vulnerabilities. |
| **Tester** | `Standard` | Excels at creating exhaustive test matrices and interpreting assertion outputs. |
| **Researcher** | `Cheap` | Efficient at fetching, scraping, or summarizing external documentation. |
| **Docs** | `Standard` | Clean technical writing, accurate markdown structure, and code example alignment. |
| **Integrator** | `Standard` | Merges file diffs, resolves branch collisions, and runs end-to-end integration passes. |

---

## 2. Presets Overview

| Preset | Target Scope | Active Roles | Review & Gate | Estimated Cost / Concurrency |
| :--- | :--- | :--- | :--- | :--- |
| **Small** | 1–3 files, focused bug fixes, small utility functions, single components. | Planner (inline), 1 Coder, 1 Tester | Orchestrator self-check + Tester evidence report. | Low (~$0.05–$0.20), 1–2 parallel agents max. |
| **Medium** | Multi-file features, internal refactors, standard REST APIs, UI modules. | Planner, Designer (if UI/API shape matters), Coders (by module), 1 Reviewer, 1 Tester | 1 Blind Reviewer (MUST-FIX/SHOULD-FIX) + Evidence-gated test pass. | Moderate (~$0.30–$1.20), 2–4 parallel agents. |
| **Large** | Full systems, multi-service features, security-critical flows, core architectural rewrites. | Planner, Researcher (parallel with planning), Designer, Coders (by module), Integrator, 2 Blind Reviewers (different lenses), Security, Tester, Docs | 2 Blind Reviewers + Security + Test-the-tests mutation check + Final Gating Checklist. | Higher (~$1.50–$5.00), 4–8 parallel agents across waves. |

---

## 3. Preset Specifications

### Small Preset
- **Trigger**: Tasks spanning 1 to 3 files where architecture is straightforward and risk is minimal.
- **Workflow**:
  1. The orchestrator plans inline (no separate sub-agent needed).
  2. Single Coder implements the change according to `.crew/contract.md`.
  3. Tester writes test assertions and executes them, producing `.crew/test-report.md`.
  4. Orchestrator verifies test command output and delivers result.
- **User Confirmation**: Not required upfront; launch immediately after triage statement.

### Medium Preset
- **Trigger**: New standalone modules, multi-file components, API endpoint sets, or integrations touching 3 to 10 files.
- **Workflow**:
  1. Planner generates `.crew/plan.json` with disjoint file ownership.
  2. Designer formulates schemas and signatures into `.crew/contract.md` before coding begins.
  3. Wave-based Coder execution (split by module).
  4. Single Blind Reviewer inspects code against contract without seeing coder self-reports.
  5. Tester validates AC checks and logs real execution output.
  6. Fix loop (up to 2 rounds if MUST-FIX issues arise).
- **User Confirmation**: Orchestrator must state planned roles, rough cost, and obtain user confirmation before launching.

### Large Preset
- **Trigger**: Full-stack workflows, complex multi-package codebases, authentication/payment systems, or tasks involving high security/reliability risk.
- **Workflow**:
  1. Researcher and Planner run concurrently: Researcher investigates external APIs/ecosystem tools while Planner structures tasks.
  2. Designer specifies end-to-end system and data flow in `.crew/contract.md`.
  3. Wave-based Coders implement independent modules in isolation.
  4. Integrator merges cross-module outputs and executes full-project build.
  5. Two Blind Reviewers evaluate simultaneously with distinct lenses:
     - *Reviewer 1*: Correctness, concurrency, edge cases, error recovery.
     - *Reviewer 2*: Maintainability, clean architecture, performance, API ergonomics.
  6. Security reviewer audits threat surfaces (auth, SQL/shell invocation, sanitization, data privacy).
  7. Tester executes complete test matrix.
  8. Test-the-tests verification: Tester or QA agent mutates a scratch copy with a known defect to guarantee test suite fails.
  9. Final Gating Checklist item-by-item sign-off.
- **User Confirmation**: Orchestrator must state planned roles, rough cost, and obtain user confirmation before launching.

---

## 4. Triage Cost Estimation Guidelines

When presenting the cost estimate during Triage:
- Small: `"Estimated cost: Minimal (~$0.05–$0.20), 2 sub-agent invocations."`
- Medium: `"Estimated cost: Moderate (~$0.50–$1.50), ~4–6 sub-agent invocations across 2 build waves."`
- Large: `"Estimated cost: Comprehensive (~$2.00–$6.00), ~8–14 sub-agent invocations with dual review and security passes."`
