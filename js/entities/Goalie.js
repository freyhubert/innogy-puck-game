/**
 * Goalie entity - the goalkeeper that catches pucks at the bottom
 */

import { CANVAS, EFFECTS } from '../utils/constants.js';
import { clamp, lerp } from '../utils/helpers.js';

export const GOALIE = {
  WIDTH: 178,
  HEIGHT: 91,
  Y_OFFSET: 130,  // from bottom of canvas
  MOVE_EASING: 0.18,
  MARGIN: 60,      // horizontal margin from canvas edge
  CATCH_WIDTH: 110,  // horizontal catch zone width
  CATCH_HEIGHT: 60   // vertical catch zone from top of goalie
};

export class Goalie {
  constructor() {
    this.width = GOALIE.WIDTH;
    this.height = GOALIE.HEIGHT;
    this.x = CANVAS.WIDTH / 2;
    this.y = CANVAS.HEIGHT - GOALIE.Y_OFFSET;

    // Catch animation state
    this.catchFlash = 0;
    this.catchAnimation = 0;
  }

  /**
   * Update goalie position with smooth easing
   * @param {number} targetX - Target X position from input
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   */
  update(targetX, delta = 1) {
    // Clamp target within screen bounds
    const clampedTarget = clamp(targetX, GOALIE.MARGIN, CANVAS.WIDTH - GOALIE.MARGIN);

    // Smooth movement with easing (adjust easing for delta time)
    // Use 1 - (1 - easing)^delta for frame-rate independent lerp
    const adjustedEasing = 1 - Math.pow(1 - GOALIE.MOVE_EASING, delta);
    this.x = lerp(this.x, clampedTarget, adjustedEasing);

    // Decay catch animation
    if (this.catchAnimation > 0) {
      this.catchAnimation -= 0.08 * delta;
    }
    if (this.catchFlash > 0) {
      this.catchFlash -= EFFECTS.CATCH_FLASH_DECAY * delta;
    }
  }

  /**
   * Trigger catch animation
   */
  triggerCatch() {
    this.catchAnimation = 1;
    this.catchFlash = 1;
  }

  /**
   * Get the catch zone bounds (area where goalie can catch pucks)
   * @returns {Object} Bounds with left, right, top, bottom
   */
  getCatchBounds() {
    const halfCatchWidth = GOALIE.CATCH_WIDTH / 2;

    return {
      left: this.x - halfCatchWidth,
      right: this.x + halfCatchWidth,
      top: this.y - this.height / 2,
      bottom: this.y - this.height / 2 + GOALIE.CATCH_HEIGHT
    };
  }

  /**
   * Get full goalie bounds for rendering
   * @returns {Object} Bounds with left, right, top, bottom, width, height
   */
  getBounds() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    return {
      left: this.x - halfWidth,
      right: this.x + halfWidth,
      top: this.y - halfHeight,
      bottom: this.y + halfHeight,
      width: this.width,
      height: this.height
    };
  }

  /**
   * Reset goalie to initial state
   */
  reset() {
    this.x = CANVAS.WIDTH / 2;
    this.catchFlash = 0;
    this.catchAnimation = 0;
  }
}
