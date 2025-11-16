#!/bin/bash
# Development server launcher with proper SSL configuration for macOS

export OPENSSL_DIR=/opt/homebrew/opt/openssl@3
export SSL_CERT_FILE=/opt/homebrew/etc/openssl@3/cert.pem

echo "🚀 Starting Perplexity Search Orchestrator..."
echo "📦 OpenSSL: $OPENSSL_DIR"
echo ""

npm run tauri dev

