import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./App.css";

// Backend endpoints
const API_BASE_URL = "http://127.0.0.1:8000/api";
const SCAN_API_URL = `${API_BASE_URL}/scan`;
const CRAWL_API_URL = `${API_BASE_URL}/crawl`;

export default function App() {
  const [url, setUrl] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);

  // Results
  const [resultData, setResultData] = useState(null);   // Scan result
  const [crawlUrls, setCrawlUrls] = useState([]);       // Crawl result

  const [scanError, setScanError] = useState(null);

  // Helper for status UI
  const getStatusDisplay = (isVulnerable) => {
    return isVulnerable ? (
      <span style={{ color: "#ff006e", fontWeight: "bold" }}>⚠️ CÓ</span>
    ) : (
      <span style={{ color: "#00ffc2" }}>✔ An toàn</span>
    );
  };

  // --- SCAN FUNCTION ---
  const scan = async (e) => {
    e.preventDefault();

    if (!url.startsWith("http")) {
      alert("URL phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    setLoading(true);
    setScanError(null);
    setResultData(null);
    setCrawlUrls([]);

    try {
      const res = await axios.post(SCAN_API_URL, { url });
      setResultData(res.data);
    } catch (err) {
      console.error("Scan API error:", err);
      setScanError("❌ Không thể kết nối đến Backend API hoặc server bị lỗi.");
    }

    setLoading(false);
  };

  // --- CRAWL FUNCTION ---
  const handleCrawl = async (e) => {
    e.preventDefault();

    if (!url.startsWith("http")) {
      alert("URL phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    setIsCrawling(true);
    setScanError(null);
    setResultData(null);
    setCrawlUrls([]);

    try {
      const res = await axios.post(CRAWL_API_URL, { url });
      setCrawlUrls(res.data.urls || []);
    } catch (err) {
      console.error("Crawl API error:", err);
      setScanError("❌ Không thể kết nối đến Backend API Crawl hoặc server bị lỗi.");
    }

    setIsCrawling(false);
  };

  return (
    <div className="full-screen">
      {/* Matrix background */}
      <canvas id="matrix"></canvas>

      <div className="ui-layer">
        {/* Title */}
        <motion.h1
          className="title-glitch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          MINI SECURITY SCANNER
        </motion.h1>

        <div className="subtitle">Made by Khải Lâm</div>

        {/* Input + Buttons */}
        <div className="input-area">
          <input
            className="url-input"
            placeholder="Enter target URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            className="scan-btn"
            onClick={scan}
            disabled={loading || isCrawling}
          >
            {loading ? "SCANNING..." : "SCAN"}
          </button>

          <button
            className="scan-btn"
            onClick={handleCrawl}
            disabled={isCrawling || loading}
            style={{ backgroundColor: "#6a00f4" }}
          >
            {isCrawling ? "CRAWLING..." : "CRAWL"}
          </button>
        </div>

        {/* Loading Animation */}
        {(loading || isCrawling) && (
          <motion.pre
            className="terminal-window"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isCrawling
              ? `╔══════════════════════════════╗ 
  CRAWLER MODULE ONLINE...
  ACCESSING TARGET ${url}
  DISCOVERING ENDPOINTS...
  ANALYZING HYPERLINKS...
  GATHERING DATA...
╚══════════════════════════════╝`
              : `╔══════════════════════════════╗
  INITIALIZING SCANNER MODULES...
  LOADING PAYLOADS ███▒▒▒▒▒▒ 40%
  FIRING PROBES → TARGET ${url}
  ANALYZING RESPONSE PACKETS
  DETECTING ANOMALIES...
╚══════════════════════════════╝`}
          </motion.pre>
        )}

        {/* Error Message */}
        {scanError && (
          <motion.div
            className="error-message"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ color: "#ff006e", marginTop: "20px" }}
          >
            {scanError}
          </motion.div>
        )}

        {/* --- CRAWL RESULTS --- */}
        {crawlUrls.length > 0 && (
          <motion.div
            className="result-box neon-border"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2>🔗 Các Liên Kết Đã Phát Hiện:</h2>

            <ul className="crawl-list">
              {crawlUrls.map((link, idx) => (
                <li key={idx} className="small-url">
                  {link}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* --- SCAN RESULTS --- */}
        {resultData && (
          <motion.div
            className="result-box neon-border"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2>🔍 Kết Quả Quét:</h2>
            <p>
              Target: <span style={{ color: "#00ffc2" }}>{resultData.url}</span>
            </p>

            {resultData.result?.length === 0 ? (
              <p>Không có tham số nào được phát hiện để quét.</p>
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
                  {resultData.result.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.parameter}</td>
                      <td>{getStatusDisplay(r.xss)}</td>
                      <td>{getStatusDisplay(r.sqli)}</td>
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
