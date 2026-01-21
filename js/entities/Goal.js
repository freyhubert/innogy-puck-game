/**
 * Goal entity - the hockey goal behind the goalie
 * Pucks entering the goal are considered missed (scored against)
 */

import { CANVAS, GOAL, EFFECTS } from '../utils/constants.js';

export class Goal {
  constructor() {
    this.width = GOAL.WIDTH;
    this.height = GOAL.HEIGHT;
    this.x = CANVAS.WIDTH / 2;
    this.y = CANVAS.HEIGHT - GOAL.Y_OFFSET;

    // Goal flash effect (red flash when puck enters)
    this.goalFlash = 0;
  }

  /**
   * Trigger goal flash effect when puck enters
   */
  triggerGoal() {
    this.goalFlash = 1;
  }

  /**
   * Update goal state
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   */
  update(delta = 1) {
    // Decay goal flash
    if (this.goalFlash > 0) {
      this.goalFlash -= EFFECTS.CATCH_FLASH_DECAY * delta;
      if (this.goalFlash < 0) this.goalFlash = 0;
    }
  }

  /**
   * Reset goal state
   */
  reset() {
    this.goalFlash = 0;
  }

  /**
   * Get the goal opening bounds (where pucks can enter)
   * @returns {Object} Bounds with left, right, top, bottom
   */
  getBounds() {
    const halfWidth = this.width / 2;

    return {
      left: this.x - halfWidth,
      right: this.x + halfWidth,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  /**
   * Get center point of goal (target for puck aiming)
   * @returns {Object} Center point {x, y}
   */
  getCenter() {
    return {
      x: this.x,
      y: this.y + this.height / 2
    };
  }
}
