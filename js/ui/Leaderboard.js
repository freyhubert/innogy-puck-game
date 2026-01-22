/**
 * Leaderboard - manages score display via API
 * No localStorage - requires API backend for score storage
 */

import { escapeHtml } from '../utils/helpers.js';
import { apiService } from '../services/api.js';

export class Leaderboard {
  /**
   * Create leaderboard manager
   * @param {HTMLElement} containerElement - Container element for rendering (grid body)
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.displayLimit = 10;    // Entries shown in UI
    this.apiAvailable = false; // Will be set to true if API responds
  }

  /**
   * Initialize leaderboard - load from API
   * @returns {Promise<Object|null>} Player data if available
   */
  async init() {
    try {
      const data = await apiService.init();

      if (data && data.leaderboard) {
        this.apiAvailable = true;
        this.renderFromApi(data.leaderboard);
        return data.player || null;
      }
    } catch (error) {
      console.warn('API init failed:', error);
    }

    // API not available - show empty state
    this.apiAvailable = false;
    this.renderEmpty();
    return null;
  }

  /**
   * Add a new score entry via API
   * @param {number} score - Score value
   * @returns {Promise<Array|null>} Updated leaderboard or null if failed
   */
  async addScore(score) {
    if (!this.apiAvailable) {
      console.warn('API not available, score not saved');
      return null;
    }

    try {
      const data = await apiService.submitScore('Anonym', score);

      if (data && data.leaderboard) {
        this.renderFromApi(data.leaderboard);
        return data.leaderboard;
      }
    } catch (error) {
      console.warn('API submit failed:', error);
    }

    return null;
  }

  /**
   * Render empty state
   */
  renderEmpty() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="minigame-leaderboard-row minigame-leaderboard-empty">
        <span class="minigame-leaderboard-cell" style="grid-column: 1 / -1;">
          Zatím žádné skóre.
        </span>
      </div>
    `;
  }

  /**
   * Render leaderboard from API data
   * @param {Array} leaderboard - Array of leaderboard entries from API
   *   Expected format: [{ rank: 1, name: "Jan", score: 156, date: "2026-01-20" }, ...]
   */
  renderFromApi(leaderboard) {
    if (!this.container) return;

    if (!leaderboard || leaderboard.length === 0) {
      this.renderEmpty();
      return;
    }

    const entries = leaderboard.slice(0, this.displayLimit);

    this.container.innerHTML = entries.map((entry) => {
      const rank = entry.rank || (entries.indexOf(entry) + 1);
      const medal = rank === 1 ? '🥇 ' : rank === 2 ? '🥈 ' : rank === 3 ? '🥉 ' : '';
      const topClass = rank <= 3 ? ' minigame-top-three' : '';

      return `
        <div class="minigame-leaderboard-row${topClass}">
          <span class="minigame-leaderboard-cell">${rank}</span>
          <span class="minigame-leaderboard-cell">${medal}${escapeHtml(entry.name)}</span>
          <span class="minigame-leaderboard-cell"><strong>${entry.score}</strong></span>
          <span class="minigame-leaderboard-cell">${entry.date || ''}</span>
        </div>
      `;
    }).join('');
  }
}
