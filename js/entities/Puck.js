/**
 * Puck entity - falling objects the player must catch
 */

import { PUCK, CANVAS, GOAL } from '../utils/constants.js';
import { randomRange } from '../utils/helpers.js';

export class Puck {
  /**
   * Create a new puck
   * @param {number} speedBase - Base falling speed
   * @param {number} difficultyFactor - Difficulty factor 0-1 for horizontal movement
   */
  constructor(speedBase, difficultyFactor = 0) {
    this.radius = randomRange(PUCK.MIN_RADIUS, PUCK.MAX_RADIUS);

    // Determine spawn location: top (70%) or sides (30%)
    const spawnFromSide = Math.random() < 0.3;
    const maxSideSpawnY = CANVAS.HEIGHT / 3; // Upper 1/3 of canvas

    if (spawnFromSide) {
      // Spawn from left or right side
      const spawnFromLeft = Math.random() < 0.5;
      this.x = spawnFromLeft ? -this.radius : CANVAS.WIDTH + this.radius;
      this.y = randomRange(PUCK.SPAWN_MARGIN, maxSideSpawnY);
    } else {
      // Spawn from top (original behavior)
      this.x = randomRange(PUCK.SPAWN_MARGIN, CANVAS.WIDTH - PUCK.SPAWN_MARGIN);
      this.y = PUCK.SPAWN_Y;
    }
    this.prevY = this.y;

    // Calculate goal center position
    const goalCenterX = CANVAS.WIDTH / 2;
    const goalCenterY = CANVAS.HEIGHT - GOAL.Y_OFFSET + GOAL.HEIGHT / 2;

    // Calculate direction vector towards goal with some randomness
    const dx = goalCenterX - this.x;
    const dy = goalCenterY - this.y;

    // Normalize and scale by speed
    const totalSpeed = speedBase + Math.random() * PUCK.SPEED_VARIANCE;

    // Add randomness to aim (spread angle increases with difficulty)
    const aimSpread = 0.15 + difficultyFactor * 0.25; // radians of spread
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * aimSpread;

    this.vx = Math.cos(angle) * totalSpeed;
    this.vy = Math.sin(angle) * totalSpeed;

    // Ensure minimum downward velocity
    if (this.vy < speedBase * 0.5) {
      this.vy = speedBase * 0.5;
    }

    this.caught = false;
    this.scored = false;  // True if puck entered the goal
    this.squash = 0;
    this.markedForRemoval = false;
  }

  /**
   * Update puck position
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   */
  update(delta = 1) {
    this.prevY = this.y;
    this.y += this.vy * delta;
    this.x += this.vx * delta;

    // Bounce off side walls
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.radius > CANVAS.WIDTH) {
      this.x = CANVAS.WIDTH - this.radius;
      this.vx = -Math.abs(this.vx);
    }
  }

  /**
   * Check if puck is below screen
   * @returns {boolean} True if off screen
   */
  isOffScreen() {
    return this.y > CANVAS.HEIGHT + PUCK.OFFSCREEN_MARGIN;
  }

  /**
   * Mark puck as caught and for removal
   */
  catch() {
    this.caught = true;
    this.markedForRemoval = true;
  }
}
