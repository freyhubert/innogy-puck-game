/**
 * Main game controller - orchestrates all game systems
 */

import { CANVAS, PUCK } from '../utils/constants.js';
import { GameState } from './State.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from '../utils/input.js';
import { Goalie } from '../entities/Goalie.js';
import { Goal } from '../entities/Goal.js';
import { Puck } from '../entities/Puck.js';
import { ConfettiSystem } from '../entities/Confetti.js';
import { Leaderboard } from '../ui/Leaderboard.js';
import { checkGoalieCatch, checkPuckInGoal } from './Physics.js';

export class Game {
  /**
   * Create game instance
   * @param {HTMLCanvasElement} canvas - Game canvas
   * @param {Object} elements - DOM element references
   */
  constructor(canvas, elements) {
    this.canvas = canvas;
    this.elements = elements;

    // Initialize subsystems
    this.state = new GameState();
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler(canvas);
    this.goalie = new Goalie();
    this.goal = new Goal();
    this.confetti = new ConfettiSystem();

    // Leaderboard is optional (only if boardBody element exists)
    this.leaderboard = elements.boardBody ? new Leaderboard(elements.boardBody) : null;

    // Game objects
    this.pucks = [];
    this.endOverlay = null;

    // Button bounds for canvas click detection
    this.buttonBounds = null;

    // Animation frame ID for cleanup
    this.animationId = null;

    // Delta time tracking (for consistent speed across different refresh rates)
    this.lastTime = 0;
    this.targetFPS = 60;
    this.targetFrameTime = 1000 / this.targetFPS; // ~16.67ms per frame

    // Bind methods
    this.loop = this.loop.bind(this);
    this.handleCanvasClick = this.handleCanvasClick.bind(this);

    // Setup
    this.bindUI();
    this.init();
  }

  /**
   * Bind UI event listeners
   */
  bindUI() {
    this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
    this.elements.restartBtn.addEventListener('click', () => this.restart());

    // Canvas click for overlay buttons
    this.canvas.addEventListener('click', this.handleCanvasClick);

    // Keyboard pause via input handler
    this.input.setPauseCallback(() => this.togglePause());
  }

  /**
   * Handle clicks on canvas overlay buttons
   * @param {MouseEvent} e - Click event
   */
  handleCanvasClick(e) {
    if (!this.buttonBounds) return;

    // Get click position relative to canvas
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check start button on idle overlay
    if (this.state.isIdle && this.buttonBounds.startButton) {
      const btn = this.buttonBounds.startButton;
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.start();
        return;
      }
    }

    // Check play again button on end overlay
    if (this.state.isEnded && this.buttonBounds.playAgainButton) {
      const btn = this.buttonBounds.playAgainButton;
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.restart();
        this.start();
        return;
      }
    }
  }

  /**
   * Initialize game to ready state
   */
  async init() {
    // Try to initialize from API (gets player info and leaderboard)
    if (this.leaderboard) {
      const playerData = await this.leaderboard.init();

      // Set best score from API if available, otherwise from local storage
      if (playerData && playerData.bestScore) {
        this.state.setBestScore(playerData.bestScore);
      } else {
        this.state.setBestScore(this.leaderboard.getBestScore());
      }
    }

    // Update UI
    this.updateUI();

    // Draw initial state
    this.draw();
  }

  /**
   * Start the game
   */
  start() {
    if (this.state.isRunning) return;

    this.state.start();
    this.elements.pauseBtn.disabled = false;

    // Start game loop with initial timestamp
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    if (!this.state.isRunning && !this.state.isPaused) return;

    this.state.togglePause();

    // Update UI - swap pause/play icon
    this.updatePauseButton();

    // Resume loop if unpaused
    if (!this.state.isPaused) {
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }
  }

  /**
   * Update pause button icon based on state
   */
  updatePauseButton() {
    const pauseIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>`;
    const playIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>`;
    this.elements.pauseBtn.innerHTML = this.state.isPaused ? playIcon : pauseIcon;
    this.elements.pauseBtn.setAttribute('aria-label', this.state.isPaused ? 'Pokračovat' : 'Pauza');
  }

  /**
   * Restart the game
   */
  restart() {
    // Cancel any running animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Reset all state
    this.state.reset();
    this.pucks = [];
    this.confetti.clear();
    this.goalie.reset();
    this.goal.reset();
    this.input.reset();
    this.endOverlay = null;

    // Reset UI
    this.elements.pauseBtn.disabled = true;
    this.updatePauseButton();

    // Reload best score (might have changed)
    if (this.leaderboard) {
      this.state.setBestScore(this.leaderboard.getBestScore());
    }

    this.updateUI();
    this.draw();
  }

  /**
   * End the game
   */
  async end() {
    // Check for all-time record before saving
    const previousBest = this.leaderboard ? this.leaderboard.getBestScore() : this.state.bestScore;
    const isAllTimeRecord = this.state.score > previousBest;

    // Save score to leaderboard if available (async - submits to API if available)
    if (this.leaderboard) {
      const name = this.elements.nameInput ? (this.elements.nameInput.value || '').trim() : '';
      await this.leaderboard.addScore(name, this.state.score);

      // Render is handled by addScore when using API, but call for local fallback
      if (!this.leaderboard.useApi) {
        this.leaderboard.render();
      }
    }

    // Update best score
    this.state.updateBestScore();

    // Set end overlay
    if (isAllTimeRecord) {
      this.endOverlay = {
        title: '🏆 OSOBNÍ REKORD!',
        subtitle: `Počet zákroků: ${this.state.score}`,
        isAllTime: true
      };

      // Celebration confetti bursts
      for (let i = 0; i < 3; i++) {
        this.confetti.spawn(this.goalie.x, this.goalie.y - 50, true);
      }
    } else {
      this.endOverlay = {
        title: 'Konec hry',
        subtitle: `Počet zákroků: ${this.state.score} • Tvůj rekord: ${this.state.bestScore}`,
        isAllTime: false
      };
    }

    // End game state
    this.state.end();
    this.elements.pauseBtn.disabled = true;

    this.updateUI();
  }

  /**
   * Main update loop
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   * @param {number} elapsedMs - Elapsed time in milliseconds
   */
  update(delta, elapsedMs) {
    // Update input and goalie position
    const targetX = this.input.update();
    this.goalie.update(targetX, delta);

    // Spawn new pucks (uses milliseconds for timing)
    if (this.state.shouldSpawn(elapsedMs)) {
      // Calculate difficulty factor for horizontal movement (0-1)
      // Starts after HORIZONTAL_START_DELAY frames and ramps up over time
      const framesAfterDelay = Math.max(0, this.state.frameCount - PUCK.HORIZONTAL_START_DELAY);
      const difficultyFactor = Math.min(1, framesAfterDelay / 600); // Full difficulty after ~10 sec
      this.pucks.push(new Puck(this.state.speedBase, difficultyFactor));
    }

    // Update difficulty (uses milliseconds for timing)
    this.state.updateDifficulty(elapsedMs);

    // Update pucks and check collisions
    for (const puck of this.pucks) {
      puck.update(delta);

      // Skip already caught/scored pucks
      if (puck.caught || puck.scored) continue;

      // Check if puck entered the goal (missed by goalie - counts as a goal against)
      if (checkPuckInGoal(puck, this.goal)) {
        puck.scored = true;
        puck.markedForRemoval = true;
        this.goal.triggerGoal();
        const gameOver = this.state.decrementLives();
        if (gameOver) {
          this.end();
        }
        continue;
      }

      // Check for catch by goalie
      if (checkGoalieCatch(puck, this.goalie)) {
        puck.catch();

        // Trigger effects
        this.goalie.triggerCatch();
        this.confetti.spawn(puck.x, puck.y);
        this.state.incrementScore(puck.x, this.goalie.y - 60);
      }
    }

    // Remove caught/scored pucks and off-screen pucks
    // Note: Only pucks entering the goal count as missed (handled above)
    // Pucks going off-screen elsewhere are simply removed without penalty
    this.pucks = this.pucks.filter(puck => {
      if (puck.markedForRemoval) {
        return false;
      }

      if (puck.isOffScreen()) {
        return false;
      }

      return true;
    });

    // Update effects
    this.confetti.update(delta);
    this.goal.update(delta);
    this.state.updateEffects(delta);
    this.state.tick(delta);

    // Update UI
    this.updateUI();
  }

  /**
   * Draw current frame
   */
  draw() {
    this.renderer.clear();
    this.renderer.drawField();

    // Draw all pucks
    for (const puck of this.pucks) {
      this.renderer.drawPuck(puck);
    }

    // Draw goalie (in front of goal)
    this.renderer.drawGoalie(this.goalie);

    // Draw goal (behind goalie)
    this.renderer.drawGoal(this.goal);

    // Draw confetti
    this.renderer.drawConfetti(this.confetti.particles);

    // Draw catch text effect
    this.renderer.drawCatchText(this.state.catchText);

    // Draw HUD
    // this.renderer.drawHUD(this.state.score);

    // Draw overlays and store button bounds for click detection
    if (this.state.isIdle) {
      this.buttonBounds = this.renderer.drawIdleOverlay();
    } else if (this.state.isEnded) {
      this.buttonBounds = this.renderer.drawEndOverlay(this.endOverlay);
    } else {
      this.buttonBounds = null;
    }
  }

  /**
   * Main game loop
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  loop(timestamp) {
    // Calculate elapsed time in milliseconds
    const elapsedMs = Math.min(timestamp - this.lastTime, 50); // Cap at 50ms to prevent huge jumps
    this.lastTime = timestamp;

    // Delta is ratio of elapsed time to target frame time
    // At 60fps: delta = 1.0, at 120fps: delta = 0.5, at 30fps: delta = 2.0
    const delta = elapsedMs / this.targetFrameTime;

    if (!this.state.isRunning) {
      // Still draw after game ends to show overlay and confetti
      if (this.state.isEnded) {
        this.confetti.update(delta);
        this.draw();
        // Keep animating if there's confetti, otherwise stop loop
        if (this.confetti.count > 0) {
          this.animationId = requestAnimationFrame((ts) => this.loop(ts));
        }
      }
      return;
    }

    this.update(delta, elapsedMs);
    this.draw();
    this.animationId = requestAnimationFrame((ts) => this.loop(ts));
  }

  /**
   * Update all UI elements
   */
  updateUI() {
    this.elements.scoreEl.textContent = this.state.score;
    this.elements.livesEl.textContent = this.state.lives;
    this.elements.bestEl.textContent = this.state.bestScore;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
