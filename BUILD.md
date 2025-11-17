# Building Perplexity Search Orchestrator on macOS

## Prerequisites

Before building, ensure you have the following installed:

1. **Rust** (latest stable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Node.js** (v18 or later)
   ```bash
   # Using Homebrew
   brew install node
   ```

3. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

4. **OpenSSL** (required for Rust SSL support)
   ```bash
   brew install openssl@3
   ```

## Project Overview

**Perplexity Search Orchestrator** is a desktop app built with:
- **Frontend**: Vite + React + React Router + shadcn/ui
- **Backend**: Tauri 2.0 (Rust)
- **API**: Perplexity Sonar Reasoning model

### Core Features
- Scheduled Perplexity searches (hourly/daily/weekly)
- Search topic management
- Results storage and history
- Manual trigger option

## Configuration

### 1. Set Environment Variables

Create or ensure proper SSL configuration:

```bash
export OPENSSL_DIR=/opt/homebrew/opt/openssl@3
export SSL_CERT_FILE=/opt/homebrew/etc/openssl@3/cert.pem
```

### 2. API Key Setup

The app requires a Perplexity API key. You can configure it in two ways:

**Option A: Environment variable (recommended for development)**
```bash
export PERPLEXITY_API_KEY="your-api-key-here"
```

**Option B: Settings UI (production)**
- The app will store the API key in local storage
- Configure via Settings page after building

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
# Using the dev script (recommended - includes SSL config)
./dev.sh

# Or manually
npm run tauri dev
```

This will:
1. Start Vite dev server on `http://localhost:5173`
2. Compile Rust backend
3. Open the Tauri window

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

### Install the App

**Option 1: Direct Installation**
```bash
# Copy to Applications
cp -r src-tauri/target/release/bundle/macos/perplexity-search-orchestrator.app /Applications/
```

**Option 2: DMG Installer**
```bash
# Open the DMG and drag to Applications
open src-tauri/target/release/bundle/dmg/perplexity-search-orchestrator_0.1.0_universal.dmg
```

## Build Options

### Target Specific Architecture

If you want to build for a specific architecture only:

**Apple Silicon (M1/M2/M3) only:**
```bash
npm run tauri build -- --target aarch64-apple-darwin
```

**Intel only:**
```bash
npm run tauri build -- --target x86_64-apple-darwin
```

### Debug Build

For faster compilation during testing:
```bash
npm run tauri build -- --debug
```

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

## Code Signing (Optional)

For distribution outside the Mac App Store, you'll need to sign the app:

1. **Get Apple Developer Account** ($99/year)
2. **Create Developer ID Certificate** in Apple Developer Portal
3. **Configure signing in `tauri.conf.json`:**

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

4. **Build with signing:**
```bash
npm run tauri build
```

## Project Structure

```
nextjs-standalone-experiment/
├── src/                    # Frontend (Vite + React)
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Root component with React Router
│   ├── routes/            # Route components
│   ├── components/        # React components
│   ├── lib/               # Frontend utilities & types
│   └── styles/            # Global styles
├── src-tauri/             # Tauri/Rust backend
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   ├── lib.rs         # App setup
│   │   ├── commands.rs    # Tauri commands (IPC)
│   │   ├── models.rs      # Data models
│   │   ├── storage.rs     # File system operations
│   │   ├── perplexity.rs  # API client
│   │   └── scheduler.rs   # Background scheduler
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── vite.config.ts         # Vite configuration
├── package.json           # Node dependencies
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Data Storage

The app stores data locally:

```
~/Library/Application Support/com.toruaiapp.perplexity-search/
├── topics.json            # Search topics configuration
└── results/               # Search results by topic
    └── {topic-id}/
        └── {timestamp}.json
```

## Next Steps

After building:

1. **Configure API Key** - Add Perplexity API key in Settings
2. **Create Topics** - Add search topics with schedules
3. **Start Scheduler** - Enable automatic search execution
4. **View Results** - Check History for search results

## Resources

- [Tauri Documentation](https://v2.tauri.app/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Project Concept](./CONCEPT.md)
- [API Interfaces](./INTERFACES.md)

