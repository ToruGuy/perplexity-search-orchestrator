#!/bin/bash
# Setup script using uv for virtual environment and dependencies

set -e

echo "Setting up Python environment with uv..."

# Create virtual environment using uv
uv venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies using uv
uv pip install -r requirements.txt

echo ""
echo "Setup complete! To run the scraper:"
echo "  source .venv/bin/activate"
echo "  python3 scrape_docs.py"
echo ""
echo "Or use the run script:"
echo "  ./run.sh"


