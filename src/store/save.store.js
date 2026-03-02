/**
 * Storage layer for saved commands.
 * Reads and writes to ~/.clix/saved-commands.json
 */

import fs from "fs";
import { STORE_DIR, STORE_FILE } from "../config/constants.js";

function ensureStoreExists() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ commands: [], nextId: 1 }, null, 2),
    );
  }
}

function readStore() {
  ensureStoreExists();
  try {
    const data = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // corrupted file — reset
    const fresh = { commands: [], nextId: 1 };
    fs.writeFileSync(STORE_FILE, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

function writeStore(store) {
  ensureStoreExists();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

/**
 * Save a new command.
 *
 * @param {object} entry
 * @param {string} entry.command - The CLI command string
 * @param {string} [entry.description] - What the command does
 * @param {string[]} [entry.tags] - Tags for categorization
 * @returns {object} The saved entry with its assigned ID
 */
export function addCommand({ command, description = "", tags = [] }) {
  const store = readStore();

  const entry = {
    id: store.nextId,
    command,
    description,
    tags: tags.map((t) => t.toLowerCase().trim()),
    savedAt: new Date().toISOString(),
  };

  store.commands.push(entry);
  store.nextId += 1;
  writeStore(store);

  return entry;
}

/**
 * Get all saved commands, optionally filtered.
 *
 * @param {object} [filters]
 * @param {string} [filters.tag] - Filter by tag
 * @param {string} [filters.search] - Search in command and description
 * @returns {object[]} Array of matching saved commands
 */
export function getCommands({ tag, search } = {}) {
  const store = readStore();
  let results = store.commands;

  if (tag) {
    const normalizedTag = tag.toLowerCase().trim();
    results = results.filter((cmd) => cmd.tags.includes(normalizedTag));
  }

  if (search) {
    const normalizedSearch = search.toLowerCase().trim();
    results = results.filter(
      (cmd) =>
        cmd.command.toLowerCase().includes(normalizedSearch) ||
        cmd.description.toLowerCase().includes(normalizedSearch) ||
        cmd.tags.some((t) => t.includes(normalizedSearch)),
    );
  }

  return results;
}

/**
 * Delete a saved command by ID.
 *
 * @param {number} id - The command ID to delete
 * @returns {object|null} The deleted entry, or null if not found
 */
export function deleteCommand(id) {
  const store = readStore();
  const index = store.commands.findIndex((cmd) => cmd.id === id);

  if (index === -1) return null;

  const deleted = store.commands.splice(index, 1)[0];
  writeStore(store);

  return deleted;
}

/**
 * Get all unique tags across saved commands.
 *
 * @returns {string[]} Array of unique tags
 */
export function getAllTags() {
  const store = readStore();
  const tagSet = new Set();

  for (const cmd of store.commands) {
    for (const tag of cmd.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}
