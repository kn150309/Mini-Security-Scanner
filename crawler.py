import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def crawl_website(start_url, max_pages=20):
    """
    Crawl các link cùng domain từ start_url.
    Trả về danh sách URL mới tìm được.
    """
    visited = set()
    to_visit = [start_url]
    found_urls = []

    base_netloc = urlparse(start_url).netloc

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)

        if url in visited:
            continue

        visited.add(url)

        try:
            response = requests.get(url, timeout=5)

            if response.status_code != 200:
                continue

            soup = BeautifulSoup(response.text, "html.parser")

            for tag in soup.find_all("a", href=True):
                full_url = urljoin(url, tag["href"])
                full_url_clean = full_url.split('#')[0]

                if urlparse(full_url_clean).netloc == base_netloc:
                    if full_url_clean not in visited and full_url_clean not in to_visit:
                        to_visit.append(full_url_clean)
                        found_urls.append(full_url_clean)

        except Exception:
            pass

    # Trả về URL đã tìm thấy
    return found_urls
