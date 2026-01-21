# Changelog

All notable changes to the Innogy Puck Catcher Game.

## [2026-01-20] - Current Session

### Added

#### API Integration
- **New file: `js/services/api.js`** - API service for server communication
  - `GET /api/game/init` - Fetches player info and leaderboard on page load
  - `POST /api/game/score` - Submits player score, returns updated leaderboard
  - Graceful fallback to localStorage when API unavailable

#### Visual Effects
- **Goal flash effect** - Red radial gradient flash when puck enters goal
  - Added `goalFlash` property to `Goal.js`
  - Added `triggerGoal()`, `update(delta)`, `reset()` methods
- **Goalie catch effect** - Changed from pink/purple to green color scheme

#### Canvas Toolbar
- New toolbar overlay on top of canvas displaying:
  - Zákroky (score)
  - Životy (lives)
  - Tvůj rekord (best score)
- Icon-only control buttons:
  - Pause/Play toggle (SVG icons swap based on state)
  - Restart button (reload icon)

#### Game Mechanics
- **Delta time implementation** - Frame-rate independent game speed
  - All physics, spawning, and animations now use millisecond-based timing
  - Consistent gameplay across different refresh rates (60Hz, 120Hz, etc.)

#### Widget/Embed Support
- **New file: `js/widget.js`** - Widget entry point for embedding game in any container
  - `createGame(container, options)` - Creates game in specified container
  - Dynamically builds all HTML structure
  - Configurable options: `showHeader`, `showLeaderboard`, `title`, `subtitle`, `showHelp`, `apiUrl`, `assetsUrl`
  - Returns `{ game, destroy() }` for lifecycle control
  - Also exports as `window.InnogyGame.createGame()` for non-module usage

#### CORS Support
- **Updated `js/services/api.js`** - Cross-origin API support for widget embedding
  - Auto-detects cross-origin requests and sets appropriate `mode` and `credentials`
  - `setBaseUrl(url)` method to configure API URL at runtime
  - Widget `apiUrl` option to specify full API URL for cross-origin usage
- **Updated `js/game/Renderer.js`** - Cross-origin asset loading
  - `setAssetsBaseUrl(url)` function to configure base URL for images
  - Widget `assetsUrl` option to load goalie.svg and logo from correct origin
  - Added `crossOrigin = 'anonymous'` to images for CORS compatibility

### Changed

#### Leaderboard
- Now stores only personal records (best score per player name)
- Case-insensitive player name matching
- Async/await pattern for API calls with localStorage fallback

#### CSS Namespacing
- All CSS selectors prefixed with `minigame-` to avoid collisions when embedded
- Updated class names:
  - `.wrap` → `.minigame-wrap`
  - `.card` → `.minigame-card`
  - `.header` → `.minigame-header`
  - `.brand` → `.minigame-brand`
  - `.logo` → `.minigame-logo`
  - `.sub` → `.minigame-sub`
  - `.game-container` → `.minigame-game-container`
  - `.canvas-toolbar` → `.minigame-canvas-toolbar`
  - `.toolbar-stats` → `.minigame-toolbar-stats`
  - `.toolbar-stat` → `.minigame-toolbar-stat`
  - `.toolbar-label` → `.minigame-toolbar-label`
  - `.toolbar-val` → `.minigame-toolbar-val`
  - `.toolbar-controls` → `.minigame-toolbar-controls`
  - `.toolbar-btn` → `.minigame-toolbar-btn`
  - `.help` → `.minigame-help`
  - `.top-three` → `.minigame-top-three`

#### Game.js
- `init()` now async - loads player data from API
- `end()` now async - submits score to API
- Added `updatePauseButton()` method for icon swapping
- Leaderboard now optional (supports widget mode without leaderboard)

### Removed

- **Status pill element** - Removed `<div class="pill" id="statusPill">` and all related code
- **Old stats/controls divs** - Replaced by canvas toolbar
- **Old `.stats` and `.controls` CSS** - No longer needed

### Files Modified

| File | Changes |
|------|---------|
| `index.html` | Canvas toolbar structure, removed status pill, prefixed classes |
| `css/styles.css` | Toolbar styles, prefixed all selectors with `minigame-` |
| `js/main.js` | Removed statusPill, exports `init()` function |
| `js/widget.js` | **NEW** - Widget entry point for embedding |
| `js/game/Game.js` | Async init/end, updatePauseButton(), goal integration |
| `js/game/Renderer.js` | Green goalie flash, red goal flash effects |
| `js/game/State.js` | Millisecond-based spawn/difficulty timers |
| `js/entities/Goal.js` | goalFlash state and methods |
| `js/entities/Goalie.js` | Delta time for animations |
| `js/entities/Confetti.js` | Delta time for particle physics |
| `js/ui/Leaderboard.js` | API integration, records only, prefixed class |
| `js/services/api.js` | **NEW** - API service |

### API Contract

#### GET /api/game/init
Response:
```json
{
  "player": {
    "id": "abc123",
    "name": "Pavel",
    "bestScore": 42
  },
  "leaderboard": [
    { "rank": 1, "name": "Jan", "score": 156, "date": "2026-01-20" },
    { "rank": 2, "name": "Marie", "score": 142, "date": "2026-01-19" }
  ]
}
```

#### POST /api/game/score
Request:
```json
{
  "playerId": "abc123",
  "playerName": "Pavel",
  "score": 52
}
```

Response:
```json
{
  "success": true,
  "isNewRecord": true,
  "player": {
    "id": "abc123",
    "name": "Pavel",
    "bestScore": 52
  },
  "leaderboard": [...]
}
```

### Widget Usage

#### ES Module
```html
<link rel="stylesheet" href="path/to/minigame/css/styles.css">
<div id="game-container"></div>
<script type="module">
  import { createGame } from 'path/to/minigame/js/widget.js';

  const { game, destroy } = createGame('#game-container', {
    showHeader: true,      // Show logo and title (default: true)
    showLeaderboard: true, // Show leaderboard panel (default: true)
    title: 'Custom Title', // Optional custom title
    showHelp: true,        // Show controls help text (default: true)
    apiUrl: 'https://yourdomain.com/api',      // For cross-origin API calls
    assetsUrl: 'https://yourdomain.com/gamifikace/' // For cross-origin image loading
  });

  // Later, to clean up:
  // destroy();
</script>
```

#### Global/UMD
```html
<link rel="stylesheet" href="path/to/minigame/css/styles.css">
<div id="game-container"></div>
<script type="module" src="path/to/minigame/js/widget.js"></script>
<script>
  // After module loads, InnogyGame is available globally
  const { game, destroy } = InnogyGame.createGame('#game-container');
</script>
```

### Cross-Origin Widget Embedding (CORS)

When embedding the widget on a **different domain** than where the game files are hosted, you need to configure CORS headers on the server hosting the game files.

#### Apache (.htaccess)
Add this to the `.htaccess` file in the game directory:

```apache
# Enable CORS for widget embedding
<IfModule mod_headers.c>
  # Allow specific origin (recommended for production)
  # Header set Access-Control-Allow-Origin "https://your-embedding-site.com"

  # Or allow all origins (less secure, but simpler)
  Header set Access-Control-Allow-Origin "*"

  # Required for ES modules
  Header set Access-Control-Allow-Methods "GET, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>

# Ensure correct MIME types for JS modules
<IfModule mod_mime.c>
  AddType application/javascript .js
</IfModule>
```

#### Nginx
Add this to your server block:

```nginx
location /path/to/minigame/ {
    # Allow specific origin (recommended)
    # add_header Access-Control-Allow-Origin "https://your-embedding-site.com";

    # Or allow all origins
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type "text/plain; charset=utf-8";
        add_header Content-Length 0;
        return 204;
    }
}
```

#### Node.js/Express
```javascript
const cors = require('cors');

// Allow all origins
app.use('/minigame', cors());

// Or specific origin
app.use('/minigame', cors({
  origin: 'https://your-embedding-site.com'
}));
```

#### PHP (if serving files via PHP)
Add at the top of your PHP file or in a common include:

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
?>
```

#### Important Notes

1. **Security**: Using `*` for `Access-Control-Allow-Origin` allows any website to embed your game. For production, specify the exact domains that should be allowed.

2. **Caching**: After adding CORS headers, clear your browser cache and try again.

3. **HTTPS**: Both the game server and the embedding site should use HTTPS for best compatibility.

4. **CSS file**: The CSS file (`styles.css`) also needs CORS headers if loaded cross-origin.
