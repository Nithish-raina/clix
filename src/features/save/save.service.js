/**
 * Service layer for the save command.
 * Handles validation and delegates to the store.
 */

import { addCommand } from "../../store/save.store.js";

export class SaveService {
  /**
   * Save a command with optional description and tags.
   *
   * @param {object} params
   * @param {string} params.command - The CLI command to save
   * @param {string} [params.description] - What the command does
   * @param {string[]} [params.tags] - Tags for categorization
   * @returns {{ success: boolean, entry?: object, error?: string }}
   */
  save({ command, description = "", tags = [] }) {
    if (!command || command.trim().length === 0) {
      return { success: false, error: "Command cannot be empty." };
    }

    const entry = addCommand({
      command: command.trim(),
      description: description.trim(),
      tags,
    });

    return { success: true, entry };
  }
}
