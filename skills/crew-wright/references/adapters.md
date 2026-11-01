# Environment & Tooling Adapters

`crew-wright` is designed to be environment-agnostic. While `SKILL.md` uses generic orchestration terms like *spawn a sub-agent*, *run parallel tasks*, and *track progress*, this reference maps those operations onto specific agent platforms and single-session fallbacks.

---

## 1. Claude Code Adapter

Claude Code provides built-in sub-agent invocation via the `Agent` tool and task list tracking.

| Generic Orchestrator Action | Claude Code Tool / Construct | Invocation Example / Notes |
| :--- | :--- | :--- |
| **Spawn Sub-Agent** | `Agent(prompt, subagent_type)` | Launch sub-agent with defined role brief. |
| **Model Intelligence Tier** | `model` parameter / agent type | `strong` -> Default Opus / 3.7 Sonnet<br>`standard` -> Sonnet<br>`cheap` -> Haiku |
| **Parallel Wave Execution** | Concurrent tool calls in a single turn | Emit multiple `Agent(...)` tool calls in one model turn to run in parallel. |
| **Task Tracking** | `Todo` tool (`Todo.create`, `Todo.update`) | Reflect `.crew/plan.json` tasks into the interactive task list. |
| **Read-Only Enforcement** | Brief prompt instruction + read-only tools | Strip file modification permissions or instruct agent strictly in prompt. |

### Concurrency in Claude Code
When launching wave tasks:
```json
[
  {"name": "Agent", "arguments": {"prompt": "[Coder Task 1 Brief]", "subagent_type": "general"}},
  {"name": "Agent", "arguments": {"prompt": "[Coder Task 2 Brief]", "subagent_type": "general"}}
]
```

---

## 2. Google Antigravity / Gemini CLI Adapter

Google Antigravity provides `invoke_subagent` and background task runners.

| Generic Orchestrator Action | Antigravity Tool / Construct | Notes |
| :--- | :--- | :--- |
| **Spawn Sub-Agent** | `invoke_subagent(Role, Prompt, Model, TypeName)` | Uses configured sub-agent types (e.g. `inherit`, `pro`, `flash`). |
| **Model Intelligence Tier** | `Model` parameter | `strong` -> `pro`<br>`standard` -> `inherit`<br>`cheap` -> `flash` / `flash_lite` |
| **Parallel Wave Execution** | Multiple `invoke_subagent` calls | Handled asynchronously via reactive wakeups on completion. |
| **Task Tracking** | Artifacts or local task lists | Write `.crew/plan.json` and optionally sync to task artifact. |

---

## 3. OpenAI Codex / Swarm / Custom Agent Harnesses

For custom Python or TypeScript agent harnesses (e.g. OpenAI Swarm, AutoGen, CrewAI runtimes, LangGraph):

| Generic Orchestrator Action | Implementation Pattern |
| :--- | :--- |
| **Spawn Sub-Agent** | Spawn a worker process or thread with a fresh conversation session context. |
| **Model Intelligence Tier** | `strong` -> `o3-mini-high` / `gpt-4.5`<br>`standard` -> `gpt-4o`<br>`cheap` -> `gpt-4o-mini` |
| **Parallel Wave Execution** | `asyncio.gather(*[run_agent(brief) for brief in wave_briefs])` |
| **Handoff Artifacts** | Shared filesystem directory `.crew/` for input/output files. |

---

## 4. Sequential Single-Session Fallback (No Sub-Agent Support)

If your environment does NOT support sub-agent spawning (e.g., standard single-thread chat CLI, basic IDE prompt, or isolated terminal):

The orchestrator executes the exact same phases sequentially in the single conversation, adopting distinct role identities one at a time and maintaining the identical `.crew/` directory artifacts.

### Sequential Workflow:
1. **Orchestrator Turn**: Triage, choose preset, initialize `.crew/state.json`.
2. **Planner Turn**: Orchestrator assumes the Planner role, generates `.crew/plan.json`.
3. **Designer Turn**: Orchestrator assumes Designer role, populates `.crew/contract.md`.
4. **Coder Turns**: For each task in Wave 1, then Wave 2:
   - Announce role: `[Active Role: Coder Task 1]`
   - Read `.crew/contract.md`
   - Edit only assigned `files_owned`
   - Record output
5. **Review Turn**:
   - Announce role: `[Active Role: Blind Reviewer]`
   - Read `.crew/contract.md` and git diff (do NOT re-read previous reasoning)
   - Write `.crew/review.md`
6. **Test Turn**:
   - Announce role: `[Active Role: Tester]`
   - Write tests, run commands in shell, capture output into `.crew/test-report.md`.
7. **Gate Turn**: Orchestrator verifies criteria and delivers final summary.

This guarantees consistent quality and artifacts even on basic single-agent runners.
