/**
 * API Service - handles server communication
 */

// API configuration - update these URLs for your backend
const API_CONFIG = {
  // For cross-origin (CORS) usage, set full URL: 'https://yourdomain.com/api'
  // For same-origin usage, use relative path: '/api'
  baseUrl: '/api',
  endpoints: {
    init: '/game/init',      // GET - returns player info and leaderboard
    submitScore: '/game/score' // POST - submits score, returns updated leaderboard
  }
};

/**
 * API Service class
 */
export class ApiService {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - Override default API base URL (for CORS)
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || API_CONFIG.baseUrl;
    this.playerId = null;
    this.playerName = null;
  }

  /**
   * Set the API base URL (useful for widget/cross-origin usage)
   * @param {string} url - Full API URL (e.g., 'https://yourdomain.com/api')
   */
  setBaseUrl(url) {
    this.baseUrl = url;
  }

  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Detect if this is a cross-origin request
    const isCrossOrigin = this.baseUrl.startsWith('http') &&
      !this.baseUrl.startsWith(window.location.origin);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // For cross-origin: use 'include' to send cookies, 'omit' if not needed
      // For same-origin: use 'same-origin'
      credentials: isCrossOrigin ? 'include' : 'same-origin',
      // Explicitly set CORS mode for cross-origin requests
      mode: isCrossOrigin ? 'cors' : 'same-origin'
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Initialize game - get player info and leaderboard
   * Called on page load
   *
   * Expected response:
   * {
   *   player: {
   *     id: "abc123",
   *     name: "Pavel",
   *     bestScore: 42
   *   },
   *   leaderboard: [
   *     { rank: 1, name: "Jan", score: 156, date: "2026-01-20" },
   *     { rank: 2, name: "Marie", score: 142, date: "2026-01-19" },
   *     ...
   *   ]
   * }
   *
   * @returns {Promise<Object>} Player info and leaderboard data
   */
  async init() {
    try {
      const data = await this.request(API_CONFIG.endpoints.init, {
        method: 'GET'
      });

      // Store player info
      if (data.player) {
        this.playerId = data.player.id;
        this.playerName = data.player.name;
      }

      return data;
    } catch (error) {
      console.warn('Failed to initialize from API, using local storage fallback');
      return null;
    }
  }

  /**
   * Submit score to server
   * Only submits if score is player's personal best (handled by server)
   *
   * Request body:
   * {
   *   playerId: "abc123",
   *   playerName: "Pavel",
   *   score: 52
   * }
   *
   * Expected response:
   * {
   *   success: true,
   *   isNewRecord: true,
   *   player: {
   *     id: "abc123",
   *     name: "Pavel",
   *     bestScore: 52
   *   },
   *   leaderboard: [
   *     { rank: 1, name: "Jan", score: 156, date: "2026-01-20" },
   *     { rank: 2, name: "Pavel", score: 52, date: "2026-01-20" },
   *     ...
   *   ]
   * }
   *
   * @param {string} playerName - Player name
   * @param {number} score - Score to submit
   * @returns {Promise<Object>} Updated leaderboard data
   */
  async submitScore(playerName, score) {
    try {
      const data = await this.request(API_CONFIG.endpoints.submitScore, {
        method: 'POST',
        body: JSON.stringify({
          playerId: this.playerId,
          playerName: playerName || this.playerName || 'Anonym',
          score: score
        })
      });

      // Update stored player info if returned
      if (data.player) {
        this.playerId = data.player.id;
        this.playerName = data.player.name;
      }

      return data;
    } catch (error) {
      console.warn('Failed to submit score to API, using local storage fallback');
      return null;
    }
  }

  /**
   * Check if API is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.playerId !== null;
  }

  /**
   * Get stored player name
   * @returns {string|null}
   */
  getPlayerName() {
    return this.playerName;
  }

  /**
   * Get stored player ID
   * @returns {string|null}
   */
  getPlayerId() {
    return this.playerId;
  }
}

// Singleton instance
export const apiService = new ApiService();
