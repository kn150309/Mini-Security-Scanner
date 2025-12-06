import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def crawl_website(start_url, max_pages=20):
    """
    Thực hiện crawl (thu thập) các liên kết cùng domain từ URL bắt đầu.
    Trả về danh sách các URL đã tìm thấy.
    """
    visited = set()
    to_visit = [start_url]
    found_urls = []
    
    # Lấy domain gốc
    base_netloc = urlparse(start_url).netloc

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)

        # Tránh crawl cùng một trang nhiều lần
        if url in visited:
            continue

        visited.add(url)
        
        # Thêm URL hiện tại vào danh sách kết quả nếu nó có tham số (tùy chọn) 
        # Hoặc chỉ đơn giản là thêm tất cả các URL tìm thấy (như logic ban đầu)
        # found_urls.append(url) # Nếu bạn muốn bao gồm cả trang gốc và các trang đã crawl

        try:
            # Gửi request GET để lấy nội dung trang
            response = requests.get(url, timeout=5)
            # Chỉ xử lý nếu request thành công (Status code 200)
            if response.status_code != 200:
                continue

            soup = BeautifulSoup(response.text, "html.parser")

            # Lấy tất cả link (thẻ <a>)
            for tag in soup.find_all("a", href=True):
                # Chuyển đổi đường dẫn tương đối thành URL tuyệt đối
                full_url = urljoin(url, tag["href"])
                
                # Loại bỏ các neo HTML (#anchor)
                full_url_clean = full_url.split('#')[0]

                # Chỉ crawl link cùng domain
                if urlparse(full_url_clean).netloc == base_netloc:
                    if full_url_clean not in visited and full_url_clean not in to_visit:
                        to_visit.append(full_url_clean)
                        # Thêm vào danh sách kết quả (chỉ những URL mới được khám phá)
                        found_urls.append(full_url_clean)

        except Exception:
            # Bỏ qua nếu có lỗi kết nối, timeout, hoặc lỗi khác
            pass

    # CHỈ TRẢ VỀ DANH SÁCH URL để khớp với yêu cầu của api.py
    return found_urls