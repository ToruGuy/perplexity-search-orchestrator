# Perplexity Search Orchestrator

A cross-platform desktop app for scheduling and managing automated Perplexity AI searches.

## Features

- 📅 **Scheduled Searches** - Automate searches on hourly, daily, or weekly intervals
- 🔍 **Topic Management** - Create and manage multiple search topics
- 📊 **Search History** - View and browse all past search results
- 🚀 **Manual Triggers** - Run searches on demand
- 💾 **Local Storage** - All data stored securely on your machine

## Tech Stack

- **Frontend**: Vite + React + React Router + shadcn/ui
- **Backend**: Tauri 2.0 (Rust)
- **API**: Perplexity Sonar Reasoning model

## Prerequisites

Follow the [Tauri Prerequisites Guide](https://tauri.app/start/prerequisites/) for your platform to install:
- Rust (latest stable)
- System dependencies (Xcode Command Line Tools on macOS, WebView2 on Windows, webkit2gtk on Linux)
- Node.js v18+

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Configuration

### API Key

Configure your Perplexity API key via the Settings page in the app. The key is stored securely in:

**macOS**: `~/Library/Application Support/com.toruaiapp.perplexity-search/`  
**Windows**: `%APPDATA%\com.toruaiapp.perplexity-search\`  
**Linux**: `~/.local/share/com.toruaiapp.perplexity-search/`

## Project Structure

```
nextjs-standalone-experiment/
├── src/                    # Frontend (Vite + React)
│   ├── routes/            # Page components
│   ├── components/        # React components + shadcn/ui
│   └── lib/               # Utilities, types, Tauri API wrappers
└── src-tauri/             # Backend (Rust)
    ├── src/
    │   ├── commands.rs    # Tauri IPC commands
    │   ├── scheduler.rs   # Background task scheduler
    │   ├── perplexity.rs  # API client
    │   └── storage.rs     # File operations
    └── tauri.conf.json    # Tauri configuration
```

## Development Scripts

```bash
# Development with hot reload
npm run tauri dev

# Build frontend only
npm run build

# Run Rust tests
cd src-tauri && cargo test

# Clean build cache
cd src-tauri && cargo clean
```

## Troubleshooting

### macOS OpenSSL Issues

If you encounter SSL-related build errors:

```bash
brew install openssl@3
export OPENSSL_DIR=/opt/homebrew/opt/openssl@3
export SSL_CERT_FILE=/opt/homebrew/etc/openssl@3/cert.pem
```

### Rust Not Found

Ensure Rust is in your PATH:

```bash
source $HOME/.cargo/env
```

### Build Cache Issues

Clean and rebuild:

```bash
rm -rf dist node_modules
npm install
npm run build
```

## CI/CD

The project includes GitHub Actions workflows for:
- **CI** (`.github/workflows/ci.yml`) - Tests and builds on PRs
- **Release** (`.github/workflows/release.yml`) - Creates multi-platform releases

See workflow files for configuration details.

## Resources

- [Tauri Documentation](https://v2.tauri.app/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Perplexity API Docs](https://docs.perplexity.ai/)

## License

MIT
