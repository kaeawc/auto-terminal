#!/usr/bin/env bun

/**
 * Validation Script - Run all project validation checks
 *
 * @license Apache-2.0
 * Copyright (c) 2025 Anthropic, PBC
 */

import { spawnSync } from 'child_process';

interface ValidationStep {
  name: string;
  command: string;
  args: string[];
}

const steps: ValidationStep[] = [
  {
    name: 'Type Check',
    command: 'bun',
    args: ['run', 'typecheck'],
  },
  {
    name: 'Lint',
    command: 'bun',
    args: ['run', 'lint'],
  },
  {
    name: 'Tests',
    command: 'bun',
    args: ['test'],
  },
  {
    name: 'Build',
    command: 'bun',
    args: ['run', 'build'],
  },
];

console.log('🔍 Running Auto-Terminal validation suite...\n');

let allPassed = true;
const results: Array<{ step: string; passed: boolean; output?: string }> = [];

for (const step of steps) {
  process.stdout.write(`Running ${step.name}... `);

  const result = spawnSync(step.command, step.args, {
    encoding: 'utf-8',
    cwd: process.cwd(),
  });

  const passed = result.status === 0;
  allPassed = allPassed && passed;

  if (passed) {
    console.log('✓');
  } else {
    console.log('✗');
  }

  results.push({
    step: step.name,
    passed,
    output: passed ? undefined : result.stderr || result.stdout,
  });
}

console.log('\n' + '='.repeat(50) + '\n');

// Print summary
for (const result of results) {
  const icon = result.passed ? '✓' : '✗';
  const status = result.passed ? 'PASSED' : 'FAILED';
  console.log(`${icon} ${result.step}: ${status}`);

  if (!result.passed && result.output) {
    console.log(`\n${result.output}\n`);
  }
}

console.log('\n' + '='.repeat(50) + '\n');

if (allPassed) {
  console.log('✨ All validation checks passed! ✨\n');
  process.exit(0);
} else {
  console.log('❌ Some validation checks failed. Please fix the errors above.\n');
  process.exit(1);
}
