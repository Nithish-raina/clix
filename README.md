# clix

> An CLI tool that explains commands flag-by-flag, generates commands
> from natural language using AI, and builds your personal command library.

## CLI Demo Recording

![clix demo](./output/demo.gif)

---

## Features

- **Explain** any shell command — flag by flag, with an optional beginner mode. Beginner mode would explain the command in even more simpler terms
- **Generate** a command from plain English description
- **Update** your AI model and token settings with an interactive wizard
- **Save** commands locally with tags and descriptions. This could be reused in the future
- **Browse** your saved commands with search and tag filters

---

## Prerequisites

- Node.js ≥ 18.0.0
- An API key from one of the supported providers:
  - [Anthropic](https://console.anthropic.com/) (Claude)
  - [OpenAI](https://platform.openai.com/) (GPT)
  - [Google](https://aistudio.google.com/apikey) (Gemini)

---

## Installation

### Global Install (Recommended)

Install globally to use `clix` from anywhere in your terminal:

```sh
npm install -g @nithishz/clix
```

Then run:

```sh
clix explain "ls -la"
```

### Local Install (Inside a Project)

If you prefer to install it locally inside a Node.js project:

```sh
npm install @nithishz/clix
```

Then run with:

```sh
npx clix explain "ls -la"
```

### One-Time Usage (No Install)

You can also run it directly without installing:

```sh
npx @nithishz/clix explain "ls -la"
```

---

## Getting Started

Run the interactive setup to choose your AI provider, model, and enter your API key (masked):

```sh
clix init
```

This allows you to:

1. **Provider selection** — Anthropic, OpenAI, or Google Gemini
2. **Model selection** — pick from available models for your chosen provider
3. **API key** — enter your provider-specific API key

Your configuration is saved to `~/.clix/config.json` and persists across sessions.

### Supported Providers & Models

| Provider          | Models                                                                  | Env Variable        |
| ----------------- | ----------------------------------------------------------------------- | ------------------- |
| **Anthropic**     | Claude 4.6 Sonnet, Claude 4.6 Opus, Claude Haiku 4.5                    | `ANTHROPIC_API_KEY` |
| **OpenAI**        | GPT-5.4, GPT-5.4 Pro, GPT-5 Mini, GPT-4o                                | `OPENAI_API_KEY`    |
| **Google Gemini** | Gemini 3.1 Pro, Gemini 3.1 Flash-Lite, Gemini 2.5 Flash, Gemini 2.5 Pro | `GOOGLE_API_KEY`    |

### Alternative Configuration

You can also configure API Keys for your model via environment variables instead of `clix init`:

```sh
# Anthropic
export ANTHROPIC_API_KEY=your-api-key-here

# OpenAI
export OPENAI_API_KEY=your-api-key-here

# Google Gemini
export GOOGLE_API_KEY=your-api-key-here
```

---

## Commands

### `init` — Set up your AI provider, model and API Key

```sh
clix init
```

Interactive setup wizard to configure your preferred AI provider, model, and API key. Run this once after installation, or anytime you want to switch providers or update model or update API Key.

---

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

- Custom model support (bring your own model / self-hosted LLMs)
- Ollama support for local/self-hosted models
