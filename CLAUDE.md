# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

Auto-Terminal is an MCP (Model Context Protocol) server that enables LLM-driven terminal automation through intelligent command execution, output parsing, and session management.

**Core Mission:** Allow LLMs to execute commands, parse output, navigate command history, and automate terminal workflows through the MCP protocol.

---

## Architecture Patterns

### Singleton Managers
The project uses singleton patterns for core managers:

- **TerminalSessionManager**: Manages PTY sessions, handles session switching, tracks active session state
- **ConfigurationManager**: Persists user settings to `~/.auto-terminal/config.json`
- **DatabaseManager**: Handles SQLite database operations via Kysely

### Session-Aware Tool Pattern
All MCP tools follow a session-aware pattern where tools operate on the currently active terminal session, allowing concurrent management of multiple terminal sessions.

### Tool Registry System
Central `ToolRegistry` manages all MCP tools with:
- Zod schema validation for tool inputs
- Automatic JSON Schema generation for MCP compatibility via `zod-to-json-schema`
- Registration method: `ToolRegistry.registerSessionAware(name, description, schema, handler)`

---

## Project Structure

```
src/
├── index.ts              # Main entry point & transport setup
├── cli/                  # CLI command handler
├── server/               # MCP server & tool registration
├── features/             # Feature implementations organized by category
│   ├── execute/          # Command execution tools
│   ├── observe/          # Output parsing & observation tools
│   ├── navigate/         # History & navigation tools
│   └── compose/          # Command composition tools
├── models/               # Data models and types
├── utils/                # Singleton managers (TerminalSessionManager, ConfigurationManager)
├── db/                   # Database schema and migrations (Kysely)
└── types/                # TypeScript type definitions
```

---

## Critical Implementation Challenges

### 1. Output Completion Detection
**Problem:** Terminal output is streaming; determining when a command has finished is non-trivial.

**Solution Strategy (Hybrid Approach):**
- Prompt detection via regex matching shell prompts (bash, zsh, fish have different prompts)
- Timeout-based detection (wait N ms after last output)
- Exit code checking for non-interactive commands
- Custom marker injection (unique strings before/after commands)

Implementation lives in `OutputBuffer` class with `waitForCompletion()` method.

### 2. Interactive Command Support
**Problem:** Commands like `sudo`, password prompts, or confirmation dialogs require input.

**Solution:**
- PTY input injection via `node-pty`
- Timeout detection to identify when prompts appear
- Dedicated `executeInteractive` tool separate from `executeCommand`

### 3. Shell-Specific Behavior
**Problem:** Bash, zsh, fish, etc. have different prompt formats, built-ins, and behaviors.

**Solution:**
- Shell-specific adapters for prompt detection
- ConfigurationManager stores default shell preference
- Test suite validates behavior across multiple shells

### 4. ANSI Escape Sequences
**Problem:** Raw PTY output includes color codes and control sequences.

**Solution:**
- Use `strip-ansi` library for clean output
- Optionally preserve ANSI for display purposes
- `parseOutput` tool handles both modes

---

## Database Schema (Kysely + better-sqlite3)

The database uses Kysely for type-safe queries with these tables:

- **sessions**: Terminal session metadata and state
- **commands**: Command history with execution metadata (timestamp, working directory, exit code, duration)
- **outputs**: Cached command outputs (optional optimization)
- **aliases**: User-defined command shortcuts
- **markers**: Navigation markers for quick directory/state switching

Database location: `~/.auto-terminal/auto-terminal.db`

---

## MCP Tool Implementation Pattern

All tools follow this structure:

```typescript
// 1. Define Zod schema
export const toolNameSchema = z.object({
  param: z.string().describe("Parameter description"),
  optional: z.number().optional().describe("Optional parameter")
});

// 2. Implement handler
const toolNameHandler = async (
  session: TerminalSession,
  args: z.infer<typeof toolNameSchema>,
  progress?: ProgressCallback
) => {
  // Tool logic here
  return createJSONToolResponse({
    result: "data"
  });
};

// 3. Register with ToolRegistry
ToolRegistry.registerSessionAware(
  "toolName",
  "Tool description for LLM",
  toolNameSchema,
  toolNameHandler
);
```

---

## Transport Layers

The MCP server supports multiple transports (priority order):

1. **stdio** (default): Direct process communication, simplest for MCP clients
2. **SSE**: Server-Sent Events for web clients
3. **Streamable HTTP**: For multiple simultaneous clients with session support

Transport selection happens in `src/index.ts` based on runtime flags or environment variables.

---

## PTY (Pseudo-Terminal) Management

Uses `node-pty` for robust terminal emulation:

- Default terminal: `xterm-256color`
- Default size: 80 cols × 30 rows
- Inherits environment variables from parent process
- Working directory configurable per session

Each `TerminalSession` wraps a `pty.IPty` instance and manages its lifecycle.

---

## Tool Categories (6 Categories)

1. **Execution**: `executeCommand`, `executeInteractive`, `executeBackground`, `killProcess`, `sendSignal`
2. **Observation**: `observeOutput`, `parseOutput`, `waitForPattern`, `getPrompt`, `getWorkingDirectory`
3. **Navigation**: `listHistory`, `searchHistory`, `replayCommand`, `navigateDirectory`
4. **Composition**: `chainCommands`, `createAlias`, `expandAlias`
5. **Session**: `createSession`, `listSessions`, `setActiveSession`, `exportSession`, `importSession`
6. **File System**: `listFiles`, `readFile`, `writeFile`, `searchFiles`

Each category lives in its own feature directory under `src/features/`.

---

## Error Handling Pattern

Structured errors for better debugging and error handling:

```typescript
class CommandExecutionError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public stdout: string,
    public stderr: string
  ) {
    super(message);
  }
}
```

All errors should include:
- Clear error message
- Exit code (if applicable)
- Captured stdout/stderr
- Original command that failed

---

## Key Dependencies

**Runtime:**
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `node-pty` - Pseudo-terminal emulation
- `zod` + `zod-to-json-schema` - Schema validation and MCP tool definition
- `better-sqlite3` + `kysely` - Type-safe database operations

**Development:**
- `bun` - TypeScript runtime and package manager
- `mocha` + `chai` - Test framework
- `@faker-js/faker` - Test data generation

---

## Development Phases

The project is organized into 5 phases (see GitHub issues for detailed breakdown):

**Phase 1 (MVP):** Core architecture - ToolRegistry, TerminalSessionManager, ConfigurationManager, basic MCP server, basic tools
**Phase 2:** Multi-session support, database integration, output parsing, interactive commands, job management
**Phase 3:** Advanced parsing (tables/JSON/logs), command composition, session transcripts, file operations, aliases
**Phase 4:** Additional transports (SSE/HTTP), standalone CLI mode, session persistence
**Phase 5:** Intelligence features - command suggestions, error detection/recovery, workflow recording, LLM-optimized output

---

## Testing Strategy

Tests should cover:
- **Unit tests**: Individual tool handlers, managers, parsers
- **Integration tests**: Full MCP tool calls with real PTY sessions
- **Shell-specific tests**: Validate behavior across bash, zsh, fish
- **Edge cases**: Long-running commands, interactive prompts, error scenarios, ANSI handling

Use `@faker-js/faker` for generating test data (commands, outputs, session configs).

---

## Architectural Decisions

**Why Singleton Managers?**
Ensures single source of truth for session state and configuration. Prevents race conditions when multiple tools access the same session.

**Why Kysely over Prisma?**
Lighter weight, better TypeScript inference, closer to SQL for complex queries.

**Why Session-Aware Pattern?**
Allows LLMs to work with multiple terminal sessions simultaneously, similar to how developers use tmux/screen.

**Why Hybrid Output Completion Detection?**
No single approach works for all cases - long-running commands need timeouts, interactive prompts need pattern matching, clean exits need exit codes.
