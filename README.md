Mini Security Scanner
A Lightweight Web Vulnerability Scanner & Crawler

Made by Khải Lâm

*** Giới thiệu
Mini Security Scanner là một project Full-Stack bao gồm:
- Security Scanner: Kiểm tra các tham số URL để phát hiện các lỗ hổng như
    XSS (Cross-Site Scripting)
    SQL Injection

- Smart Crawler: Thu thập các URL nội bộ cùng domain dựa trên kỹ thuật phân tích HTML.

- UI Hacker Style: Giao diện neon matrix animation mô phỏng terminal hacker.

-  Backend FastAPI tốc độ cao.

- Deploy-ready trên Vercel / Render.

*** Cấu trúc thư mục
Mini Security Scanner/
│
├── hacker-ui/                  # Frontend (React + Framer Motion)
│   ├── src/
│   └── package.json
│
├── modules/
│   ├── api.py                 # FastAPI Backend
│   ├── scanner.py             # Scanner logic: XSS & SQLi detection
│   ├── crawler.py             # Internal website crawler
│   └── requirements.txt       # Python dependencies
│
├── Mini-Security-Scanner/     # (Nếu đây là thư mục build / archive)
│
├── vercel.json                # Config deploy backend on Vercel (optional)
│
└── __pycache__/               # Python cache files

1. Chạy Backend – FastAPI
- Yêu cầu:
Python 3.10+
pip

- Cài đặt:
cd modules
pip install -r requirements.txt

- Chạy server:
uvicorn api:app --reload

- Server chạy tại:
http://127.0.0.1:8000

2. Chạy Frontend – React UI
- Yêu cầu:

Node.js 16+

- Cài đặt:
cd hacker-ui
npm install

- Chạy UI:
npm run dev

- UI chạy tại:
http://127.0.0.1:5173

*** Chức năng chính
1. Security Scan

- Phân tích tham số URL (?id=1&name=abc)
- Thử payload XSS và SQLi
- Trả về kết quả dạng:

[
  {
    "parameter": "id",
    "xss": false,
    "sqli": true,
    "message": "SQL Injection detected!"
  }
]

2. Website Crawler
- Thu thập liên kết cùng domain
- Loại bỏ anchor (#)
- Tránh crawl trùng lặp
- Giới hạn crawl: 20 trang

3. UI Hacker Style
- Hiệu ứng Matrix code rain
- Animation Framer Motion
- Terminal-style loading screen
- Neon cyberpunk color palette

- API Endpoints
- POST /api/scan

* Quét lỗ hổng:

{
  "url": "https://target.com/?id=1"
}

*POST /api/crawl

Thu thập URL:

{
  "url": "https://target.com"
}

* Deploy
Backend – FastAPI → Render / Railway
Frontend – React → Vercel

vercel.json đã sẵn sàng cho backend nếu muốn deploy serverless.

*** Công nghệ sử dụng
Backend:
+ Python 3.10+
+ FastAPI
+ Requests
+ BeautifulSoup4

Frontend:
+ React + Vite
+ Axios
+ Framer Motion
+ Custom Matrix Canvas Animation

*** Bản quyền

Dự án được phát triển bởi Khải Lâm

⭐ Nếu bạn thích dự án

Hãy cho repo 1 Star trên GitHub để ủng hộ!
