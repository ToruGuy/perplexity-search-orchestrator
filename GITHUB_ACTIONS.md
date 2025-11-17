# GitHub Actions CI/CD Guide

This project uses GitHub Actions to automate building and releasing the Perplexity Search Orchestrator across multiple platforms.

## Table of Contents

- [Workflows](#workflows)
- [Release Process](#release-process)
- [Platform Support](#platform-support)
- [Build Artifacts](#build-artifacts)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Workflows

### 1. Release Workflow (`.github/workflows/release.yml`)

Automatically builds and releases your app for all supported platforms.

**Triggers:**
- Push to `release` branch
- Push of version tags (e.g., `v1.0.0`)
- Manual trigger via GitHub UI (workflow_dispatch)

**What it does:**
- Builds the app for Windows, macOS (Intel + Apple Silicon), and Linux
- Creates a GitHub Release with all build artifacts
- Uses the version from `package.json` and `tauri.conf.json`
- Creates a draft release for review before publishing

### 2. CI Workflow (`.github/workflows/ci.yml`)

Runs tests and builds on every pull request and push to main branches.

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**What it does:**
- Runs Rust unit tests
- Builds the frontend
- Compiles the Tauri app (without bundling)
- Validates the build works on all platforms

## Release Process

### Option 1: Tag-Based Release

1. **Update version** in both files:
   ```bash
   # Update package.json
   npm version patch  # or minor, or major
   
   # Make sure src-tauri/tauri.conf.json version matches
   ```

2. **Commit and push the version bump**:
   ```bash
   git add package.json src-tauri/tauri.conf.json package-lock.json
   git commit -m "chore: bump version to v1.0.1"
   git push origin main
   ```

3. **Create and push a version tag**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **Wait for the workflow** to complete (check Actions tab on GitHub)

5. **Review the draft release** and publish it when ready

### Option 2: Branch-Based Release

1. **Create a release branch**:
   ```bash
   git checkout -b release
   git push origin release
   ```

2. The workflow automatically triggers and creates a draft release

3. Review and publish the release on GitHub

### Option 3: Manual Trigger

1. Go to **Actions** tab on GitHub
2. Select **Release Builds** workflow
3. Click **Run workflow**
4. Select the branch to build from
5. Click **Run workflow** button

## Platform Support

### macOS

**Builds:**
- Apple Silicon (M1/M2/M3/M4) - `aarch64-apple-darwin`
- Intel Macs - `x86_64-apple-darwin`

**Output:**
- `.dmg` installer files
- `.app` bundles

**Requirements:**
- macOS 10.13+ for Intel
- macOS 11+ for Apple Silicon

### Windows

**Builds:**
- Windows x64

**Output:**
- `.msi` installer
- `.exe` (standalone executable)

**Requirements:**
- Windows 10+

### Linux

**Builds:**
- x86_64 (Intel/AMD 64-bit)

**Output:**
- `.AppImage` (universal)
- `.deb` (Debian/Ubuntu)
- `.rpm` (Fedora/RedHat)

**Requirements:**
- Modern Linux distribution with GTK 3.24+

## Build Artifacts

After a successful release build, you'll find these artifacts in your GitHub Release:

```
├── perplexity-search-orchestrator_0.1.0_aarch64.dmg       # macOS Apple Silicon
├── perplexity-search-orchestrator_0.1.0_x64.dmg           # macOS Intel
├── perplexity-search-orchestrator_0.1.0_x64_en-US.msi     # Windows installer
├── perplexity-search-orchestrator_0.1.0_amd64.AppImage    # Linux AppImage
├── perplexity-search-orchestrator_0.1.0_amd64.deb         # Linux Debian/Ubuntu
└── perplexity-search-orchestrator_0.1.0_x86_64.rpm        # Linux Fedora/RedHat
```

## Configuration

### Customizing the Workflows

#### Change Node.js Version

Edit the `node-version` in both workflows:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

#### Add Additional Platforms

For Linux ARM64 support (requires GitHub public repos or self-hosted runners):

```yaml
- platform: 'ubuntu-22.04-arm'
  args: ''
```

#### Modify Release Notes

Edit the `releaseBody` in `release.yml`:

```yaml
releaseBody: |
  Your custom release notes here
```

#### Change Release Settings

```yaml
releaseDraft: false    # Publish immediately instead of draft
prerelease: true       # Mark as pre-release
```

### Environment Variables

If your app needs build-time environment variables (like API keys for services), add them to the workflow:

```yaml
- name: Build and Release Tauri App
  uses: tauri-apps/tauri-action@v0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    VITE_API_URL: ${{ secrets.API_URL }}  # Add custom secrets
```

Then add the secret in GitHub:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your secret

## Troubleshooting

### Build Fails on macOS

**Issue:** Cross-compilation targets not installed

**Solution:** The workflow automatically installs required targets, but if it fails:
```yaml
targets: 'aarch64-apple-darwin,x86_64-apple-darwin'
```

### Build Fails on Linux

**Issue:** Missing system dependencies

**Solution:** Add any missing dependencies to the Ubuntu step:
```yaml
- name: Install dependencies (Ubuntu only)
  if: matrix.platform == 'ubuntu-22.04'
  run: |
    sudo apt-get update
    sudo apt-get install -y [your-dependencies]
```

### Build Fails on Windows

**Issue:** OpenSSL or other native dependencies

**Solution:** Windows runners come with most dependencies. For OpenSSL specifically, `tauri-action` handles it automatically.

### Release Not Created

**Issue:** No release appears after workflow completes

**Solution:** Check the following:
1. Workflow has `contents: write` permission ✅ (already configured)
2. `GITHUB_TOKEN` is available ✅ (automatically provided)
3. Version format is correct in `tauri.conf.json`

### Version Mismatch

**Issue:** Version in release doesn't match expected

**Solution:** Ensure version is consistent across:
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

Use this script to sync versions:

```bash
#!/bin/bash
VERSION="0.1.0"
jq ".version = \"$VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json
jq ".version = \"$VERSION\"" src-tauri/tauri.conf.json > src-tauri/tauri.conf.json.tmp && mv src-tauri/tauri.conf.json.tmp src-tauri/tauri.conf.json
sed -i '' "s/^version = .*/version = \"$VERSION\"/" src-tauri/Cargo.toml
```

### Cache Issues

**Issue:** Builds are slow or failing due to cache corruption

**Solution:** Clear the Rust cache:
1. Go to **Actions** → **Caches**
2. Delete relevant caches
3. Re-run the workflow

## Workflow Status Badges

Add build status badges to your README:

```markdown
![Release](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/release.yml/badge.svg)
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)
```

## Advanced: Universal macOS Binary

The current workflow builds separate binaries for Intel and Apple Silicon. To create a universal binary:

```yaml
- platform: 'macos-latest'
  args: '--target universal-apple-darwin'
```

Note: This requires both architectures to be built and then combined using `lipo`.

## Resources

- [Tauri Action GitHub](https://github.com/tauri-apps/tauri-action)
- [Tauri Build Documentation](https://v2.tauri.app/distribute/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tauri Configuration Reference](https://v2.tauri.app/reference/config/)

## Next Steps

1. **Test the workflows**: Push to `release` branch or create a tag
2. **Review draft releases**: Check the build artifacts before publishing
3. **Set up auto-updates**: Configure Tauri's updater to check for new releases
4. **Add code signing**: For production apps, add code signing for macOS and Windows

## Code Signing (Production)

For production releases, you'll want to add code signing:

### macOS Code Signing

Add to your workflow:

```yaml
env:
  APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
  APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
  APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

### Windows Code Signing

Add to your workflow:

```yaml
env:
  TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
```

See [Tauri Code Signing Docs](https://v2.tauri.app/distribute/sign/) for detailed setup instructions.

