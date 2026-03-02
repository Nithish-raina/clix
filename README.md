# clix

```
 A modern AI-powered CLI companion that explains commands flag-by-flag, generates commands 
 from natural language, and builds your personal command library.
```
---

## CLI Demo Recording

![clix demo](./output/demo.gif)

---

## Features

- **Explain** any shell command — flag by flag, with optional beginner mode
- **Generate** a command from plain English description
- **Update** your AI model and token settings interactively
- **Save** commands locally for later reuse, with tags and descriptions
- **Browse** your saved commands with search and tag filters

---

## Prerequisites

- Node.js ≥ 18.0.0
- An [Anthropic API key](https://console.anthropic.com/)

---

## Installation

```sh
npm install -g @nithishz/clix
```

---

## Configuration

clix needs an Anthropic API key to work. Choose one of these methods:

**Option 1 — Environment variable (recommended for quick start)**

```sh
export ANTHROPIC_API_KEY=your-api-key-here
```

**Option 2 — Config file (persists across sessions)**

```sh
mkdir -p ~/.clix
echo '{"provider":"anthropic","apiKey":"your-api-key-here"}' > ~/.clix/config.json
```

The config file is created automatically on first run if the env var is set, so you only need to set the env var once.

---

## Commands

### `explain` — Understand any shell command

```sh
clix explain "<command>"
clix explain "<command>" --beginner
```

Breaks down what a command does, flag by flag. Add `--beginner` (or `-b`) for a plain-English explanation with examples.

**Examples:**

```sh
clix explain "find . -name '*.log' -mtime +30"
clix explain "docker ps -a --filter status=exited" --beginner
clix explain "git log --oneline --graph --all" -b
```

---

### `generate` — Create a command from plain English

```sh
clix generate "<description>"
```

Describe what you want to do and clix generates the correct shell command.

**Examples:**

```sh
clix generate "find all files larger than 100MB and sort by size"
clix generate "kill the process running on port 3000"
clix generate "compress all jpg files in the current directory"
```

---

### `update` — Change AI model or token settings

```sh
clix update
```

Launches an interactive prompt to update the AI model and max token configuration stored in `~/.clix/config.json`.

---

### `save` — Save a command for later

```sh
clix save "<command>"
clix save "<command>" --tag <tag> [<tag>...]
clix save "<command>" --description "<description>"
```

Saves a command to your local library. You can optionally add tags and a description to make it easier to find later.

**Examples:**

```sh
clix save "docker ps -a --filter status=exited"
clix save "lsof -i :3000" --tag networking ports --description "Find what is using a port"
clix save "git log --oneline --graph --all" -t git history
```

---

### `saved` — View and manage saved commands

```sh
clix saved                        # List all saved commands
clix saved --tag <tag>            # Filter by tag
clix saved --search <keyword>     # Search by keyword
clix saved --tags                 # List all tags in use
clix saved --delete <id>          # Delete a command by ID
```

**Examples:**

```sh
clix saved
clix saved --tag networking
clix saved --search docker
clix saved --tags
clix saved --delete 3
```
--- 

## Future Features

- Support for multiple AI providers (e.g., OpenAI, Google Gemini)
- Custom model support (bring your own model / self-hosted LLMs)
