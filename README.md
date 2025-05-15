# Kanji Practice Application

A web application for practicing Japanese kanji and vocabulary using data from WaniKani. This tool helps users improve their Japanese language skills through interactive practice sessions.

## Features

- Practice kanji and vocabulary based on WaniKani levels
- Keyboard navigation for efficient practice
- Mark items for later review
- Audio playback for vocabulary items
- Responsive design for desktop and mobile devices
- Dark mode UI for comfortable viewing

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4
- **Routing**: React Router 7
- **State Management**: React Context API
- **Data Storage**: IndexedDB (via idb)
- **API Integration**: WaniKani API
- **Audio**: react-use-audio-player
- **Japanese Text Processing**: wanakana
- **Other Utilities**:
  - usehooks-ts (custom React hooks)
  - async-cache-dedupe (API request deduplication)

## Installation

```bash
# Clone the repository
git clone https://github.com/FrecksterGIT/bc-kanji-practice.git

# Navigate to the project directory
cd bc-kanji-practice

# Install dependencies
npm ci

# Start the development server
npm run dev
```

## Development

### NPM Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally
- `npm run semantic-release` - Run semantic-release for versioning

### GitHub Workflow

The project uses GitHub Actions for CI/CD:

#### Pull Request Workflow

When a pull request is created against the main branch, the following steps are executed:

1. Code checkout
2. Node.js setup
3. Dependencies installation
4. Linting
5. Test build

#### Deployment Workflow

When code is pushed to the main branch, the following steps are executed:

1. Code checkout
2. Node.js setup
3. Dependencies installation
4. Linting
5. Test build
6. Semantic versioning
7. Production build
8. Deployment to production server via FTP

## Usage

1. Visit the application and log in with your WaniKani API key
2. Select a level to practice
3. Practice kanji or vocabulary by typing the readings
4. Use keyboard shortcuts for navigation:
   - Arrow keys to navigate through items
   - Alt + Up/Down to change levels
   - Alt + M to mark items for later review
5. Review marked items in the "Marked Items" section

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
