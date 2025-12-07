from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scanner import run_scan
from crawler import crawl_website # Thêm nếu có crawler.py

app = FastAPI()

# ... (Phần Cấu hình CORS giữ nguyên) ...

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model dùng chung cho mọi API POST
class ScanRequest(BaseModel):
    url: str

# ----------------------------------------------------

@app.post("/api/scan")
def scan(request: ScanRequest):
    result = run_scan(request.url)
    return {"url": request.url, "result": result}

# ĐÃ SỬA: Đổi tên key trả về từ 'result' thành 'urls' để khớp với React UI
@app.post("/api/crawl")
def crawl(request: ScanRequest):
    urls_list = crawl_website(request.url) # Giả định crawl_website trả về List[str]
    return {"url": request.url, "urls": urls_list} # <--- Đã sửa thành 'urls'

# ----------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Scanner/Crawler API. Check /health, or use POST /api/scan and /api/crawl."}