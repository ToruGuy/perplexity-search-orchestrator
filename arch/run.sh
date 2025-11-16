#!/bin/bash
# Run script that activates venv and runs the scraper

set -e

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Running setup..."
    ./setup.sh
fi

# Activate virtual environment
source .venv/bin/activate

# Run the scraper
python3 scrape_docs.py


