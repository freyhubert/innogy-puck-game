/**
 * Confetti particle system for celebration effects
 */

import { COLORS, EFFECTS } from '../utils/constants.js';
import { randomRange } from '../utils/helpers.js';

// Olympic ring colors + brand color
const OLYMPIC_COLORS = [
  '#0085C7', // Blue
  '#000000', // Black
  '#DF0024', // Red
  '#F4C300', // Yellow
  '#009F3D', // Green
  COLORS.BRAND_PRIMARY // Pink
];

// Gold celebration colors
const GOLD_COLORS = [
  '#FFD54A',
  '#FFC107',
  '#FFB300',
  '#FFEE58',
  '#F9A825'
];

/**
 * Single confetti particle
 */
export class ConfettiParticle {
  /**
   * Create a confetti particle
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {boolean} isGold - Use gold colors for record celebration
   */
  constructor(x, y, isGold = false) {
    const colors = isGold ? GOLD_COLORS : OLYMPIC_COLORS;
    const power = isGold ? 1.35 : 1.0;

    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2.2 * power;
    this.vy = randomRange(-13.5, -4.5) * power;
    this.gravity = 0.26;
    this.radius = randomRange(2, 5) * (isGold ? 1.25 : 1);
    this.rotation = Math.random() * Math.PI;
    this.rotationSpeed = (Math.random() - 0.5) * 0.35;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.life = (isGold ? 62 : 42) + Math.random() * 22;
  }

  /**
   * Update particle physics
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   */
  update(delta = 1) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.vy += this.gravity * delta;
    this.rotation += this.rotationSpeed * delta;
    this.life -= delta;
  }

  /**
   * Check if particle is still alive
   * @returns {boolean} True if particle should continue
   */
  isAlive() {
    return this.life > 0;
  }

  /**
   * Get particle opacity based on remaining life
   * @returns {number} Opacity value 0-1
   */
  getOpacity() {
    return Math.min(1, this.life / 20);
  }
}

/**
 * Confetti particle system manager
 */
export class ConfettiSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Spawn a burst of confetti particles
   * @param {number} x - Spawn X position
   * @param {number} y - Spawn Y position
   * @param {boolean} isGold - Use gold colors for record celebration
   */
  spawn(x, y, isGold = false) {
    const count = isGold ? EFFECTS.CONFETTI_COUNT_GOLD : EFFECTS.CONFETTI_COUNT;

    for (let i = 0; i < count; i++) {
      this.particles.push(new ConfettiParticle(x, y, isGold));
    }
  }

  /**
   * Update all particles and remove dead ones
   * @param {number} delta - Time multiplier (1.0 = normal 60fps frame)
   */
  update(delta = 1) {
    // Update all particles
    for (const particle of this.particles) {
      particle.update(delta);
    }

    // Remove dead particles
    this.particles = this.particles.filter(p => p.isAlive());
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }

  /**
   * Get particle count
   * @returns {number} Number of active particles
   */
  get count() {
    return this.particles.length;
  }
}
