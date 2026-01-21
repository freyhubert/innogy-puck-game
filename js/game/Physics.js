/**
 * Physics module - collision detection and movement calculations
 */

import { PUCK, CANVAS } from '../utils/constants.js';

/**
 * Check if puck is caught by the goalie
 * Returns true when puck overlaps the goalie's catch zone
 *
 * @param {Puck} puck - Puck entity
 * @param {Goalie} goalie - Goalie entity
 * @returns {boolean} True if puck is caught by goalie
 */
export function checkGoalieCatch(puck, goalie) {
  const bounds = goalie.getCatchBounds();

  // Check if puck center is within catch zone horizontally
  // const withinWidth = puck.x >= bounds.left && puck.x <= bounds.right;

  // Check if puck crossed into catch zone vertically this frame
  // const crossedThreshold = (puck.prevY + puck.radius < bounds.top) &&
                           (puck.y + puck.radius >= bounds.top);

  const withinGoalie = puck.x >= bounds.left && puck.x <= bounds.right &&
                       puck.y >= bounds.top && puck.y <= bounds.bottom;

//   return crossedThreshold && withinWidth;
    return withinGoalie;
}

/**
 * Check if puck missed (went past goalie without being caught)
 * @param {Puck} puck - Puck entity
 * @returns {boolean} True if puck went past the bottom catch line
 */
export function checkPuckMissed(puck) {
  return puck.y - puck.radius > CANVAS.HEIGHT;
}

/**
 * Check if puck entered the goal (scored against the goalie)
 * @param {Puck} puck - Puck entity
 * @param {Goal} goal - Goal entity
 * @returns {boolean} True if puck entered the goal
 */
export function checkPuckInGoal(puck, goal) {
  const bounds = goal.getBounds();

  // Check if puck center is within goal opening
  return puck.x >= bounds.left &&
         puck.x <= bounds.right &&
         puck.y >= bounds.top &&
         puck.y <= bounds.bottom;
}

/**
 * Calculate visual squash effect based on proximity to goal
 * Makes puck appear to compress as it approaches the goal
 *
 * @param {Puck} puck - Puck entity
 * @param {Goal} goal - Goal entity
 * @returns {number} Squash factor (0-0.24)
 */
export function calculateSquash(puck, goal) {
  const bounds = goal.getInnerBounds();
  const distanceToFront = Math.abs(bounds.top - (puck.y + puck.radius));

  // Calculate proximity (0 = far, 1 = touching)
  const proximity = Math.max(0, 1 - distanceToFront / PUCK.SQUASH_DISTANCE);

  // Target squash based on proximity
  const targetSquash = Math.min(PUCK.SQUASH_MAX, proximity * PUCK.SQUASH_MAX);

  // Smooth interpolation for natural animation
  return puck.squash + (targetSquash - puck.squash) * PUCK.SQUASH_EASING;
}

/**
 * Check if a point is inside a rectangle
 *
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} rx - Rectangle X (left)
 * @param {number} ry - Rectangle Y (top)
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean} True if point is inside rectangle
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Check if a circle overlaps a rectangle
 *
 * @param {number} cx - Circle center X
 * @param {number} cy - Circle center Y
 * @param {number} cr - Circle radius
 * @param {number} rx - Rectangle X (left)
 * @param {number} ry - Rectangle Y (top)
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean} True if circle overlaps rectangle
 */
export function circleRectOverlap(cx, cy, cr, rx, ry, rw, rh) {
  // Find closest point on rectangle to circle center
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  // Calculate distance from circle center to closest point
  const distanceX = cx - closestX;
  const distanceY = cy - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  return distanceSquared < cr * cr;
}
