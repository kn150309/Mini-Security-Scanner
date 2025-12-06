import requests
from bs4 import BeautifulSoup

def check_xss(url):
    print("\n=== Checking XSS ===")

    payload = "<script>alert(1)</script>"
    test_url = url + payload

    try:
        response = requests.get(test_url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        # Kiểm tra xem payload có xuất hiện lại trong HTML không
        if payload in response.text:
            print("⚠️  Possible XSS vulnerability detected!")
            return True
        else:
            print("✓ No reflected XSS found.")
            return False

    except requests.exceptions.RequestException:
        print("Could not connect to the website. URL invalid or unreachable.")
        return False