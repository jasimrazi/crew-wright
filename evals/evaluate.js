#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const caseName = getArg('case');
const workspace = getArg('workspace') || '.';

if (!caseName) {
  console.error('Usage: node evals/evaluate.js --case <case-name> [--workspace <path>]');
  process.exit(1);
}

const caseDir = path.join('evals', 'cases', caseName);
const caseYamlPath = path.join(caseDir, 'case.yaml');

if (!fs.existsSync(caseYamlPath)) {
  console.error(`Case definition not found at: ${caseYamlPath}`);
  process.exit(1);
}

console.log(`Evaluating ${caseName} against workspace: ${workspace}`);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failed++;
  }
}

// 1. Check core files
const requiredCrewFiles = [
  '.crew/contract.md',
  '.crew/plan.json',
  '.crew/state.json',
  '.crew/review.md',
  '.crew/test-report.md'
];

for (const relPath of requiredCrewFiles) {
  const fullPath = path.join(workspace, relPath);
  assert(fs.existsSync(fullPath), `Artifact exists: ${relPath}`);
}

// 2. Check plan disjointness
const planPath = path.join(workspace, '.crew/plan.json');
if (fs.existsSync(planPath)) {
  try {
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
    let hasOverlap = false;
    const waves = plan.waves || [];
    for (const wave of waves) {
      const seenFiles = new Set();
      for (const task of (wave.tasks || [])) {
        for (const file of (task.files_owned || [])) {
          if (seenFiles.has(file)) {
            hasOverlap = true;
            console.error(`    Collision detected for file: ${file} in wave ${wave.wave}`);
          }
          seenFiles.add(file);
        }
      }
    }
    assert(!hasOverlap, 'Plan tasks within each wave have disjoint files_owned');
  } catch (err) {
    assert(false, `Valid JSON in .crew/plan.json: ${err.message}`);
  }
}

// 3. Check test report has raw output
const testReportPath = path.join(workspace, '.crew/test-report.md');
if (fs.existsSync(testReportPath)) {
  const content = fs.readFileSync(testReportPath, 'utf8');
  assert(
    content.includes('Raw Terminal Output') || content.includes('pass') || content.includes('Exit Code'),
    'Test report contains captured execution output'
  );
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
