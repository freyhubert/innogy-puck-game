/**
 * Game constants and configuration
 * All magic numbers centralized in one place for easy tuning
 */

export const CANVAS = {
  // Portrait mode - half rink ratio (85ft wide × 100ft long)
  // Ratio: 85/100 = 0.85, so width = height × 0.85
  WIDTH: 600,
  HEIGHT: 600  // 600 / 0.85 ≈ 706
};

export const COLORS = {
  BRAND_PRIMARY: '#e5007d',
  BRAND_SECONDARY: '#7a2cff',
  TEXT: '#ffffff',
  MUTED: '#000000'
};

export const GAME = {
  INITIAL_LIVES: 3,
  INITIAL_SPAWN_INTERVAL: 800,   // milliseconds between spawns
  INITIAL_SPEED: 7.0,             // initial puck fall speed (pixels per frame at 60fps)
  DIFFICULTY_RAMP_INTERVAL: 6000, // milliseconds (6 seconds)
  SPAWN_INTERVAL_DECREASE: 50,    // milliseconds to decrease spawn interval each ramp
  SPEED_INCREASE: 0.35,          // speed increase each ramp
  MIN_SPAWN_INTERVAL: 400,        // milliseconds minimum spawn interval
  MAX_SPEED: 16.0
};

export const PUCK = {
  MIN_RADIUS: 7,
  MAX_RADIUS: 7,
  SPEED_VARIANCE: 1.25,
  SPAWN_MARGIN: 60,  // Reduced for narrower portrait canvas
  SPAWN_Y: -30,
  OFFSCREEN_MARGIN: 40,
  // Horizontal movement (increases with difficulty)
  HORIZONTAL_MAX: 6.0,          // Max horizontal speed at full difficulty
  HORIZONTAL_START_DELAY: 180   // Frames before horizontal movement starts (3 sec)
};

export const GOAL = {
  WIDTH: 240,         // Goal width (NHL goal is 6ft = ~180cm scaled)
  HEIGHT: 80,         // Goal depth/height visible below goal line
  Y_OFFSET: 80,       // Goal line position from bottom of canvas
  POST_WIDTH: 10,      // Goal post thickness
  NET_COLOR: '#ffffff',
  POST_COLOR: '#cc0000',
  CROSSBAR_COLOR: '#cc0000'
};

export const EFFECTS = {
  CONFETTI_COUNT: 18,
  CONFETTI_COUNT_GOLD: 44,
  CATCH_FLASH_DECAY: 0.09,
  CATCH_TEXT_DURATION: 30
};
