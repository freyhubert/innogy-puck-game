/**
 * Main entry point - initializes the game when DOM is ready
 *
 * This file is for standalone mode (loading index.html directly).
 * For widget/embedded mode, use widget.js instead.
 */

import { Game } from './game/Game.js';
import { CANVAS } from './utils/constants.js';

/**
 * Get all required DOM element references
 * @returns {Object} Element references
 */
function getElements() {
  return {
    scoreEl: document.getElementById('score'),
    livesEl: document.getElementById('lives'),
    bestEl: document.getElementById('best'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    nameInput: document.getElementById('nameInput'),
    boardBody: document.getElementById('board')
  };
}

/**
 * Validate required elements exist (only core game elements)
 * @param {Object} elements - Element references
 * @returns {boolean} True if required elements found
 */
function validateElements(elements) {
  // Required elements for game to function
  const required = ['scoreEl', 'livesEl', 'bestEl', 'pauseBtn', 'restartBtn'];

  for (const key of required) {
    if (!elements[key]) {
      console.error(`Required element not found: ${key}`);
      return false;
    }
  }
  return true;
}

/**
 * Initialize the game
 * @returns {Game|null} Game instance or null if initialization failed
 */
export function init() {
  // Get canvas
  const canvas = document.getElementById('game');
  if (!canvas) {
    console.error('Game canvas not found');
    return null;
  }

  // Set canvas dimensions from constants
  canvas.width = CANVAS.WIDTH;
  canvas.height = CANVAS.HEIGHT;

  // Get DOM elements
  const elements = getElements();
  if (!validateElements(elements)) {
    return null;
  }

  // Create game instance
  const game = new Game(canvas, elements);

  // Expose to window for debugging (optional)
  if (typeof window !== 'undefined') {
    window.__game = game;
  }

  return game;
}

// Auto-initialize when loaded as standalone (not as module import)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
