# Innogy Puck Catcher Game

A hockey-themed mini game where players control a goalie to catch falling pucks. Built with vanilla JavaScript and HTML5 Canvas.

## Features

- **Canvas-based rendering** - Smooth 60fps animation with delta-time physics
- **Progressive difficulty** - Pucks fall faster and spawn more frequently over time
- **API leaderboard** - Scores stored via backend API (no localStorage)
- **Widget mode** - Embeddable in any webpage with isolated CSS
- **Cross-origin support** - CORS configuration for embedding on different domains
- **Responsive controls** - Mouse, keyboard (arrow keys), and touch support

## Quick Start

Simply open `index.html` in a browser or serve via any static file server.

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## Widget Embedding

Embed the game in any webpage using the widget API:

```html
<link rel="stylesheet" href="path/to/css/styles.css">
<div id="game-container"></div>

<script type="module">
  import { createGame } from 'path/to/js/widget.js';

  const { game, destroy } = createGame('#game-container', {
    showLeaderboard: true, // Show leaderboard panel (default: true)
    topText: '<strong>Welcome!</strong> Catch the pucks.',  // HTML above canvas (optional)
    bottomText: 'Use arrow keys or mouse to move.',         // HTML below canvas (optional)
    confetti: true,        // Enable confetti effects (default: true)
    apiUrl: 'https://api.example.com',     // For cross-origin API
    assetsUrl: 'https://cdn.example.com/', // For cross-origin assets
    secondaryButton: {     // Optional secondary button on end overlay
      url: 'https://example.com/back',
      target: '_self',     // _self, _blank, etc.
      text: 'Zpět'         // Button label (default: "Zpět")
    },
    idleText: {            // Optional idle overlay text
      title: 'Chytej puky!',           // Title (default: "Chytej puky!")
      subtitle1: 'Move the goalie',    // First subtitle line (optional)
      subtitle2: 'You have 3 lives'    // Second subtitle line (optional)
    }
  });

  // Clean up when done
  // destroy();
</script>
```

### Global/UMD Usage

```html
<script type="module" src="path/to/js/widget.js"></script>
<script>
  const { game, destroy } = InnogyGame.createGame('#game-container');
</script>
```

## Project Structure

```
├── index.html              # Standalone game page
├── css/
│   └── styles.css          # Styles with minigame- prefix
├── js/
│   ├── main.js             # Standalone entry point
│   ├── widget.js           # Widget/embed entry point
│   ├── game/
│   │   ├── Game.js         # Main game controller
│   │   ├── Renderer.js     # Canvas rendering
│   │   ├── Physics.js      # Collision detection
│   │   └── State.js        # Game state management
│   ├── entities/
│   │   ├── Goalie.js       # Player-controlled goalie
│   │   ├── Puck.js         # Falling pucks
│   │   ├── Goal.js         # Goal area
│   │   └── Confetti.js     # Celebration effects
│   ├── ui/
│   │   └── Leaderboard.js  # Score tracking
│   ├── services/
│   │   └── api.js          # API service (required for leaderboard)
│   └── utils/
│       ├── constants.js    # Game configuration
│       ├── helpers.js      # Utility functions
│       └── input.js        # Input handling
└── assets/
    ├── goalie-2.svg        # Goalie sprite
    └── innogy-logo-*.svg   # Brand assets
```

## Configuration

Game settings can be adjusted in `js/utils/constants.js`:

```javascript
export const GAME = {
  INITIAL_LIVES: 3,
  INITIAL_SPAWN_INTERVAL: 800,  // ms between pucks
  INITIAL_SPEED: 7.0,           // puck fall speed
  DIFFICULTY_RAMP_INTERVAL: 6000, // ms between difficulty increases
  // ...
};
```

## Controls

- **Mouse** - Move goalie left/right
- **Arrow keys** - Move goalie left/right
- **P** - Pause/resume game
- **Touch** - Drag to move goalie (mobile)

## CORS Configuration

For cross-origin widget embedding, configure your server:

### Apache (.htaccess)
```apache
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

### Nginx
```nginx
add_header Access-Control-Allow-Origin "*";
add_header Access-Control-Allow-Methods "GET, OPTIONS";
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## License

Proprietary - Innogy internal use only.
