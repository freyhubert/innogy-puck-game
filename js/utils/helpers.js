/**
 * Utility functions for the game
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => entities[char]);
}

/**
 * Format timestamp date portion in Czech locale (dd. mm. YYYY)
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
export function formatDateOnly(timestamp) {
  return new Date(timestamp).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format timestamp time portion in Czech locale (H:i)
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time string
 */
export function formatTimeOnly(timestamp) {
  return new Date(timestamp).toLocaleString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Draw rounded rectangle path on canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {number} radius - Corner radius
 */
export function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/**
 * Get random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number in range
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
