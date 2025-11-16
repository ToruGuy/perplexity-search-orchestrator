# Electron-Vite Documentation Scraper

A simple script to scrape the entire electron-vite documentation and save it as markdown files.

## Prerequisites

- Python 3.7 or higher
- [uv](https://github.com/astral-sh/uv) - Fast Python package installer

Install uv:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Quick Start

### Option 1: Using the setup and run scripts

```bash
# Setup virtual environment and install dependencies
./setup.sh

# Run the scraper
./run.sh
```

### Option 2: Manual setup

```bash
# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Run the scraper
python3 scrape_docs.py
```

## Output

All scraped documentation will be saved as markdown files in the `docs/` directory.

## How it works

1. Starts from the overview page: `https://electron-vite.org/guide/#overview`
2. Crawls all documentation pages (guide, config, api sections)
3. Converts HTML to markdown using `html2text`
4. Saves each page as a separate `.md` file
5. Includes source URLs at the bottom of each file


