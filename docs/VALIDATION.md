# Validation Guide

This document describes how to validate the Auto-Terminal codebase before committing changes.

---

## Quick Validation

### Using npm/bun script

```bash
bun run validate
```

This runs all validation checks in sequence (typecheck, lint, test, build).

### Using the standalone script

```bash
bun scripts/validate.ts
```

This provides a more user-friendly output with progress indicators and a summary.

---

## Individual Checks

You can also run individual validation steps:

### Type Checking

Verifies TypeScript types without emitting files:

```bash
bun run typecheck
```

### Linting

Checks code quality with ESLint:

```bash
bun run lint
```

Auto-fix issues:

```bash
bun run lint:fix
```

### Testing

Runs the test suite:

```bash
bun test
```

Watch mode for development:

```bash
bun test:watch
```

### Build

Creates a production build:

```bash
bun run build
```

---

## CI/CD Integration

The validation script is designed for use in CI/CD pipelines. It:

- Returns exit code 0 on success
- Returns exit code 1 on failure
- Prints detailed error output for failed checks

Example GitHub Actions workflow:

```yaml
- name: Validate
  run: bun scripts/validate.ts
```

---

## Pre-commit Validation

It's recommended to run validation before committing:

```bash
# Quick check
bun run validate

# Or with detailed output
bun scripts/validate.ts
```

Consider setting up a git pre-commit hook:

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running validation checks..."
bun run validate

if [ $? -ne 0 ]; then
  echo "Validation failed. Commit aborted."
  exit 1
fi
```

---

## Claude Code Integration

When using Claude Code, you can ask it to run validation:

```
Can you run the validation checks?
```

or

```
Please validate the codebase before we commit
```

Claude will execute the validation script and report the results.

---

## What Gets Validated

| Check | Tool | Purpose |
|-------|------|---------|
| **Type Check** | TypeScript Compiler | Ensures type safety |
| **Lint** | ESLint | Enforces code quality rules |
| **Test** | Bun Test | Verifies functionality |
| **Build** | Bun Build | Confirms production readiness |

---

## Troubleshooting

### Type Check Failures

- Check for `any` types (not allowed in strict mode)
- Verify all function return types are explicit
- Ensure no unused variables or parameters

### Lint Failures

- Run `bun run lint:fix` to auto-fix simple issues
- Check ESLint errors in the output
- Review `eslint.config.js` for rule details

### Test Failures

- Review test output for specific failures
- Run individual test files: `bun test test/specific.test.ts`
- Use `--bail` to stop on first failure: `bun test --bail`

### Build Failures

- Check for syntax errors
- Verify all imports are correct
- Ensure `src/index.ts` exists and is valid

---

## Expected Output

### Standalone Script (`bun scripts/validate.ts`)

```
🔍 Running Auto-Terminal validation suite...

Running Type Check... ✓
Running Lint... ✓
Running Tests... ✓
Running Build... ✓

==================================================

✓ Type Check: PASSED
✓ Lint: PASSED
✓ Tests: PASSED
✓ Build: PASSED

==================================================

✨ All validation checks passed! ✨
```

### Package Script (`bun run validate`)

```
$ tsc --noEmit
$ eslint src --ext .ts

 3 pass
 0 fail
 8 expect() calls
Ran 3 tests across 1 file. [5.00ms]

Bundled 1 module in 1ms
  index.js  71 bytes  (entry point)
```

---

## Adding Custom Checks

To add custom validation steps:

1. Add the command to `scripts/validate.ts`:

```typescript
const steps: ValidationStep[] = [
  // ... existing steps
  {
    name: 'Custom Check',
    command: 'bun',
    args: ['run', 'custom-check'],
  },
];
```

2. Add the corresponding npm script to `package.json`:

```json
{
  "scripts": {
    "custom-check": "your-command-here"
  }
}
```

3. Update the `validate` script to include the new check.

---

**Auto-Terminal Project**
