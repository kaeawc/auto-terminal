# Auto-Terminal: Terminal Automation via MCP

**Mission:** Enable LLM-driven terminal automation, command execution, and output navigation through the Model Context Protocol (MCP).

---

## Project Vision

Auto-Terminal provides an MCP server that allows LLMs to interact with terminal sessions, execute commands, parse output, navigate command history, and automate terminal workflows with intelligent command composition and output interpretation.

---

## Core Architecture

### 1. Tool Registry System
- Central `ToolRegistry` for all terminal automation tools
- Zod schema validation for all tool inputs
- JSON Schema auto-generation for MCP compatibility
- Device-aware pattern → **Session-aware pattern** (terminal sessions)

### 2. Transport Layer
Support multiple transport mechanisms:
- **stdio** (default) - Direct process communication
- **SSE** (Server-Sent Events) - For web clients
- **Streamable HTTP** - For multiple simultaneous clients with session support

### 3. Project Structure
```
auto-terminal/
├── src/
│   ├── index.ts              # Main entry point & transport setup
│   ├── cli/                  # CLI command handler
│   ├── server/               # MCP server & tool registration
│   ├── features/             # Feature implementations
│   │   ├── execute/          # Command execution
│   │   ├── observe/          # Output parsing & observation
│   │   ├── navigate/         # History & navigation
│   │   └── compose/          # Command composition
│   ├── models/               # Data models and types
│   ├── utils/                # Managers and utilities
│   ├── db/                   # Database (session history, command cache)
│   └── types/                # TypeScript type definitions
├── test/                     # Test suite
├── docs/                     # Documentation
└── scratch/                  # Development workspace (gitignored)
```

---

## Key Components to Build

### Session Management
**Pattern:** Singleton `TerminalSessionManager`

**Responsibilities:**
- Create and manage terminal sessions (PTY/pseudo-terminal)
- Track active session state
- Handle session switching
- Persist session history

**Key Methods:**
```typescript
class TerminalSessionManager {
  createSession(config: SessionConfig): TerminalSession
  getActiveSession(): TerminalSession | null
  setActiveSession(sessionId: string): void
  listSessions(): SessionInfo[]
  destroySession(sessionId: string): void
}
```

### Configuration Manager
**Pattern:** Singleton `ConfigurationManager`

**Storage:** `~/.auto-terminal/config.json`

**Configuration:**
- Default shell preference (bash, zsh, fish, etc.)
- Session-specific settings
- Command aliases and shortcuts
- Output parsing preferences
- History retention policy

### Tool Categories

#### 1. Execution Tools
- `executeCommand` - Run a command in active session
- `executeInteractive` - Handle interactive commands (prompts, sudo, etc.)
- `executeBackground` - Background job execution
- `killProcess` - Terminate running processes
- `sendSignal` - Send signals (SIGINT, SIGTERM, etc.)

#### 2. Observation Tools
- `observeOutput` - Get current terminal output
- `parseOutput` - Parse structured output (JSON, tables, logs)
- `waitForPattern` - Wait for specific output pattern
- `getPrompt` - Get current shell prompt
- `getWorkingDirectory` - Get current working directory

#### 3. Navigation Tools
- `listHistory` - Show command history
- `searchHistory` - Search command history
- `replayCommand` - Re-execute previous command
- `navigateDirectory` - Change directory with validation

#### 4. Composition Tools
- `chainCommands` - Compose command pipelines
- `createAlias` - Create command shortcuts
- `expandAlias` - Expand aliases for preview

#### 5. Session Tools
- `createSession` - New terminal session
- `listSessions` - Show all sessions
- `setActiveSession` - Switch active session
- `exportSession` - Export session transcript
- `importSession` - Replay session from transcript

#### 6. File System Tools
- `listFiles` - ls with structured output
- `readFile` - Read file contents
- `writeFile` - Write to file
- `searchFiles` - Find files by pattern

---

## Technical Implementation Details

### 1. PTY (Pseudo-Terminal) Management

Use `node-pty` for robust terminal emulation:
```typescript
import * as pty from 'node-pty';

class TerminalSession {
  private ptyProcess: pty.IPty;

  constructor(shell: string = 'bash') {
    this.ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env
    });
  }
}
```

### 2. Output Buffering & Parsing

**Challenge:** Determine when command output is complete

**Strategies:**
- Prompt detection (regex matching shell prompts)
- Timeout-based (wait N ms after last output)
- Exit code checking (for non-interactive commands)
- Custom markers (inject unique markers before/after commands)

**Implementation:**
```typescript
class OutputBuffer {
  private buffer: string = '';
  private lastUpdate: number = 0;

  async waitForCompletion(timeoutMs: number = 5000): Promise<string> {
    // Wait until no new output for specified duration
    // Or until prompt pattern detected
  }

  parseStructured(): ParsedOutput {
    // Detect and parse tables, JSON, YAML, etc.
  }
}
```

### 3. Command Execution Wrapper

Wrap commands with metadata for better tracking:
```typescript
interface CommandExecution {
  id: string;
  command: string;
  timestamp: number;
  workingDir: string;
  exitCode?: number;
  output: string;
  duration: number;
  metadata?: Record<string, any>;
}
```

### 4. Database Schema (Kysely)

**Tables:**
- `sessions` - Terminal sessions
- `commands` - Command history with metadata
- `outputs` - Cached command outputs
- `aliases` - Custom command aliases
- `markers` - Navigation markers

```typescript
interface Database {
  sessions: SessionTable;
  commands: CommandTable;
  outputs: OutputTable;
  aliases: AliasTable;
  markers: MarkerTable;
}
```

### 5. Error Handling

Use structured errors for better error handling:
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

---

## MCP Tool Definitions

### Example: executeCommand Tool

```typescript
export const executeCommandSchema = z.object({
  command: z.string().describe("Command to execute"),
  timeout: z.number().optional().describe("Timeout in milliseconds"),
  workingDir: z.string().optional().describe("Working directory"),
  env: z.record(z.string()).optional().describe("Environment variables"),
  waitForCompletion: z.boolean().default(true).describe("Wait for command to complete")
});

const executeCommandHandler = async (
  session: TerminalSession,
  args: z.infer<typeof executeCommandSchema>,
  progress?: ProgressCallback
) => {
  const execution = await session.execute(args.command, {
    timeout: args.timeout,
    cwd: args.workingDir,
    env: args.env,
    wait: args.waitForCompletion
  });

  return createJSONToolResponse({
    executionId: execution.id,
    exitCode: execution.exitCode,
    output: execution.output,
    duration: execution.duration
  });
};

ToolRegistry.registerSessionAware(
  "executeCommand",
  "Execute a command in the active terminal session",
  executeCommandSchema,
  executeCommandHandler
);
```

---

## Development Phases

### Phase 1: Foundation (MVP)
- [ ] Project scaffolding (TypeScript, Bun, ESLint)
- [ ] Basic MCP server with stdio transport
- [ ] TerminalSessionManager (single session support)
- [ ] ConfigurationManager with persistence
- [ ] ToolRegistry system
- [ ] Basic tools: `executeCommand`, `observeOutput`, `listSessions`

### Phase 2: Core Features
- [ ] Multi-session support
- [ ] Output parsing and pattern matching
- [ ] Command history tracking (database)
- [ ] Interactive command support (prompts, sudo)
- [ ] Background job management
- [ ] Navigation tools (history search, replay)

### Phase 3: Advanced Features
- [ ] Smart output parsing (tables, JSON, logs)
- [ ] Command composition and pipelines
- [ ] Session transcripts (export/import)
- [ ] File system operations
- [ ] Custom aliases and shortcuts
- [ ] Performance tracking

### Phase 4: Multi-Transport & CLI
- [ ] SSE transport
- [ ] Streamable HTTP transport
- [ ] Standalone CLI mode
- [ ] CLI help system
- [ ] Session persistence across restarts

### Phase 5: Intelligence & Automation
- [ ] Command suggestion based on history
- [ ] Error detection and recovery suggestions
- [ ] Workflow recording and replay
- [ ] LLM-friendly output formatting
- [ ] Context-aware command completion

---

## Dependencies

### Core Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.x",
  "zod": "^3.x",
  "zod-to-json-schema": "^3.x",
  "better-sqlite3": "^11.x",
  "kysely": "^0.27.x",
  "node-pty": "^1.x"
}
```

### Dev Dependencies
```json
{
  "@types/node": "^22.x",
  "typescript": "^5.x",
  "bun": "^1.x",
  "mocha": "^10.x",
  "chai": "^5.x",
  "@faker-js/faker": "^9.x"
}
```

---

## Unique Challenges

### 1. Output Completion Detection
**Challenge:** Terminal output is streaming and determining completion is non-trivial
**Solution:** Hybrid approach with prompt detection + timeout + custom markers

### 2. Interactive Commands
**Challenge:** Commands that require user input (sudo, interactive prompts)
**Solution:** PTY input injection + timeout detection + interaction handlers

### 3. Shell Differences
**Challenge:** Different shells (bash, zsh, fish) have different behaviors
**Solution:** Shell-specific adapters + configuration profiles

### 4. Concurrent Commands
**Challenge:** Managing multiple simultaneous commands in background
**Solution:** Job tracking table + process group management

### 5. ANSI Escape Sequences
**Challenge:** Raw terminal output includes color codes and control sequences
**Solution:** ANSI parsing library (strip-ansi) + optional preservation for display

---

## Success Metrics

1. **Command Execution Reliability:** 99%+ success rate for non-interactive commands
2. **Output Parsing Accuracy:** Correctly parse structured output (tables, JSON) 95%+ of time
3. **Response Time:** Command execution and observation < 100ms overhead
4. **Session Stability:** Support long-running sessions (hours/days) without crashes
5. **LLM Integration:** Enable natural language → terminal automation workflows

---

## Future Extensions

1. **Remote Terminal Support:** SSH session management
2. **Terminal Multiplexing:** tmux/screen integration
3. **Shell Completion:** Tab completion via MCP
4. **Visual Terminal:** VT100 emulation for full-screen apps
5. **Collaborative Sessions:** Multi-user shared terminals
6. **Security Sandboxing:** Restricted command execution modes
7. **Cloud Integration:** Remote execution on cloud VMs
8. **Recording & Playback:** asciinema-style session recording

---

## Next Steps

1. Set up TypeScript project with Bun
2. Install core dependencies (MCP SDK, node-pty, Zod)
3. Implement basic TerminalSession class with PTY
4. Create ToolRegistry
5. Implement first tool: `executeCommand`
6. Set up stdio transport
7. Test with simple MCP client

---

**Let's build the future of terminal automation!**
