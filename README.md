# Perplexity Search Orchestrator

A desktop application for scheduling and managing automated Perplexity AI searches using Tauri 2.0.

## Overview

**Perplexity Search Orchestrator** is a cross-platform desktop app that allows you to:
- Schedule automated Perplexity AI searches (hourly, daily, or weekly intervals)
- Manage search topics with custom queries
- View search history and results
- Trigger manual searches on demand
- Store all results locally in JSON format

## Tech Stack

- **Frontend**: Vite + React + React Router + shadcn/ui components
- **Backend**: Tauri 2.0 (Rust)
- **API**: Perplexity Sonar Reasoning model via HTTP
- **Storage**: JSON files in AppData directory

## Prerequisites

Before building, ensure you have:

1. **Rust** (latest stable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Node.js** (v18 or later)
   ```bash
   brew install node  # macOS
   ```

3. **Xcode Command Line Tools** (macOS)
   ```bash
   xcode-select --install
   ```

4. **OpenSSL** (required for Rust SSL support)
   ```bash
   brew install openssl@3
   ```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-standalone-experiment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for development)
   ```bash
   export OPENSSL_DIR=/opt/homebrew/opt/openssl@3
   export SSL_CERT_FILE=/opt/homebrew/etc/openssl@3/cert.pem
   export PERPLEXITY_API_KEY="your-api-key-here"
   ```

## Development

### Run Development Server

```bash
npm run tauri dev
```

This will:
1. Start Vite dev server on `http://localhost:5173`
2. Compile Rust backend
3. Open the Tauri window

### Development Script

For convenience, use the provided dev script (includes SSL configuration):

```bash
./dev.sh
```

## Building for Production

### Build the App

```bash
# Set OpenSSL environment (if not in shell profile)
export OPENSSL_DIR=/opt/homebrew/opt/openssl@3
export SSL_CERT_FILE=/opt/homebrew/etc/openssl@3/cert.pem

# Build the application
npm run tauri build
```

### Build Process

The build command will:
1. **Build Vite frontend** → outputs to `./dist` directory
2. **Compile Rust backend** → creates optimized binary
3. **Bundle the app** → creates macOS `.app` and `.dmg`

### Build Output

After successful build, find your app at:

```
src-tauri/target/release/bundle/
├── dmg/                              # macOS DMG installer
│   └── perplexity-search-orchestrator_0.1.0_universal.dmg
└── macos/                            # macOS .app bundle
    └── perplexity-search-orchestrator.app
```

**Universal Binary**: By default, Tauri builds a universal binary that works on both Intel and Apple Silicon Macs.

## Configuration

### API Key Setup

The app requires a Perplexity API key. Configure it via the Settings page in the app UI. The API key is securely stored in the app's data directory.

**Settings Location**: `~/Library/Application Support/com.toruaiapp.perplexity-search/`

## Project Structure

```
nextjs-standalone-experiment/
├── src/                              # Frontend (Vite + React)
│   ├── main.tsx                      # Entry point
│   ├── App.tsx                       # Root component with React Router
│   ├── routes/                       # Route components
│   │   ├── Home.tsx                  # Topics list
│   │   ├── TopicNew.tsx              # Create topic
│   │   ├── TopicDetails.tsx          # View topic
│   │   ├── TopicEdit.tsx             # Edit topic
│   │   ├── History.tsx               # Search history
│   │   ├── ResultDetails.tsx        # View result
│   │   └── Settings.tsx              # Settings
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── Nav.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── lib/                          # Frontend utilities
│   │   ├── types.ts                  # TypeScript types
│   │   ├── api.ts                    # Tauri invoke wrappers
│   │   ├── events.ts                 # Event handlers
│   │   └── app-context.tsx           # React Context
│   └── styles/
│       └── globals.css               # Tailwind + global styles
├── src-tauri/                        # Backend (Rust)
│   ├── src/
│   │   ├── lib.rs                    # Main entry, setup
│   │   ├── commands.rs               # Tauri commands
│   │   ├── models.rs                 # Data structures
│   │   ├── state.rs                  # App state management
│   │   ├── storage.rs                # File I/O operations
│   │   ├── perplexity.rs             # API client
│   │   ├── scheduler.rs              # Background scheduler
│   │   └── tests/                    # Unit & integration tests
│   ├── capabilities/
│   │   └── default.json              # Permissions config
│   ├── Cargo.toml                    # Rust dependencies
│   └── tauri.conf.json               # Tauri configuration
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Node dependencies
```

## Data Storage

The app stores data locally in the AppData directory:

```
~/Library/Application Support/com.toruaiapp.perplexity-search/
├── topics.json                       # Search topics configuration
├── api_key.txt                       # API key (encrypted)
└── results/                          # Search results by topic
    └── {topic-id}/
        └── {timestamp}.json
```

## Features

- ✅ **Topic Management**: Create, edit, delete, and toggle search topics
- ✅ **Scheduled Searches**: Automatic execution on hourly, daily, or weekly intervals
- ✅ **Manual Triggers**: Run searches on demand
- ✅ **Search History**: View all past search results
- ✅ **Result Storage**: All results saved locally in JSON format
- ✅ **Real-time Updates**: Toast notifications for background operations
- ✅ **Settings**: API key management and configuration

## Usage

1. **Configure API Key**: Go to Settings and add your Perplexity API key
2. **Create Topics**: Add search topics with custom queries and intervals
3. **Start Scheduler**: Enable automatic search execution
4. **View Results**: Check History for all search results
5. **Manual Searches**: Trigger searches manually from topic details page

## Troubleshooting

### OpenSSL Errors

If you encounter SSL-related errors:

```bash
# Ensure OpenSSL is installed
brew install openssl@3

# Set environment variables
export OPENSSL_DIR=/opt/homebrew/opt/openssl@3
export SSL_CERT_FILE=/opt/homebrew/etc/openssl@3/cert.pem
export PKG_CONFIG_PATH=/opt/homebrew/opt/openssl@3/lib/pkgconfig
```

### Build Fails with "command not found: cargo"

Ensure Rust is in your PATH:

```bash
source $HOME/.cargo/env
```

### Vite Build Errors

Clear cache and rebuild:

```bash
rm -rf dist node_modules
npm install
npm run build
```

### Tauri Cache Issues

Clean Tauri build cache:

```bash
cd src-tauri
cargo clean
cd ..
npm run tauri build
```

## Resources

- [Tauri Documentation](https://v2.tauri.app/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Project Concept](./CONCEPT.md)
- [API Interfaces](./INTERFACES.md)
- [Build Instructions](./BUILD.md)

## License

[Add your license here]

