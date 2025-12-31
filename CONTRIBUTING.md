# Contributing to Auto-Terminal

Thank you for your interest in contributing to Auto-Terminal! This document provides guidelines and information for contributors.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [License](#license)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Be respectful and considerate
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

---

## Getting Started

### Prerequisites

- **Bun**: Version 1.0.0 or higher
- **Node.js**: Version 24.0.0 or higher (for compatibility testing)
- **TypeScript**: Version 5.7.0 or higher

### Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/auto-terminal.git
   cd auto-terminal
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run tests to verify setup:
   ```bash
   bun test
   ```

4. Start development mode:
   ```bash
   bun run dev
   ```

---

## Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions or improvements

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or improvements
- `chore`: Build process or tooling changes

**Examples:**
```
feat(execute): add interactive command support

Implement executeInteractive tool for handling commands that require
user input like sudo or password prompts.

Closes #42
```

```
fix(observe): correct prompt detection for zsh

Fixed regex pattern to properly match zsh prompts with custom themes.
```

---

## Project Structure

```
src/
├── index.ts              # Main entry point
├── cli/                  # CLI command handler
├── server/               # MCP server implementation
├── features/             # Feature implementations by category
│   ├── execute/          # Command execution tools
│   ├── observe/          # Output parsing & observation
│   ├── navigate/         # History & navigation
│   ├── compose/          # Command composition
│   ├── session/          # Session management
│   └── filesystem/       # File operations
├── models/               # Data models
├── utils/                # Singleton managers
├── db/                   # Database schema (Kysely)
└── types/                # TypeScript types
```

See [CLAUDE.md](./CLAUDE.md) for detailed architectural documentation.

---

## Coding Standards

### TypeScript

- **Strict mode**: All code must pass TypeScript strict mode checks
- **Explicit types**: Use explicit return types for functions
- **No `any`**: Avoid using `any` type; use `unknown` or proper types
- **Null safety**: Use optional chaining and nullish coalescing

### ESLint

All code must pass ESLint checks:

```bash
bun run lint
```

Auto-fix issues where possible:

```bash
bun run lint:fix
```

### Code Style

- **2 spaces** for indentation
- **Single quotes** for strings (except when avoiding escapes)
- **Semicolons** required
- **Trailing commas** in multiline constructs
- **Arrow functions** preferred over `function` keyword

### Documentation

- Add JSDoc comments for:
  - Public APIs
  - Complex functions
  - Type definitions
- Include parameter descriptions and return types
- Add examples where helpful

**Example:**
```typescript
/**
 * Executes a command in the active terminal session.
 *
 * @param command - The command to execute
 * @param options - Execution options
 * @returns Promise resolving to command output
 *
 * @example
 * ```typescript
 * const result = await executeCommand('ls -la', { timeout: 5000 });
 * console.log(result.stdout);
 * ```
 */
export async function executeCommand(
  command: string,
  options?: ExecuteOptions
): Promise<CommandResult> {
  // Implementation
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run type checking
bun run typecheck
```

### Writing Tests

- Place tests in `test/` directory mirroring `src/` structure
- Use descriptive test names
- Test edge cases and error conditions
- Use `@faker-js/faker` for test data generation

**Example:**
```typescript
import { describe, it, expect } from 'bun:test';
import { executeCommand } from '@/features/execute';

describe('executeCommand', () => {
  it('should execute simple commands', async () => {
    const result = await executeCommand('echo "hello"');
    expect(result.stdout).toBe('hello\n');
    expect(result.exitCode).toBe(0);
  });

  it('should handle command failures', async () => {
    const result = await executeCommand('exit 1');
    expect(result.exitCode).toBe(1);
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- All new features must include tests
- Bug fixes should include regression tests

---

## Submitting Changes

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following coding standards
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run validation checks**:
   ```bash
   # Recommended: Run all checks with formatted output
   bun scripts/validate.ts

   # Or use the package script
   bun run validate
   ```
   See [docs/VALIDATION.md](./docs/VALIDATION.md) for more details.
6. **Commit changes** using conventional commits
7. **Push to your fork**
8. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/examples if applicable

### PR Review Checklist

Before submitting, ensure:

- [ ] Code passes all tests
- [ ] Code passes ESLint and type checking
- [ ] New features include tests
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts with `main`
- [ ] Changes are focused and atomic

### CI/CD

All PRs must pass automated checks (run with `bun run validate`):
- TypeScript compilation (`typecheck`)
- ESLint (`lint`)
- Unit tests (`test`)
- Production build (`build`)
- Integration tests (if applicable)

---

## Development Phases

The project is organized into 5 phases. See GitHub issues for current phase and tasks:

- **Phase 1**: Core architecture and MVP
- **Phase 2**: Multi-session support and database
- **Phase 3**: Advanced parsing and composition
- **Phase 4**: Additional transports and CLI
- **Phase 5**: Intelligence features

When contributing, check the current phase and coordinate with maintainers to avoid conflicts.

---

## License

By contributing to Auto-Terminal, you agree that your contributions will be licensed under the Apache License 2.0.

All source files must include the Apache 2.0 license header:

```typescript
/**
 * [File description]
 *
 * @license Apache-2.0
 * Copyright (c) 2025 Anthropic, PBC
 */
```

See [LICENSE](./LICENSE) for the full license text.

---

## Questions?

- Open an issue for bug reports or feature requests
- Check existing issues before creating new ones
- For major changes, open an issue first to discuss

Thank you for contributing to Auto-Terminal!
