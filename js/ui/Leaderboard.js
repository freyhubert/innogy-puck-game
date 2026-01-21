/**
 * Leaderboard - manages score storage and display
 */

import { STORAGE_KEY } from '../utils/constants.js';
import { escapeHtml, formatDate } from '../utils/helpers.js';
import { apiService } from '../services/api.js';

export class Leaderboard {
  /**
   * Create leaderboard manager
   * @param {HTMLElement} containerElement - Container element for rendering (grid body)
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.maxEntries = 200;     // Maximum stored entries
    this.displayLimit = 10;    // Entries shown in UI
    this.useApi = false;       // Will be set to true if API is available
  }

  /**
   * Initialize leaderboard - try to load from API first
   * @returns {Promise<Object|null>} Player data if available
   */
  async init() {
    try {
      const data = await apiService.init();

      if (data && data.leaderboard) {
        this.useApi = true;
        this.renderFromApi(data.leaderboard);
        return data.player || null;
      }
    } catch (error) {
      console.warn('API init failed, using local storage');
    }

    // Fallback to local storage
    this.useApi = false;
    this.render();
    return null;
  }

  /**
   * Load scores from localStorage
   * @returns {Array} Array of score objects
   */
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to load scores:', e);
      return [];
    }
  }

  /**
   * Save scores to localStorage
   * @param {Array} scores - Array of score objects
   */
  save(scores) {
    try {
      const trimmed = scores.slice(0, this.maxEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save scores:', e);
    }
  }

  /**
   * Add a new score entry for every game played
   * Tries API first, falls back to local storage
   * @param {string} name - Player name
   * @param {number} score - Score value
   * @returns {Promise<Array>} Updated scores array
   */
  async addScore(name, score) {
    const playerName = (name || '').trim() || 'Anonym';

    // Try API first
    if (this.useApi) {
      try {
        const data = await apiService.submitScore(playerName, score);

        if (data && data.leaderboard) {
          this.renderFromApi(data.leaderboard);
          return data.leaderboard;
        }
      } catch (error) {
        console.warn('API submit failed, using local storage fallback');
      }
    }

    // Fallback to local storage
    return this.addScoreLocal(playerName, score);
  }

  /**
   * Add score to local storage (fallback)
   * Stores every game played (not just personal bests)
   * @param {string} playerName - Player name
   * @param {number} score - Score value
   * @returns {Array} Updated scores array
   */
  addScoreLocal(playerName, score) {
    const scores = this.load();

    // Add new entry for every game played
    scores.push({
      name: playerName,
      score: score,
      ts: Date.now()
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    this.save(scores);
    return scores;
  }

  /**
   * Get the all-time best score
   * @returns {number} Best score or 0
   */
  getBestScore() {
    const scores = this.load();
    return scores.reduce((max, entry) => Math.max(max, entry.score || 0), 0);
  }

  /**
   * Check if a score would be a new all-time record
   * @param {number} score - Score to check
   * @returns {boolean} True if new record
   */
  isNewRecord(score) {
    return score > this.getBestScore();
  }

  /**
   * Get rank for a score
   * @param {number} score - Score to check
   * @returns {number} Rank (1-based)
   */
  getRank(score) {
    const scores = this.load();
    const betterScores = scores.filter(entry => entry.score > score);
    return betterScores.length + 1;
  }

  /**
   * Clear all scores
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    this.render();
  }

  /**
   * Render leaderboard to DOM
   */
  render() {
    const scores = this.load()
      .sort((a, b) => b.score - a.score)
      .slice(0, this.displayLimit);

    if (scores.length === 0) {
      this.container.innerHTML = `
        <div class="minigame-leaderboard-row minigame-leaderboard-empty">
          <span class="minigame-leaderboard-cell" style="grid-column: 1 / -1;">
            Zatím žádné skóre.
          </span>
        </div>
      `;
      return;
    }

    this.container.innerHTML = scores.map((entry, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? '🥇 ' : rank === 2 ? '🥈 ' : rank === 3 ? '🥉 ' : '';
      const topClass = rank <= 3 ? ' minigame-top-three' : '';

      return `
        <div class="minigame-leaderboard-row${topClass}">
          <span class="minigame-leaderboard-cell">${rank}</span>
          <span class="minigame-leaderboard-cell">${medal}${escapeHtml(entry.name)}</span>
          <span class="minigame-leaderboard-cell"><strong>${entry.score}</strong></span>
          <span class="minigame-leaderboard-cell">${formatDate(entry.ts)}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Render leaderboard from API data
   * @param {Array} leaderboard - Array of leaderboard entries from API
   *   Expected format: [{ rank: 1, name: "Jan", score: 156, date: "2026-01-20" }, ...]
   */
  renderFromApi(leaderboard) {
    if (!leaderboard || leaderboard.length === 0) {
      this.container.innerHTML = `
        <div class="minigame-leaderboard-row minigame-leaderboard-empty">
          <span class="minigame-leaderboard-cell" style="grid-column: 1 / -1;">
            Zatím žádné skóre.
          </span>
        </div>
      `;
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
