/**
 * Game state management
 */

import { GAME, EFFECTS } from '../utils/constants.js';

/**
 * Game status enum
 */
export const GameStatus = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  ENDED: 'ended'
};

/**
 * Game state class - manages all game state
 */
export class GameState {
  constructor() {
    this.reset();
  }

  /**
   * Reset all state to initial values
   * Note: bestScore is preserved across resets
   */
  reset() {
    const preservedBestScore = this.bestScore || 0;

    this.status = GameStatus.IDLE;
    this.score = 0;
    this.lives = GAME.INITIAL_LIVES;
    this.bestScore = preservedBestScore;
    this.frameCount = 0;

    // Difficulty settings (these increase over time)
    this.spawnInterval = GAME.INITIAL_SPAWN_INTERVAL;
    this.speedBase = GAME.INITIAL_SPEED;

    // Spawn timer (accumulates delta time)
    this.spawnTimer = 0;

    // Difficulty timer (accumulates delta time)
    this.difficultyTimer = 0;

    // Visual effects state
    this.catchFlash = 0;
    this.catchText = null;
  }

  /**
   * Check if game is currently running
   * @returns {boolean}
   */
  get isRunning() {
    return this.status === GameStatus.PLAYING;
  }

  /**
   * Check if game is paused
   * @returns {boolean}
   */
  get isPaused() {
    return this.status === GameStatus.PAUSED;
  }

  /**
   * Check if game has ended
   * @returns {boolean}
   */
  get isEnded() {
    return this.status === GameStatus.ENDED;
  }

  /**
   * Check if game is idle (not started)
   * @returns {boolean}
   */
  get isIdle() {
    return this.status === GameStatus.IDLE;
  }

  /**
   * Start the game
   */
  start() {
    if (this.status === GameStatus.IDLE) {
      this.status = GameStatus.PLAYING;
    }
  }

  /**
   * Pause the game
   */
  pause() {
    if (this.status === GameStatus.PLAYING) {
      this.status = GameStatus.PAUSED;
    }
  }

  /**
   * Resume from pause
   */
  resume() {
    if (this.status === GameStatus.PAUSED) {
      this.status = GameStatus.PLAYING;
    }
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.status === GameStatus.PLAYING) {
      this.pause();
    } else if (this.status === GameStatus.PAUSED) {
      this.resume();
    }
  }

  /**
   * End the game
   */
  end() {
    this.status = GameStatus.ENDED;
  }

  /**
   * Increment score and trigger effects
   * @param {number} x - X position for effect
   * @param {number} y - Y position for effect
   */
  incrementScore(x, y) {
    this.score++;
    this.catchFlash = 1;
    this.catchText = {
      x,
      y,
      ttl: EFFECTS.CATCH_TEXT_DURATION,
      value: this.score
    };
  }

  /**
   * Decrement lives
   * @returns {boolean} True if game should end (no lives left)
   */
  decrementLives() {
    this.lives--;
    return this.lives <= 0;
  }

  /**
   * Update difficulty based on time
   * Increases spawn rate and speed over time
   * @param {number} elapsedMs - Elapsed time in milliseconds
   */
  updateDifficulty(elapsedMs) {
    this.difficultyTimer += elapsedMs;

    if (this.difficultyTimer >= GAME.DIFFICULTY_RAMP_INTERVAL) {
      this.difficultyTimer = 0;

      // Increase spawn rate (decrease interval)
      this.spawnInterval = Math.max(
        GAME.MIN_SPAWN_INTERVAL,
        this.spawnInterval - GAME.SPAWN_INTERVAL_DECREASE
      );

      // Increase puck speed
      this.speedBase = Math.min(
        GAME.MAX_SPEED,
        this.speedBase + GAME.SPEED_INCREASE
      );
    }
  }

  /**
   * Update visual effects (fade out catch flash, etc.)
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   */
  updateEffects(delta = 1) {
    // Fade out catch flash
    this.catchFlash = Math.max(0, this.catchFlash - EFFECTS.CATCH_FLASH_DECAY * delta);

    // Update catch text timer
    if (this.catchText) {
      this.catchText.ttl -= delta;
      if (this.catchText.ttl <= 0) {
        this.catchText = null;
      }
    }
  }

  /**
   * Check if it's time to spawn a new puck (and reset timer if so)
   * @param {number} elapsedMs - Elapsed time in milliseconds
   * @returns {boolean}
   */
  shouldSpawn(elapsedMs) {
    this.spawnTimer += elapsedMs;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      return true;
    }
    return false;
  }

  /**
   * Increment frame counter
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   */
  tick(delta = 1) {
    this.frameCount += delta;
  }

  /**
   * Set best score
   * @param {number} score - New best score
   */
  setBestScore(score) {
    this.bestScore = score;
  }

  /**
   * Update best score if current score is higher
   */
  updateBestScore() {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
  }
}
