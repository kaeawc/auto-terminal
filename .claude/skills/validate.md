# Validate

Run all validation checks for the Auto-Terminal project.

## Description

This skill runs the complete validation suite including:
- TypeScript type checking
- ESLint code quality checks
- Test suite execution
- Production build verification

Use this before committing changes or opening pull requests.

## Usage

```
/validate
```

## What it does

1. **Type Check**: Runs `bun run typecheck` to verify TypeScript types
2. **Lint**: Runs `bun run lint` to check code quality
3. **Test**: Runs `bun test` to execute the test suite
4. **Build**: Runs `bun run build` to verify production build

If all checks pass, you'll see a success message. If any check fails, the error will be displayed.

## Expected Output

```
🔍 Running Auto-Terminal validation suite...

✓ Type check passed
✓ Lint check passed
✓ Tests passed (X tests)
✓ Build succeeded

All validation checks passed! ✨
```

---

**Auto-Terminal Project**
