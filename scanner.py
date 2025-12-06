import requests
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# ============================
# 1. Hàm gửi request an toàn
# ============================
def send_request(url):
    try:
        # Tăng timeout một chút để xử lý kết nối chậm
        response = requests.get(url, timeout=10, verify=False) 
        # Tùy chọn: Tắt cảnh báo SSL nếu dùng verify=False
        return response.text, response.status_code
    except Exception as e:
        return str(e), None

# ============================
# 2. Dò XSS
# ============================
def check_xss(url, param):
    payload = "<TestXSS1234>"  # payload vô hại
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    if param not in params:
        return False

    # Đã sửa: Gán payload dưới dạng list để khớp với cấu trúc từ parse_qs
    params[param] = [payload] 
    new_query = urlencode(params, doseq=True)
    new_url = urlunparse(parsed._replace(query=new_query))

    html, status = send_request(new_url)

    if html and payload in html:
        return True
    return False

# ============================
# 3. Dò SQL Injection
# ============================
def check_sqli(url, param):
    # Dùng ký tự đặc biệt để gây lỗi database
    payload = "'\"()[]{}" 
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    if param not in params:
        return False

    # Đã sửa: Gán payload dưới dạng list
    params[param] = [payload]
    new_query = urlencode(params, doseq=True)
    new_url = urlunparse(parsed._replace(query=new_query))

    html, status = send_request(new_url)
    
    if not html: # Nếu lỗi mạng hoặc timeout
        return False

    error_signatures = [
        "sql", "syntax", "database", "warning", 
        "mysql", "postgres", "sqlite", "exception",
    ]

    # Status 500 thường là dấu hiệu của lỗi backend
    if status == 500:
        return True

    # Kiểm tra các chữ ký lỗi trong nội dung HTML/text
    if any(err in html.lower() for err in error_signatures):
        return True

    return False

# ============================
# 4. HÀM QUÉT CHÍNH (Dành cho API)
# ============================
def run_scan(url):
    """
    Hàm này trả về dữ liệu dạng List để API sử dụng.
    """
    results = [] # Danh sách chứa kết quả
    
    # Chuẩn hóa URL trước khi parse (loại bỏ dấu ? thừa nếu không có param)
    if url.endswith('?'):
        url = url[:-1]
        
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    if not params:
        return [{"parameter": "N/A", "message": "URL không có tham số để quét"}]

    for param in params:
        # Tạo một dictionary để lưu kết quả của tham số này
        scan_result = {
            "parameter": param,
            "xss": False,
            "sqli": False,
            "message": "An toàn"
        }

        # Kiểm tra XSS
        if check_xss(url, param):
            scan_result["xss"] = True
            scan_result["message"] = "Phát hiện lỗ hổng XSS!"
            
        # Kiểm tra SQLi
        if check_sqli(url, param):
            scan_result["sqli"] = True
            # Cập nhật thông báo nếu SQLi được tìm thấy (ưu tiên)
            if scan_result["message"] == "An toàn":
                 scan_result["message"] = "Phát hiện lỗ hổng SQLi!"
            elif "XSS" in scan_result["message"]:
                 scan_result["message"] = "Phát hiện lỗ hổng XSS và SQLi!"
            
        results.append(scan_result)

    return results

# ============================
# 5. Chạy trực tiếp (Terminal)
# ============================
if __name__ == "__main__":
    print("🔐 Mini Web Scanner – XSS + SQLi (An toàn)\n")
    target = input("Nhập URL cần quét: ")
    
    # Gọi hàm run_scan và in kết quả ra màn hình
    data = run_scan(target)
    
    for item in data:
        print(f"\n🔍 Tham số: {item.get('parameter')}")
        print(f"   - XSS: {'⚠️ CÓ' if item.get('xss') else '✔ Không'}")
        print(f"   - SQLi: {'⚠️ CÓ' if item.get('sqli') else '✔ Không'}")
        print(f"   - Tóm tắt: {item.get('message')}")