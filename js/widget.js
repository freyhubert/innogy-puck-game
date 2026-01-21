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

// Innogy logo SVG
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="minigame-logo" width="43" height="64" viewBox="0 0 43 64" fill="none">
  <g clip-path="url(#minigame-logo-clip)">
    <path fill="#000" d="M6.413 54.484a4.312 4.312 0 0 0-2.67.924c0-.498-.211-.71-.703-.71h-.211c-.21 0-.351.07-.351.283v5.896c0 .356.28.498.632.498.351 0 .632-.142.632-.498v-3.765c0-.284.141-.568.352-.71.492-.355 1.194-.71 2.038-.71 1.265 0 1.897.71 1.897 1.918v3.267c0 .356.281.498.632.498.352 0 .633-.142.633-.498V57.54c-.07-2.06-1.054-3.055-2.881-3.055ZM.51 51.501c-.492 0-.843.355-.843.852s.351.853.843.853.843-.356.843-.853-.351-.852-.843-.852Zm0 3.125c-.422 0-.633.284-.633.71v5.4c0 .425.282.71.633.71.351 0 .632-.285.632-.71v-5.4c0-.426-.21-.71-.632-.71Zm21.363-.142c-2.109 0-3.725 1.492-3.725 3.552s1.616 3.552 3.724 3.552c2.109 0 3.725-1.492 3.725-3.552s-1.616-3.552-3.725-3.552Zm0 5.896c-1.476 0-2.53-.994-2.53-2.344 0-1.42.983-2.415 2.53-2.415 1.475 0 2.459.994 2.459 2.415 0 1.35-.984 2.344-2.46 2.344Zm-7.52-5.896a4.312 4.312 0 0 0-2.67.924c0-.498-.21-.71-.703-.71h-.21c-.211 0-.281.07-.281.283v5.896c0 .356.28.498.632.498.351 0 .632-.142.632-.498v-3.765c0-.284.14-.568.352-.71.492-.355 1.194-.71 2.038-.71 1.264 0 1.897.71 1.897 1.918v3.267c0 .356.281.498.632.498.352 0 .633-.142.633-.498V57.54c-.14-2.06-1.125-3.055-2.952-3.055Zm26.914.213c-.491 0-.773.142-.913.497l-2.108 4.689-2.179-4.689c-.14-.355-.562-.497-.983-.497-.422 0-.633.213-.492.497l2.81 5.825c.07.142.07.285 0 .427-.35.639-.773 1.207-1.405 1.207-.281 0-.492-.142-.632-.213-.07-.07-.14-.142-.281-.142-.211 0-.563.284-.563.71 0 .356.563.853 1.476.853 1.406 0 2.178-1.279 2.881-2.7l2.881-5.967c.14-.284 0-.497-.492-.497Zm-8.151 0h-.14c-.282 0-.633.142-.703.64a3.518 3.518 0 0 0-2.249-.853c-2.038 0-3.443 1.563-3.443 3.48 0 1.848 1.405 3.34 3.443 3.34.843 0 1.616-.285 2.249-.782 0 1.279-.633 2.202-2.249 2.202-1.054 0-1.757-.497-2.038-.781-.07-.071-.14-.142-.281-.142-.21 0-.562.284-.562.781 0 .569 1.265 1.279 2.81 1.279 2.46 0 3.514-1.42 3.514-3.836v-5.044c0-.213-.14-.284-.351-.284Zm-.914 4.191c0 .214-.07.427-.28.64-.422.426-1.195.71-1.828.71-1.405 0-2.319-.923-2.319-2.273s.914-2.344 2.32-2.344c.702 0 1.475.284 1.897.781.14.213.21.355.21.568v1.918Z"/>
    <path fill="gold" d="M24.332 13.923c.773-.284 1.195-.355 1.405-.284.07 0 .07 0 .141.07v.143c-.07.426-.562 1.705-3.514 4.404l-.562.497a4.656 4.656 0 0 1 1.476.64l.07-.071c3.935-3.694 4.006-5.115 4.006-5.612 0-.497-.14-.924-.492-1.208-.984-.994-2.952-.142-6.114 1.279-1.195.568-2.46 1.136-3.443 1.42-1.335.427-1.546.214-1.616.214-.211-.142 0-.71.421-1.492.562-.924 1.406-2.06 2.39-3.126l.491-.568a7.98 7.98 0 0 1-1.335-.71l-.351.426c-1.897 2.273-4.287 5.185-2.6 6.677 1.194 1.066 3.724-.07 6.605-1.35 1.125-.568 2.179-.994 3.022-1.35Z"/>
    <path fill="#000" d="M20.748 45.25c-2.53 0-4.638-2.06-4.638-4.689V23.3c0-2.558 2.038-4.689 4.638-4.689s4.638 2.06 4.638 4.689v17.332c0 2.558-2.108 4.618-4.638 4.618Zm0-25.289c-1.827 0-3.303 1.492-3.303 3.339v17.332c0 1.847 1.476 3.339 3.303 3.339s3.303-1.492 3.303-3.339V23.3c0-1.847-1.476-3.339-3.303-3.339Zm0-9.306c-2.881 0-5.27-2.415-5.27-5.327 0-2.913 2.389-5.328 5.27-5.328s5.27 2.415 5.27 5.328c0 2.912-2.389 5.327-5.27 5.327Zm0-9.305c-2.178 0-3.935 1.776-3.935 3.978s1.757 3.978 3.935 3.978c2.179 0 3.935-1.776 3.935-3.978S22.927 1.35 20.748 1.35Z"/>
  </g>
  <defs>
    <clipPath id="minigame-logo-clip">
      <path fill="#fff" d="M0 0h42.667v64H0z"/>
    </clipPath>
  </defs>
</svg>`;

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
    showHeader = true,
    showLeaderboard = true,
    title = 'Chytej innogy puky a vyhraj!',
    subtitle = 'Tvým úkolem je vychytat všechny puky. Čím víc zákroků, tím vyšší máš šanci na výhru!',
    showHelp = true
  } = options;

  const headerHTML = showHeader ? `
    <header class="minigame-header">
      <div class="minigame-brand">
        ${LOGO_SVG}
      </div>
      <h1>${title}</h1>
    </header>
    <p class="minigame-sub">${subtitle}</p>
  ` : '';

  const helpHTML = showHelp ? `
    <p class="minigame-help">
      Ovládání: <strong>myší</strong> nebo <strong>šipkami ← →</strong>. Klávesa <strong>P</strong> pro pauzu.
      Na mobilu táhni prstem do stran.
    </p>
  ` : '';

  const leaderboardHTML = showLeaderboard ? `
    <aside class="minigame-card">
      <h2>🏅 Žebříček</h2>
      <p class="minigame-sub">Zapisuje se po skončení hry.</p>

      <input
        id="${id}-nameInput"
        type="text"
        maxlength="18"
        placeholder="Zadej jméno do žebříčku (např. Pavel)"
        autocomplete="off"
        spellcheck="false"
      >

      <div class="minigame-leaderboard">
        <div class="minigame-leaderboard-header">
          <span>#</span>
          <span>Jméno</span>
          <span>Zákroky</span>
          <span>Datum</span>
        </div>
        <div class="minigame-leaderboard-body" id="${id}-board"></div>
      </div>

      <p class="minigame-help">
        Pozn.: Sdílený žebříček pro všechny návštěvníky webu vyžaduje server/API.
      </p>
    </aside>
  ` : '';

  return `
    <div class="minigame-wrap">
      <div class="minigame-card">
        ${headerHTML}

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
    nameInput: container.querySelector(`#${id}-nameInput`),
    boardBody: container.querySelector(`#${id}-board`)
  };
}

/**
 * Create game widget in a container
 * @param {string|HTMLElement} containerOrSelector - Container element or CSS selector
 * @param {Object} options - Configuration options
 * @param {boolean} options.showHeader - Show header with logo and title (default: true)
 * @param {boolean} options.showLeaderboard - Show leaderboard panel (default: true)
 * @param {string} options.title - Game title
 * @param {string} options.subtitle - Game subtitle
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
    elements.nameInput = null;
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
