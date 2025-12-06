import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./App.css";

// Endpoint API
const API_BASE_URL = "http://127.0.0.1:8000/api";
const SCAN_API_URL = `${API_BASE_URL}/scan`;
const CRAWL_API_URL = `${API_BASE_URL}/crawl`; // <--- Đã thêm

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false); // Cho chức năng Scan
  const [isCrawling, setIsCrawling] = useState(false); // <--- Đã thêm: Cho chức năng Crawl
  
  // resultData: Dữ liệu quét (Scan Result)
  const [resultData, setResultData] = useState(null);
  
  // crawlUrls: Mảng các URL đã crawl
  const [crawlUrls, setCrawlUrls] = useState(null); // <--- Đã thêm: Để chứa list URL
  
  const [scanError, setScanError] = useState(null);

  // Hàm chuyển đổi kết quả boolean thành biểu tượng UI
  const getStatusDisplay = (isVulnerable) => {
    return isVulnerable ? (
      <span style={{ color: '#ff006e', fontWeight: 'bold' }}>⚠️ CÓ</span>
    ) : (
      <span style={{ color: '#00ffc2' }}>✔ An toàn</span>
    );
  };

  const scan = async (e) => { // <--- Thêm e (event)
    e.preventDefault(); // Ngăn form submit
    
    // 1. Kiểm tra định dạng URL
    if (!url.startsWith("http")) {
      alert("URL phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    setLoading(true);
    setResultData(null); // Reset kết quả cũ
    setCrawlUrls(null); // <--- Reset kết quả crawl
    setScanError(null); // Reset lỗi

    try {
      // 2. Gọi API bằng phương thức POST
      const res = await axios.post(SCAN_API_URL, { url });
      
      // Dữ liệu trả về có dạng: { url: "...", result: [...] }
      setResultData(res.data); 

    } catch (err) {
      console.error("Lỗi kết nối API:", err);
      // Hiển thị lỗi ra UI
      setScanError("❌ Không thể kết nối đến Backend API hoặc Server bị lỗi."); 
    }

    setLoading(false);
  };

  const handleCrawl = async (e) => { // <--- Thêm e (event)
    e.preventDefault(); // Ngăn form submit
    
    if (!url.startsWith("http")) {
      alert("URL phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    setIsCrawling(true);
    setResultData(null); // Reset kết quả scan
    setCrawlUrls(null); // Reset kết quả cũ
    setScanError(null); // Reset lỗi

    try {
      // 3. Gọi API Crawl
      const res = await axios.post(CRAWL_API_URL, { url });
      
      // Dữ liệu trả về có dạng: { urls: ["...", "..."] }
      setCrawlUrls(res.data.urls || []);
      
    } catch (err) {
      console.error("Lỗi crawl API:", err);
      setScanError("❌ Không thể kết nối đến Backend API Crawl hoặc Server bị lỗi.");
      setCrawlUrls([]);
    }

    setIsCrawling(false);
  };

  return (
    <div className="full-screen">
      {/* MATRIX BACKGROUND (giả định có logic riêng cho canvas ID matrix) */}
      <canvas id="matrix"></canvas>

      {/* OVERLAY UI */}
      <div className="ui-layer">

        {/* TITLE & SUBTITLE */}
        <motion.h1 
          className="title-glitch" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
        >
          MINI SECURITY SCANNER
        </motion.h1>
        <div className="subtitle">Made by Khải Lâm</div>

        {/* INPUT BOX */}
        <div className="input-area">
          <input
            className="url-input"
            placeholder="Enter target URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button className="scan-btn" onClick={scan} disabled={loading || isCrawling}>
            {loading ? "SCANNING..." : "SCAN"}
          </button>

          {/* Nút Crawl */}
          <button 
            className="scan-btn"
            onClick={handleCrawl}
            disabled={isCrawling || loading} // Không cho chạy cùng lúc
            style={{ backgroundColor: "#6a00f4" }}
          >
            {isCrawling ? "CRAWLING..." : "CRAWL"}
          </button>
        </div>

        {/* LOADING TERMINAL */}
        {(loading || isCrawling) && ( // Hiện Loading khi Scan hoặc Crawl
          <motion.pre
            className="terminal-window"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isCrawling ? (
              // Loading Crawl
              `╔══════════════════════════════╗ 
   CRAWLER MODULE ONLINE...  
   ACCESSING TARGET {url}
   DISCOVERING ENDPOINTS...  
   ANALYZING HYPERLINKS...  
   GATHERING DATA...  
 ╚══════════════════════════════╝  `
            ) : (
              // Loading Scan
              `╔══════════════════════════════╗  
   INITIALIZING SCANNER MODULES...  
   LOADING PAYLOADS ███▒▒▒▒▒▒ 40%  
   FIRING PROBES → TARGET {url}
   ANALYZING RESPONSE PACKETS  
   DETECTING ANOMALIES...  
 ╚══════════════════════════════╝  `
            )}
          </motion.pre>
        )}
        
        {/* HIỂN THỊ LỖI KẾT NỐI */}
        {scanError && (
          <motion.div
            className="error-message"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ color: '#ff006e', marginTop: '20px' }}
          >
            {scanError}
          </motion.div>
        )}

        {/* 1. HIỂN THỊ KẾT QUẢ CRAWL */}
        {crawlUrls && (
          <motion.div
            className="result-box neon-border"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2>🔗 Các Liên Kết Đã Phát Hiện:</h2>
            {crawlUrls.length === 0 ? (
                <p>Không tìm thấy liên kết nào trong URL này.</p>
            ) : (
                <ul className="crawl-list">
                    {crawlUrls.map((link, index) => (
                        <li key={index} className="small-url">
                            {link}
                        </li>
                    ))}
                </ul>
            )}
          </motion.div>
        )}


        {/* 2. HIỂN THỊ KẾT QUẢ SCAN */}
        {resultData && (
          <motion.div
            className="result-box neon-border"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2>🔍 Kết Quả Quét:</h2>
            <p>Target: <span style={{ color: '#00ffc2' }}>{resultData.url}</span></p>

            {/* Kiểm tra nếu không có tham số nào được quét */}
            {resultData.result && resultData.result.length === 0 ? (
              <p>Không có tham số nào được phát hiện trong URL này để quét.</p>
            ) : (
              <table className="result-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>XSS</th>
                    <th>SQLi</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Duyệt qua mảng resultData.result */}
                  {resultData.result && resultData.result.map((r, index) => (
                    <tr key={r.parameter || index}>
                      <td>{r.parameter}</td>
                      {/* Cấu trúc r.xss, r.sqli là boolean, sử dụng hàm helper */}
                      <td>
                        {getStatusDisplay(r.xss)}
                      </td>
                      <td>
                        {getStatusDisplay(r.sqli)}
                      </td>
                      <td className="small-url">{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
        
      </div>
    </div>
  );
}