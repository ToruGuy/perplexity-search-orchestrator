# Dog Image Viewer

A simple Electron application built with Electron-Vite, React, TypeScript, and shadcn/ui components to view random dog images from [random.dog](https://random.dog/woof.json).

## Features

- 🐕 View random dog images
- 🎨 Beautiful UI with shadcn/ui components
- ⚡ Fast development with Electron-Vite
- 📦 Standalone application support

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Package standalone application
npm run package
```

## Project Structure

```
dog-image-viewer/
├── src/
│   ├── main/          # Electron main process
│   ├── preload/       # Preload scripts
│   └── renderer/      # React renderer process
├── electron.vite.config.ts
└── package.json
```

## Building Standalone Application

The project is configured with `electron-builder` to create standalone applications for:
- Windows (NSIS installer)
- macOS (DMG)
- Linux (AppImage, DEB)

Run `npm run package` to build standalone applications.


