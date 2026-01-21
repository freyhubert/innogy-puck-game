/**
 * Widget entry point - creates embeddable game widget
 *
 * Usage:
 *   import { createGame } from './widget.js';
 *   createGame('#my-container');
 *   // or
 *   createGame(document.getElementById('my-container'));
 */

import { Game } from './game/Game.js';
import { apiService } from './services/api.js';
import { setAssetsBaseUrl } from './game/Renderer.js';
import { CANVAS } from './utils/constants.js';

// Pause icon SVG
const PAUSE_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <rect x="6" y="4" width="4" height="16" rx="1"/>
  <rect x="14" y="4" width="4" height="16" rx="1"/>
</svg>`;

// Restart icon SVG
const RESTART_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
  <path d="M3 3v5h5"/>
</svg>`;

/**
 * Generate unique ID for widget instance
 * @returns {string} Unique ID
 */
function generateId() {
  return 'minigame-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Build the complete game HTML structure
 * @param {string} id - Unique instance ID
 * @param {Object} options - Configuration options
 * @returns {string} HTML string
 */
function buildHTML(id, options = {}) {
  const {
    showLeaderboard = true,
    showHelp = true
  } = options;

  const helpHTML = showHelp ? `
    <p class="minigame-help">
      Ovládání: <strong>myší</strong> nebo <strong>šipkami ← →</strong>. Klávesa <strong>P</strong> pro pauzu.
      Na mobilu táhni prstem do stran.
    </p>
  ` : '';

  const leaderboardHTML = showLeaderboard ? `
    <aside class="minigame-card">
      <h2>🏅 Žebříček</h2>

      <div class="minigame-leaderboard">
        <div class="minigame-leaderboard-header">
          <span>#</span>
          <span>Jméno</span>
          <span>Zákroky</span>
          <span>Datum</span>
        </div>
        <div class="minigame-leaderboard-body" id="${id}-board"></div>
      </div>
    </aside>
  ` : '';

  return `
    <div class="minigame-wrap">
      <div class="minigame-card">
        <div class="minigame-game-container">
          <div class="minigame-canvas-toolbar">
            <div class="minigame-toolbar-stats">
              <div class="minigame-toolbar-stat">
                <span class="minigame-toolbar-label">Zákroky</span>
                <span class="minigame-toolbar-val" id="${id}-score">0</span>
              </div>
              <div class="minigame-toolbar-stat">
                <span class="minigame-toolbar-label">Životy</span>
                <span class="minigame-toolbar-val" id="${id}-lives">3</span>
              </div>
              <div class="minigame-toolbar-stat">
                <span class="minigame-toolbar-label">Tvůj rekord</span>
                <span class="minigame-toolbar-val" id="${id}-best">0</span>
              </div>
            </div>
            <div class="minigame-toolbar-controls">
              <button id="${id}-pauseBtn" type="button" class="minigame-toolbar-btn" disabled aria-label="Pauza">
                ${PAUSE_ICON}
              </button>
              <button id="${id}-restartBtn" type="button" class="minigame-toolbar-btn" aria-label="Restart">
                ${RESTART_ICON}
              </button>
            </div>
          </div>
          <canvas
            id="${id}-game"
            width="${CANVAS.WIDTH}"
            height="${CANVAS.HEIGHT}"
            aria-label="Herní plocha - chytej innogy puky"
            role="img"
          ></canvas>
          ${helpHTML}
        </div>
      </div>

      ${leaderboardHTML}
    </div>
  `;
}

/**
 * Get element references from the built HTML
 * @param {HTMLElement} container - Container element
 * @param {string} id - Instance ID
 * @returns {Object} Element references
 */
function getElements(container, id) {
  return {
    scoreEl: container.querySelector(`#${id}-score`),
    livesEl: container.querySelector(`#${id}-lives`),
    bestEl: container.querySelector(`#${id}-best`),
    pauseBtn: container.querySelector(`#${id}-pauseBtn`),
    restartBtn: container.querySelector(`#${id}-restartBtn`),
    nameInput: null, // No longer used - names come from API or default to "Anonym"
    boardBody: container.querySelector(`#${id}-board`)
  };
}

/**
 * Create game widget in a container
 * @param {string|HTMLElement} containerOrSelector - Container element or CSS selector
 * @param {Object} options - Configuration options
 * @param {boolean} options.showLeaderboard - Show leaderboard panel (default: true)
 * @param {boolean} options.showHelp - Show help text (default: true)
 * @param {string} options.apiUrl - API base URL for cross-origin usage (e.g., 'https://yourdomain.com/api')
 * @param {string} options.assetsUrl - Base URL for assets (e.g., 'https://yourdomain.com/gamifikace/')
 * @returns {Object} Game instance and destroy function
 */
export function createGame(containerOrSelector, options = {}) {
  // Set API URL if provided (for CORS/cross-origin widget usage)
  if (options.apiUrl) {
    apiService.setBaseUrl(options.apiUrl);
  }

  // Set assets base URL if provided (for cross-origin image loading)
  if (options.assetsUrl) {
    setAssetsBaseUrl(options.assetsUrl);
  }

  // Resolve container
  const container = typeof containerOrSelector === 'string'
    ? document.querySelector(containerOrSelector)
    : containerOrSelector;

  if (!container) {
    console.error('InnogyGame: Container not found:', containerOrSelector);
    return null;
  }

  // Generate unique ID for this instance
  const id = generateId();

  // Build and insert HTML
  container.innerHTML = buildHTML(id, options);

  // Get canvas and elements
  const canvas = container.querySelector(`#${id}-game`);
  const elements = getElements(container, id);

  // Handle missing leaderboard elements when showLeaderboard is false
  if (!options.showLeaderboard) {
    elements.boardBody = null;
  }

  // Create game instance
  const game = new Game(canvas, elements);

  // Return game instance and destroy function
  return {
    game,
    destroy: () => {
      // Stop game loop
      if (game.animationFrameId) {
        cancelAnimationFrame(game.animationFrameId);
      }
      // Clear container
      container.innerHTML = '';
    }
  };
}

// Export for UMD/global usage
if (typeof window !== 'undefined') {
  window.InnogyGame = { createGame };
}

export default createGame;
