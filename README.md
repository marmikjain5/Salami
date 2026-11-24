# anvesh (Salami) · Unified Cyber Fraud & Malicious App Forensic Platform

> **Hackathon Track:** Cyber Fraud / Phishing / Malicious Apps  
> **Problem Statement:** Scam Message & Phishing Link Detection with Fake Loan / Investment App and Fraudulent Website Analysis.  
> **Tech Stack:** 100% Pure HTML5, CSS3, and JavaScript (Zero-dependency, Zero-sandbox client-side static engine).

---

## 🚀 Key Modules & Capabilities

### 1. Scam Message & SMS Triage Engine
- Classifies SMS, WhatsApp, and social media text for **fake bank KYC** (SBI, HDFC, Paytm, YONO), **electricity power disconnection alerts** (BESCOM, Mahavitaran), **failed parcel delivery scams** (India Post, BlueDart), **Telegram part-time job scams** (YouTube like/hotel review), and **predatory loan offers**.
- Detects psychological urgency tricks, brand impersonation, and unverified contact numbers.
- Prevents false alarms on legitimate banking OTPs with negative-weight transactional heuristics.

### 2. Phishing URL & Domain Analyzer
- Audits target links for brand typosquatting, unencrypted HTTP protocols, direct `.apk` downloads, IP-based hosts, and high-risk disposable TLDs (`.xyz`, `.top`, `.vip`, `.buzz`, `.club`, etc.).

### 3. Zero-Sandbox Android APK Forensics
- Employs static manifest and bytecode string parsing without runtime execution.
- Identifies **signature loan extortion permission clusters** (`READ_CONTACTS` + `READ_SMS` + `CAMERA` + `LOCATION`).
- Scans decompiled string pools for hardcoded C2 IPs, exfiltration servers, and mule recovery UPI handles.
- Flags developer signing certificate reuse across fake loan app syndicates and launcher icon cloning (pHash visual match).

### 4. Website, Ponzi & Betting Intelligence
- Passively inspects DOM and promotional copy for **guaranteed ROI claims** (*100% daily profit*, *double in 24 hours*), **MLM multi-tier referral trees** (*Level 1–5 downline commission*), and **illegal betting/color prediction games** (*Wingo*, *Aviator*, *Teen Patti*).
- Extracts actionable payment identifiers: **UPI IDs**, **Bank IFSC & account numbers**, and **Cryptocurrency Wallets** (Tron USDT TRC-20, Ethereum, Bitcoin).

### 5. Police Investigation Dashboard & Evidentiary Dossier
- Searchable case repository with full-text search across Case IDs, phone numbers, UPIs, URLs, and package names.
- Computes cryptographic **SHA-256 evidence integrity hashes** via the Web Crypto API.
- Automatically maps threats to Indian statutory sections: **IT Act Sec 66D, 66E**, **BNS Sec 318(4) [formerly IPC 420]**, **BUDS Act 2019**, and **Public Gambling Act**.
- Generates printable/PDF-ready formal investigation reports and downloadable `.txt` evidentiary dossiers.

### 6. Cross-Identifier Syndicate Correlation Graph
- Automatically links disparate cases sharing identical phone numbers, UPI accounts, hosting domains, or C2 IPs, uncovering organized cybercrime syndicate hubs.

### 7. Trending Threat Heat-List
- Real-time ranking of high-frequency scam phone numbers, phishing domains, mule UPI accounts, and predatory loan app packages.

### 8. Citizen Innovation: 1-Tap "Share-to-Verify" PWA Widget
- Interactive mobile mockup demonstrating zero-install Web Share Target integration: citizens tap native **"Share"** inside WhatsApp or SMS directly to the anvesh home-screen widget for instant scam verification without manual copy-pasting or app installation.

---

## 💻 How to Run

Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari):
- Double click `index.html` in your file explorer, OR
- Serve locally using any static web server:
  ```bash
  # Python 3
  python -m http.server 3000
  # Or Node.js npx serve
  npx serve .
  ```
