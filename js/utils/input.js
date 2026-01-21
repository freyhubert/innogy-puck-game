/**
 * Input handler for mouse, touch, and keyboard controls
 */

export class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.targetX = canvas.width / 2;
    this.keys = { left: false, right: false };
    this.keyboardSpeed = 10;

    this.onPauseRequest = null;

    this.bindEvents();
  }

  /**
   * Set callback for pause key press
   * @param {Function} callback - Callback function
   */
  setPauseCallback(callback) {
    this.onPauseRequest = callback;
  }

  /**
   * Bind all input event listeners
   */
  bindEvents() {
    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      this.targetX = this.getCanvasX(e.clientX);
    });

    // Touch movement
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        this.targetX = this.getCanvasX(e.touches[0].clientX);
      }
    }, { passive: false });

    // Touch start (for initial position)
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.targetX = this.getCanvasX(e.touches[0].clientX);
      }
    }, { passive: true });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.keys.left = true;
      } else if (e.key === 'ArrowRight') {
        this.keys.right = true;
      } else if (e.key.toLowerCase() === 'p') {
        if (this.onPauseRequest) {
          this.onPauseRequest();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') {
        this.keys.left = false;
      } else if (e.key === 'ArrowRight') {
        this.keys.right = false;
      }
    });
  }

  /**
   * Convert client X coordinate to canvas X coordinate
   * @param {number} clientX - Client X position
   * @returns {number} Canvas X position
   */
  getCanvasX(clientX) {
    const rect = this.canvas.getBoundingClientRect();
    return (clientX - rect.left) * (this.canvas.width / rect.width);
  }

  /**
   * Update target position based on keyboard input
   * @returns {number} Updated target X position
   */
  update() {
    if (this.keys.left) {
      this.targetX -= this.keyboardSpeed;
    }
    if (this.keys.right) {
      this.targetX += this.keyboardSpeed;
    }
    return this.targetX;
  }

  /**
   * Reset target position to center
   */
  reset() {
    this.targetX = this.canvas.width / 2;
    this.keys.left = false;
    this.keys.right = false;
  }
}
