#!/usr/bin/env python3
"""
Script to scrape electron-vite documentation and save as markdown files.
"""

import sys

# Ensure Python 3 is being used
if sys.version_info < (3, 7):
    print("Error: This script requires Python 3.7 or higher")
    sys.exit(1)

import os
import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import html2text

BASE_URL = "https://electron-vite.org"
START_URL = "https://electron-vite.org/guide/#overview"
OUTPUT_DIR = "docs"

# Headers to mimic a browser request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def sanitize_filename(filename):
    """Convert a string to a valid filename."""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove leading/trailing spaces and dots
    filename = filename.strip(' .')
    # Replace spaces with underscores
    filename = re.sub(r'\s+', '_', filename)
    # Limit length
    if len(filename) > 200:
        filename = filename[:200]
    return filename or "index"

def html_to_markdown(soup, url):
    """Convert HTML content to markdown format."""
    # Find the main content area
    # Try common content selectors
    content_selectors = [
        'main',
        'article',
        '.content',
        '#content',
        '.main-content',
        'body'
    ]
    
    content = None
    for selector in content_selectors:
        content = soup.select_one(selector)
        if content:
            break
    
    if not content:
        content = soup.find('body')
    
    if not content:
        return "# Documentation\n\nContent not found."
    
    # Remove navigation, footer, header, sidebar
    for elem in content.find_all(['nav', 'footer', 'header', 'aside', 'script', 'style']):
        elem.decompose()
    
    # Configure html2text converter
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = False
    h.body_width = 0  # Don't wrap lines
    h.unicode_snob = True
    h.skip_internal_links = False
    
    # Convert to markdown
    markdown_content = h.handle(str(content))
    
    # Add title at the top if available
    title = soup.find('title')
    if title:
        title_text = title.get_text().strip()
        if title_text and not markdown_content.startswith('#'):
            markdown_content = f"# {title_text}\n\n{markdown_content}"
    
    # Add source URL at the bottom
    markdown_content += f"\n\n---\n\nSource: [{url}]({url})"
    
    # Clean up excessive newlines
    markdown_content = re.sub(r'\n{4,}', '\n\n\n', markdown_content)
    
    return markdown_content.strip()

def scrape_page(url, visited_urls):
    """Scrape a single page and return its content and links."""
    if url in visited_urls:
        return None, []
    
    print(f"Scraping: {url}")
    visited_urls.add(url)
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract markdown content
        markdown_content = html_to_markdown(soup, url)
        
        # Find all documentation links
        doc_links = set()
        base_domain = urlparse(BASE_URL).netloc
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(BASE_URL, href)
            parsed = urlparse(full_url)
            
            # Only include links from the same domain and documentation paths
            if parsed.netloc == base_domain:
                # Remove fragment
                clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                if '/guide/' in clean_url or '/config/' in clean_url or '/api/' in clean_url:
                    doc_links.add(clean_url)
        
        return markdown_content, list(doc_links)
    
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None, []

def save_markdown(content, url, output_dir):
    """Save markdown content to a file."""
    if not content:
        return None
    
    # Generate filename from URL
    parsed = urlparse(url)
    path_parts = [p for p in parsed.path.split('/') if p]
    
    if path_parts:
        filename = path_parts[-1] if path_parts[-1] else 'index'
    else:
        filename = 'index'
    
    # Remove hash fragments
    filename = filename.split('#')[0]
    filename = sanitize_filename(filename)
    
    if not filename.endswith('.md'):
        filename += '.md'
    
    filepath = os.path.join(output_dir, filename)
    
    # Ensure directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Saved: {filepath}")
    return filepath

def main():
    """Main scraping function."""
    print("Starting electron-vite documentation scraper...")
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    visited_urls = set()
    to_visit = [START_URL]
    
    # Remove hash from start URL for initial visit
    start_url_clean = START_URL.split('#')[0]
    if start_url_clean not in to_visit:
        to_visit.append(start_url_clean)
    
    while to_visit:
        url = to_visit.pop(0)
        
        if url in visited_urls:
            continue
        
        content, links = scrape_page(url, visited_urls)
        
        if content:
            save_markdown(content, url, OUTPUT_DIR)
        
        # Add new links to visit
        for link in links:
            if link not in visited_urls:
                to_visit.append(link)
        
        # Be polite - small delay between requests
        time.sleep(0.5)
    
    print(f"\nScraping complete! Files saved to {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()

