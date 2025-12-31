Run the complete Auto-Terminal validation suite using one of these methods:

**Recommended**: Use the standalone validation script for formatted output:
```bash
bun scripts/validate.ts
```

**Alternative**: Use the package.json script:
```bash
bun run validate
```

The validation suite checks:
1. TypeScript type checking
2. ESLint code quality
3. Test suite execution
4. Production build

Report the results to the user, showing which checks passed or failed.
