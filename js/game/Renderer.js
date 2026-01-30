/**
 * Renderer - handles all canvas drawing operations
 */

import { CANVAS, COLORS, GOAL } from '../utils/constants.js';
import { roundedRectPath } from '../utils/helpers.js';

// Global assets base URL (can be set by widget for cross-origin usage)
let assetsBaseUrl = '';

/**
 * Set the base URL for loading assets (used by widget for cross-origin)
 * @param {string} url - Base URL for assets (e.g., 'https://yourdomain.com/gamifikace/')
 */
export function setAssetsBaseUrl(url) {
  // Ensure trailing slash
  assetsBaseUrl = url.endsWith('/') ? url : url + '/';
}

/**
 * Get full asset URL
 * @param {string} path - Relative asset path
 * @returns {string} Full URL
 */
function getAssetUrl(path) {
  return assetsBaseUrl + path;
}

export class Renderer {
  /**
   * Create renderer
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} options - Renderer options
   * @param {Object} options.secondaryButton - Secondary button config {url, target, text}
   * @param {Object} options.idleText - Idle overlay text config {title, subtitle1, subtitle2}
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = CANVAS.WIDTH;
    this.height = CANVAS.HEIGHT;
    this.options = options;

    // Load innogy logo for puck
    this.logoImage = new Image();
    this.logoImage.crossOrigin = 'anonymous'; // Enable CORS for cross-origin images
    this.logoImage.src = getAssetUrl('assets/innogy-logo-simple-white.svg');
    this.logoLoaded = false;
    this.logoImage.onload = () => {
      this.logoLoaded = true;
    };

    // Load goalie image
    this.goalieImage = new Image();
    this.goalieImage.crossOrigin = 'anonymous'; // Enable CORS for cross-origin images
    this.goalieImage.src = getAssetUrl('assets/goalie-2.svg');
    this.goalieLoaded = false;
    this.goalieImage.onload = () => {
      this.goalieLoaded = true;
    };
  }

  /**
   * Clear the entire canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Draw the playing field background - hockey ice in front of goal crease
   */
  drawField() {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;

    // Ice background - white with subtle blue tint
    const iceGrad = ctx.createLinearGradient(0, 0, 0, H);
    iceGrad.addColorStop(0, '#f0f5fa');
    iceGrad.addColorStop(0.5, '#e8f0f8');
    iceGrad.addColorStop(1, '#e0eaf5');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, 0, W, H);

    // Goal crease (blue semi-circle at bottom center where goalie stands)
    const creaseRadius = GOAL.WIDTH * 0.6;  // 60% of goal width (~144px)
    const goalLineY = H - GOAL.Y_OFFSET;

    ctx.save();
    // Blue crease fill
    ctx.fillStyle = 'rgba(37, 90, 214, 0.6)';

    ctx.beginPath();
    // Top half of circle: from Math.PI (left) to 0 (right), counterclockwise = upward
    ctx.arc(W / 2, goalLineY, creaseRadius, Math.PI, 0, false);
    ctx.fill();

    // Red crease outline
    ctx.strokeStyle = '#c81e1e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W / 2, goalLineY, creaseRadius, Math.PI, 0, false);
    ctx.stroke();
    ctx.restore();

    // Goal line (red line across the bottom)
    ctx.save();
    ctx.strokeStyle = '#c81e1e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, goalLineY);
    ctx.lineTo(W, goalLineY);
    ctx.stroke();
    ctx.restore();

    // Subtle ice texture lines (scratches)
    // ctx.save();
    // ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    // ctx.lineWidth = 1;
    // for (let i = 0; i < 30; i++) {
    //   const x1 = Math.random() * W;
    //   const y1 = Math.random() * (H - 100);
    //   const len = 40 + Math.random() * 80;
    //   const angle = -0.2 + Math.random() * 0.4;
    //   ctx.beginPath();
    //   ctx.moveTo(x1, y1);
    //   ctx.lineTo(x1 + len * Math.cos(angle), y1 + len * Math.sin(angle));
    //   ctx.stroke();
    // }
    ctx.restore();
  }

  /**
   * Draw the hockey goal behind the goalie
   * @param {Goal} goal - Goal entity
   */
  drawGoal(goal) {
    const ctx = this.ctx;
    const bounds = goal.getBounds();
    const postWidth = GOAL.POST_WIDTH;

    ctx.save();

    // Goal net background (white mesh)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(bounds.left, bounds.top, goal.width, goal.height);

    // Draw net mesh pattern
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
    ctx.lineWidth = 1;

    // Vertical lines
    const meshSpacing = 12;
    for (let x = bounds.left + meshSpacing; x < bounds.right; x += meshSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, bounds.top);
      ctx.lineTo(x, bounds.bottom);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = bounds.top + meshSpacing; y < bounds.bottom; y += meshSpacing) {
      ctx.beginPath();
      ctx.moveTo(bounds.left, y);
      ctx.lineTo(bounds.right, y);
      ctx.stroke();
    }

    // Goal posts (red)
    ctx.fillStyle = GOAL.POST_COLOR;

    // Left post
    ctx.fillRect(bounds.left - postWidth, bounds.top - 4, postWidth, goal.height + 4);

    // Right post
    ctx.fillRect(bounds.right, bounds.top - 4, postWidth, goal.height + 4);

    // Crossbar (red) - at goal line
    ctx.fillRect(bounds.left - postWidth, bounds.top - 4, goal.width + postWidth * 2, 4);

    // Post shadows for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(bounds.left, bounds.top, 3, goal.height);
    ctx.fillRect(bounds.right - 3, bounds.top, 3, goal.height);

    // Goal flash effect (red flash when puck enters goal)
    if (goal.goalFlash > 0) {
      const centerX = (bounds.left + bounds.right) / 2;
      const centerY = (bounds.top + bounds.bottom) / 2;
      const grd = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 200);
      grd.addColorStop(0, `rgba(239,68,68,${0.55 * goal.goalFlash})`);
      grd.addColorStop(0.5, `rgba(220,38,38,${0.3 * goal.goalFlash})`);
      grd.addColorStop(1, 'rgba(185,28,28,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw the goalie
   * @param {Goalie} goalie - Goalie entity
   */
  drawGoalie(goalie) {
    const ctx = this.ctx;
    const bounds = goalie.getBounds();

    ctx.save();

    // Draw goalie shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(goalie.x, bounds.bottom - 10, bounds.width * 0.4, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw goalie image (skip if not loaded yet - better than showing placeholder)
    if (this.goalieLoaded && this.goalieImage.complete) {
      // Apply catch animation (slight scale bounce)
      const scale = 1 + goalie.catchAnimation * 0.08;

      ctx.translate(goalie.x, goalie.y);
      ctx.scale(scale, scale);

      ctx.drawImage(
        this.goalieImage,
        -bounds.width / 2,
        -bounds.height / 2,
        bounds.width,
        bounds.height
      );
    }
    // No fallback - goalie simply won't appear until image loads

    // Catch flash effect (green for successful save)
    if (goalie.catchFlash > 0) {
      const grd = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
      grd.addColorStop(0, `rgba(34,197,94,${0.45 * goalie.catchFlash})`);
      grd.addColorStop(1, 'rgba(22,163,74,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, -30, 150, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw a hockey puck - black with white center circle and innogy logo
   * @param {Puck} puck - Puck entity
   */
  drawPuck(puck) {
    const ctx = this.ctx;
    const { x, y, radius } = puck;

    ctx.save();
    ctx.translate(x, y);

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;

    // Main black puck body
    const bodyGrad = ctx.createLinearGradient(0, -radius, 0, radius);
    bodyGrad.addColorStop(0, '#3a3a3a');
    bodyGrad.addColorStop(0.3, '#1a1a1a');
    bodyGrad.addColorStop(0.7, '#0a0a0a');
    bodyGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow for inner elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Outer rim highlight (rubber edge effect)
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Inner edge shadow
    const innerShadow = ctx.createRadialGradient(0, 2, radius * 0.5, 0, 2, radius);
    innerShadow.addColorStop(0, 'rgba(0,0,0,0)');
    innerShadow.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = innerShadow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // White center circle
    // const centerRadius = radius * 0.65;
    // ctx.fillStyle = '#ffffff';
    // ctx.beginPath();
    // ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    // ctx.fill();

    // // Subtle inner shadow on white circle
    // const whiteShadow = ctx.createRadialGradient(0, -centerRadius * 0.3, 0, 0, 0, centerRadius);
    // whiteShadow.addColorStop(0, 'rgba(255,255,255,1)');
    // whiteShadow.addColorStop(0.7, 'rgba(240,240,240,1)');
    // whiteShadow.addColorStop(1, 'rgba(220,220,220,1)');
    // ctx.fillStyle = whiteShadow;
    // ctx.beginPath();
    // ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    // ctx.fill();

    // // Draw innogy logo in center
    // if (this.logoLoaded && this.logoImage.complete) {
    //   const logoSize = centerRadius * 1.4;
    //   const logoAspect = this.logoImage.height / this.logoImage.width;
    //   const logoWidth = logoSize / logoAspect;
    //   const logoHeight = logoSize;

    //   ctx.drawImage(
    //     this.logoImage,
    //     -logoWidth / 2,
    //     -logoHeight / 2,
    //     logoWidth,
    //     logoHeight
    //   );
    // }

    // Top specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.5, radius * 0.6, radius * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw all confetti particles
   * @param {ConfettiParticle[]} particles - Array of particles
   */
  drawConfetti(particles) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.getOpacity();
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      ctx.restore();
    }
  }

  /**
   * Draw the score catch text effect
   * @param {Object|null} catchText - Catch text state with value property
   */
  drawCatchText(catchText) {
    if (!catchText || catchText.ttl <= 0) return;

    const ctx = this.ctx;
    const lift = 30 - catchText.ttl;
    const opacity = Math.min(1, catchText.ttl / 10);
    const text = String(catchText.value);

    ctx.save();
    ctx.font = '900 26px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillStyle = `rgba(0, 180, 80, ${opacity})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 180, 80, 0.6)';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.strokeText(text, catchText.x, catchText.y - lift);
    ctx.fillText(text, catchText.x, catchText.y - lift);
    ctx.restore();
  }

  /**
   * Draw the in-game HUD
   * @param {number} score - Current score
   */
  drawHUD(score) {
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(18, 18, 220, 44);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(`Zásahů: ${score}`, 30, 46);
    ctx.restore();
  }

  /**
   * Draw idle state overlay (before game starts)
   * @returns {Object} Button bounds for click detection
   */
  drawIdleOverlay() {
    const ctx = this.ctx;
    const idleText = this.options.idleText || {};

    ctx.save();

    // Dimmed background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Title
    const title = idleText.title || 'Chytej puky!';
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.font = '900 28px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, 200);

    // Subtitles (only draw if specified)
    ctx.fillStyle = COLORS.MUTED;
    ctx.font = '600 18px system-ui, -apple-system, Segoe UI, Roboto, Arial';

    let subtitleY = 235;
    if (idleText.subtitle1) {
      ctx.fillText(idleText.subtitle1, this.width / 2, subtitleY);
      subtitleY += 30;
    }
    if (idleText.subtitle2) {
      ctx.fillText(idleText.subtitle2, this.width / 2, subtitleY);
      subtitleY += 30;
    }

    // Draw start button (position adjusts based on subtitle count)
    const btnWidth = 180;
    const btnHeight = 50;
    const btnX = (this.width - btnWidth) / 2;
    const btnY = subtitleY;

    // Button background with gradient
    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight);
    btnGrad.addColorStop(0, COLORS.BRAND_PRIMARY);
    btnGrad.addColorStop(1, '#c4006a');
    ctx.fillStyle = btnGrad;
    roundedRectPath(ctx, btnX, btnY, btnWidth, btnHeight, 10);
    ctx.fill();

    // Button text
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Začít hrát', this.width / 2, btnY + 32);

    ctx.restore();

    // Return button bounds for click detection
    return {
      startButton: { x: btnX, y: btnY, width: btnWidth, height: btnHeight }
    };
  }

  /**
   * Draw end game overlay
   * @param {Object|null} overlay - Overlay data
   * @returns {Object|null} Button bounds for click detection
   */
  drawEndOverlay(overlay) {
    if (!overlay) return null;

    const ctx = this.ctx;
    const bw = 560;
    const bh = 220;
    const bx = (this.width - bw) / 2;
    const by = 150;

    ctx.save();

    // Dimmed background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Gold glow for all-time record
    if (overlay.isPersonalRecord) {
      const g = ctx.createRadialGradient(
        this.width / 2, by + bh / 2, 40,
        this.width / 2, by + bh / 2, 380
      );
      g.addColorStop(0, 'rgba(255, 193, 7, 0.22)');
      g.addColorStop(1, 'rgba(255, 193, 7, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - 80, by - 60, bw + 160, bh + 140);
    }

    // Box background
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.strokeStyle = 'rgba(48, 48, 48, 0.18)';
    ctx.lineWidth = 1.5;
    roundedRectPath(ctx, bx, by, bw, bh, 18);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = overlay.isPersonalRecord ? 'rgba(255, 211, 74, 0.98)' : COLORS.MUTED;
    ctx.font = '900 34px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.shadowColor = overlay.isPersonalRecord ? 'rgba(255, 193, 7, 0.55)' : 'transparent';
    ctx.shadowBlur = overlay.isPersonalRecord ? 16 : 0;
    ctx.fillText(overlay.title, this.width / 2, by + 60);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.MUTED;
    ctx.font = '700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(overlay.subtitle, this.width / 2, by + 94);

    // Button dimensions
    const btnWidth = 180;
    const btnHeight = 50;
    const btnY = by + 125;
    const btnGap = 12;
    const hasSecondary = !!this.options.secondaryButton?.url;

    // Calculate button positions
    let primaryX, secondaryX;
    if (hasSecondary) {
      // Two buttons side by side
      const totalWidth = btnWidth * 2 + btnGap;
      primaryX = (this.width - totalWidth) / 2;
      secondaryX = primaryX + btnWidth + btnGap;
    } else {
      // Single button centered
      primaryX = (this.width - btnWidth) / 2;
    }

    // Draw primary button (play again)
    const btnGrad = ctx.createLinearGradient(primaryX, btnY, primaryX, btnY + btnHeight);
    btnGrad.addColorStop(0, COLORS.BRAND_PRIMARY);
    btnGrad.addColorStop(1, '#c4006a');
    ctx.fillStyle = btnGrad;
    roundedRectPath(ctx, primaryX, btnY, btnWidth, btnHeight, 10);
    ctx.fill();

    // Primary button text
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Hrát znovu', primaryX + btnWidth / 2, btnY + 32);

    // Build return object
    const bounds = {
      playAgainButton: { x: primaryX, y: btnY, width: btnWidth, height: btnHeight }
    };

    // Draw secondary button if configured
    if (hasSecondary) {
      ctx.fillStyle = 'rgb(65, 55, 50)';
      roundedRectPath(ctx, secondaryX, btnY, btnWidth, btnHeight, 10);
      ctx.fill();

      // Secondary button text
      const secondaryText = this.options.secondaryButton.text || 'Zpět';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(secondaryText, secondaryX + btnWidth / 2, btnY + 32);

      bounds.secondaryButton = { x: secondaryX, y: btnY, width: btnWidth, height: btnHeight };
    }

    ctx.restore();

    return bounds;
  }
}
