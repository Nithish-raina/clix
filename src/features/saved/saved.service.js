/**
 * Service layer for the saved command.
 * Handles listing, filtering, and deleting saved commands.
 */

import {
  getCommands,
  deleteCommand,
  getAllTags,
} from "../../store/save.store.js";

export class SavedService {
  /**
   * List saved commands with optional filters.
   *
   * @param {object} [filters]
   * @param {string} [filters.tag]
   * @param {string} [filters.search]
   * @returns {{ commands: object[], totalCount: number, filteredCount: number }}
   */
  list({ tag, search } = {}) {
    const all = getCommands();
    const filtered = getCommands({ tag, search });

    return {
      commands: filtered,
      totalCount: all.length,
      filteredCount: filtered.length,
    };
  }

  /**
   * Delete a saved command by ID.
   *
   * @param {number} id
   * @returns {{ success: boolean, deleted?: object, error?: string }}
   */
  delete(id) {
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return { success: false, error: "Invalid ID. Must be a number." };
    }

    const deleted = deleteCommand(numericId);

    if (!deleted) {
      return {
        success: false,
        error: `No saved command found with ID ${numericId}.`,
      };
    }

    return { success: true, deleted };
  }

  /**
   * Get all tags in use.
   *
   * @returns {string[]}
   */
  tags() {
    return getAllTags();
  }
}
