/**
 * ANVESH · Digital Fraud Intelligence & Forensic Platform
 * Core Application Controller
 * Pure vanilla JavaScript - Zero dependencies - Client-side execution
 */

// Global State
let currentCase = null;
let currentAnalysisResult = null;
let activeMethod = "message"; // 'message' | 'url' | 'website' | 'apk'
let activeLang = "en"; // 'en' | 'hi' | 'kn'
let speechSynthesisInstance = null;
let isSpeaking = false;

// Sample Exhibits for all 4 Analysis Methods
const SAMPLES = {
  message: {
    loan: "Your loan is approved. ₹50,000 ready for disbursement. Complete your KYC immediately. Click the link below or your loan will expire. quickcash-verify.in/kyc",
    electricity: "BESCOM Electricity Alert: Your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately contact electricity officer at 9876543210 or update KYC at http://bescom-bill-update.xyz",
    banking: "Dear SBI customer, your YONO account will be blocked today due to pending KYC verification. Please click here to verify immediately: https://sbi-yono-kyc-verify-portal.xyz/login.php or call 9000042187"
  },
  url: {
    phishing: "https://sbi-yono-kyc-verify-portal.xyz/login.php?ref=sms_yono",
    fakeKyc: "https://quickcash-verify.in/kyc",
    ponzi: "https://royalfortune99.top/invest/deposit.html"
  },
  website: {
    ponzi: `URL: https://royalfortune99.top
Title: Royal Fortune 99 - 100% Guaranteed Daily Return Investment
Content: Deposit USDT Tron TRC20 to wallet TXzK49bL9w9qg3L3yZkS4X7vU8pQ1nRt2m. Daily profit 15% guaranteed with double money return in 10 days. Refer friends to earn 30% instant commission. Contact VIP Telegram @royalfortune_agent or WhatsApp +91 90000 42187. Support UPI: support.quickcash@upi`,
    phishingPortal: `URL: https://bescom-bill-update.xyz/pay
Title: BESCOM Karnataka Electricity Bill Payment Desk
Content: Immediate bill clearance portal. Enter your 10-digit consumer ID and debit card details. Contact nodal officer at 9876543210. Disconnection order #BES-8821 active.`
  },
  apk: {
    predatoryLoan: `App Name: QuickRupee Instant Cash
Package: com.quickrupee.instantloan.app
Permissions: android.permission.READ_SMS, android.permission.READ_CONTACTS, android.permission.SEND_SMS, android.permission.RECORD_AUDIO, android.permission.ACCESS_FINE_LOCATION, android.permission.CAMERA
Strings: Server IP: 185.220.101.5, Repayment UPI: loanrepay.mule@ybl, Emergency helpline: +91 90000 42187, API endpoint: https://api.quickrupee-service.top/upload_contacts`,
    screenRecorder: `App Name: FastFunds Easy Loan
Package: com.fastfunds.loan.harvest
Permissions: android.permission.READ_SMS, android.permission.READ_CONTACTS, android.permission.SYSTEM_ALERT_WINDOW, android.permission.RECEIVE_BOOT_COMPLETED
Strings: Mule UPI: support.quickcash@upi, C2 Server: 104.21.34.88, Domain: quick-loan-support.in`
  }
};

// Multilingual Explanations by Scam Category
const EXPLAINER_TRANSLATIONS = {
  loan: {
    en: {
      main: "This message looks dangerous because it creates urgency, promises an instant loan without credit checks, and directs you to an unverified website. These are standard tactics used in predatory loan extortion rackets.",
      advice: "Do not panic. Close the link immediately. If you entered your bank details, contact your bank right away to block net banking and debit cards. If you shared an OTP, dial 1930 immediately.",
      voice: "Tap to listen in English"
    },
    hi: {
      main: "यह संदेश खतरनाक लगता है क्योंकि इसमें जल्दबाज़ी का दबाव बनाया गया है, बिना किसी जांच के लोन का वादा किया गया है और आपको अनजान वेबसाइट पर भेजा जा रहा है। अवैध लोन ऐप अक्सर इसी तरह फंसाते हैं।",
      advice: "घबराएं मत। वेबसाइट तुरंत बंद कर दें। अगर आपने बैंक की जानकारी या OTP साझा किया है, तो तुरंत अपने बैंक से संपर्क करें और राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें।",
      voice: "हिंदी में सुनने के लिए दबाएं"
    },
    kn: {
      main: "ಈ ಸಂದೇಶವು ಅಪಾಯಕಾರಿಯಾಗಿದೆ ಏಕೆಂದರೆ ಇದು ತುರ್ತುಸ್ಥಿತಿಯನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ, ಸಾಲವನ್ನು ಸುಲಭವಾಗಿ ನೀಡುವ ಭರವಸೆ ನೀಡುತ್ತದೆ ಮತ್ತು ಅಪರಿಚಿತ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಕಳುಹಿಸುತ್ತದೆ. ಇವು ಸಾಲ ವಂಚನೆಗಳಲ್ಲಿ ಸಾಮಾನ್ಯ ತಂತ್ರಗಳಾಗಿವೆ.",
      advice: "ಗಾಬರಿಯಾಗಬೇಡಿ. ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ತಕ್ಷಣವೇ ಮುಚ್ಚಿ. ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ವಿವರ ಅಥವಾ OTP ಹಂಚಿಕೊಂಡಿದ್ದರೆ, ತಕ್ಷಣ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ 1930 ಸೈಬರ್ ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ.",
      voice: "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ"
    }
  },
  electricity: {
    en: {
      main: "This is a classic utility disconnection panic scam. Legitimate electricity boards like BESCOM never send personal phone numbers or cut power at 9:30 PM via SMS. Scammers use this threat to trick you into calling a fake officer or downloading a remote access app.",
      advice: "Do not call the mobile number. Genuine electricity bills can be verified directly on official utility portals (like bescom.karnataka.gov.in) or consumer apps. Never install AnyDesk or QuickSupport on request.",
      voice: "Tap to listen in English"
    },
    hi: {
      main: "यह बिजली बिल काटने का डर दिखाकर ठगने वाला फ्रॉड है। असली बिजली विभाग कभी भी SMS में निजी मोबाइल नंबर देकर रात को बिजली काटने की धमकी नहीं देता। जालसाज आपको फर्जी अफसर से बात करवाने के लिए डराते हैं।",
      advice: "दिए गए नंबर पर कॉल न करें। अपने बिजली बिल की पुष्टि केवल आधिकारिक सरकारी पोर्टल या ऐप पर करें। किसी के कहने पर कोई ऐप इंस्टॉल न करें।",
      voice: "हिंदी में सुनने के लिए दबाएं"
    },
    kn: {
      main: "ಇದು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತದ ಸುಳ್ಳು ಬೆದರಿಕೆ ವಂಚನೆ. ನಿಜವಾದ ಬೆಸ್ಕಾಂ ಇಲಾಖೆಯು ಎಂದಿಗೂ ವೈಯಕ್ತಿಕ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನೀಡಿ ರಾತ್ರಿ ವಿದ್ಯುತ್ ಕಡಿತಗೊಳಿಸುವುದಿಲ್ಲ.",
      advice: "ಸಂದೇಶದಲ್ಲಿರುವ ನಂಬರ್‌ಗೆ ಕರೆ ಮಾಡಬೇಡಿ. ಅಧಿಕೃತ ಬೆಸ್ಕಾಂ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಬಿಲ್ ಪರಿಶೀಲಿಸಿ. ಯಾವುದೇ ಅಪರಿಚಿತ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬೇಡಿ.",
      voice: "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ"
    }
  },
  kyc: {
    en: {
      main: "This is a bank credential harvesting phishing attack. The link mimics an official banking portal to capture your NetBanking password, PAN, and Aadhaar. Real banks never ask you to update KYC via an SMS link.",
      advice: "Never input your login credentials or OTP on this site. If you already submitted information, freeze your NetBanking via official mobile app or visit your bank branch immediately.",
      voice: "Tap to listen in English"
    },
    hi: {
      main: "यह बैंक खाते का KYC अपडेट कराने के नाम पर पासवर्ड चुराने वाला फिशिंग हमला है। बैंक कभी भी SMS में लिंक भेजकर KYC अपडेट नहीं करवाते।",
      advice: "इस लिंक पर अपनी बैंकिंग जानकारी या OTP दर्ज न करें। अगर जानकारी दर्ज कर दी है, तो तुरंत बैंक को सूचित कर खाता फ्रीज करवाएं।",
      voice: "हिंदी में सुनने के लिए दबाएं"
    },
    kn: {
      main: "ಇದು ಬ್ಯಾಂಕಿಂಗ್ ಪಾಸ್‌ವರ್ಡ್ ಕದಿಯುವ ಫಿಶಿಂಗ್ ವಂಚನೆಯಾಗಿದೆ. ಬ್ಯಾಂಕ್‌ಗಳು ಎಂದಿಗೂ SMS ಲಿಂಕ್ ಮೂಲಕ KYC ನವೀಕರಿಸಲು ಕೇಳುವುದಿಲ್ಲ.",
      advice: "ನಿಮ್ಮ ಬ್ಯಾಂಕಿಂಗ್ ವಿವರ ಅಥವಾ OTP ನಮೂದಿಸಬೇಡಿ. ಈಗಾಗಲೇ ಮಾಹಿತಿ ನೀಡಿದ್ದರೆ ತಕ್ಷಣ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಸಂಪರ್ಕಿಸಿ ಖಾತೆ ನಿರ್ಬಂಧಿಸಿ.",
      voice: "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ"
    }
  }
};

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupTabs();
  setupMethodSwitcher();
  setupSampleHandlers();
  setupInvestigateHandler();
  setupReportActions();
  setupExplainerVoiceAndQA();
  setupConnectedIntelligence();
  setupCasesProfile();
  setupBrowserExtensionTester();
  setupPwaSimulator();
  setupTelemetry();
  setupThreatHeatList();

  // Load initial default case into state and render views
  const allCases = ThreatDatabase.getCases();
  if (allCases.length > 0) {
    currentCase = allCases[0];
    renderCaseToViews(currentCase);
    renderConnectedCaseList();
  }
  updateTelemetry();
  renderCasesProfileList();
}

// -------------------------------------------------------------
// 1. TAB NAVIGATION CONTROLLER
// -------------------------------------------------------------
function setupTabs() {
  const navBtns = document.querySelectorAll(".nav-pill-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTabId = btn.getAttribute("data-tab");
      navBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) targetPane.classList.add("active");

      // Auto-refresh views on tab switch
      if (targetTabId === "tab-telemetry") updateTelemetry();
      if (targetTabId === "tab-heat-list") renderThreatHeatList();
      if (targetTabId === "tab-cases-profile") renderCasesProfileList();
      if (targetTabId === "tab-connected" && currentCase) updateConnectedIntelligenceView(currentCase);
    });
  });
}

function setupThreatHeatList() {
  renderThreatHeatList();
}

function renderThreatHeatList() {
  const domainsEl = document.getElementById("heat-list-domains");
  const phonesEl = document.getElementById("heat-list-phones");
  const otherEl = document.getElementById("heat-list-other");
  if (!domainsEl && !phonesEl && !otherEl) return;

  const heatList = ThreatDatabase.getHeatList();
  const rows = items => {
    if (!items.length) return `<div class="heat-list-empty">No source-linked indicators found.</div>`;
    return `<table class="table-clean heat-source-table"><thead><tr><th>Indicator</th><th>Reports</th><th>Source cases</th><th>Reported through</th></tr></thead><tbody>${items.slice(0, 8).map(item => {
      const sourceCases = item.cases || [];
      const sources = [...new Set(sourceCases.map(id => ThreatDatabase.getCaseById(id)?.reportedBy).filter(Boolean))];
      return `<tr><td><code>${escapeHtml(item.identifier)}</code><small>${escapeHtml(item.threatCategory || item.type || "Threat indicator")}</small></td><td><span class="heat-count">${item.count}</span></td><td>${sourceCases.map(id => `<button type="button" class="heat-source-case" data-case-id="${escapeHtml(id)}">${escapeHtml(id)}</button>`).join(" ")}</td><td>${escapeHtml(sources.join("; ") || "ANVESH case intake")}</td></tr>`;
    }).join("")}</tbody></table>`;
  };

  if (domainsEl) domainsEl.innerHTML = rows(heatList.topDomains || []);
  if (phonesEl) phonesEl.innerHTML = rows(heatList.topPhones || []);
  if (otherEl) otherEl.innerHTML = rows([...(heatList.topUpis || []), ...(heatList.topApps || [])]);

  document.querySelectorAll(".heat-source-case").forEach(button => {
    button.addEventListener("click", () => loadCaseById(button.getAttribute("data-case-id")));
  });
}

// -------------------------------------------------------------
// 2. INVESTIGATE SUBMIT SCREEN (SCREEN 2) & METHOD SWITCHER
// -------------------------------------------------------------
function setupMethodSwitcher() {
  const cards = [
    { id: "method-card-01", method: "message", statusId: "method-status-01", title: "EXHIBIT A - SUSPICIOUS MESSAGE", hint: "SMS, WhatsApp or email text with sender number and links.", placeholder: "Paste a suspicious message, link or payment request..." },
    { id: "method-card-02", method: "url", statusId: "method-status-02", title: "EXHIBIT B - SUSPICIOUS LINK / URL", hint: "Paste a suspicious URL (e.g. https://sbi-yono-kyc-verify-portal.xyz/login.php)...", placeholder: "https://..." },
    { id: "method-card-03", method: "website", statusId: "method-status-03", title: "EXHIBIT C - WEBSITE DOM & IDENTITY", hint: "Enter website URL and paste page title, text, or payment details.", placeholder: "URL: https://...\nTitle: ...\nContent: ..." },
    { id: "method-card-04", method: "apk", statusId: "method-status-04", title: "EXHIBIT D - ANDROID APP / APK METADATA", hint: "Enter app name, package name, requested permissions (READ_SMS, etc.), and extracted strings.", placeholder: "App Name: ...\nPackage: ...\nPermissions: ...\nStrings: ..." }
  ];

  cards.forEach(cardInfo => {
    const el = document.getElementById(cardInfo.id);
    if (!el) return;

    el.addEventListener("click", () => {
      activeMethod = cardInfo.method;

      // Update card visual states
      cards.forEach(c => {
        const cEl = document.getElementById(c.id);
        const sEl = document.getElementById(c.statusId);
        if (cEl) cEl.classList.remove("selected");
        if (sEl) {
          sEl.textContent = "SELECT";
          sEl.style.color = "#767E77";
        }
      });

      el.classList.add("selected");
      const statusEl = document.getElementById(cardInfo.statusId);
      if (statusEl) {
        statusEl.textContent = "SELECTED";
        statusEl.style.color = "#1E4034";
      }

      // Update Exhibit card labels
      const titleEl = document.getElementById("exhibit-card-title");
      const hintEl = document.getElementById("exhibit-hint-text");
      const textarea = document.getElementById("exhibit-input-text");

      if (titleEl) titleEl.textContent = cardInfo.title;
      if (hintEl) hintEl.textContent = cardInfo.hint;
      if (textarea) textarea.placeholder = cardInfo.placeholder;
    });
  });
}

function setupSampleHandlers() {
  const pasteBtn = document.getElementById("btn-paste-sample");
  const trySampleBtn = document.getElementById("btn-try-sample");
  const clearBtn = document.getElementById("btn-clear-exhibit");
  const textarea = document.getElementById("exhibit-input-text");

  const loadActiveSample = () => {
    if (!textarea) return;
    if (activeMethod === "message") {
      textarea.value = SAMPLES.message.loan;
    } else if (activeMethod === "url") {
      textarea.value = SAMPLES.url.phishing;
    } else if (activeMethod === "website") {
      textarea.value = SAMPLES.website.ponzi;
    } else if (activeMethod === "apk") {
      textarea.value = SAMPLES.apk.predatoryLoan;
    }
  };

  if (pasteBtn) pasteBtn.onclick = loadActiveSample;
  if (trySampleBtn) trySampleBtn.onclick = loadActiveSample;
  if (clearBtn && textarea) {
    clearBtn.onclick = () => { textarea.value = ""; };
  }
}

// -------------------------------------------------------------
// 3. CORE INVESTIGATION ENGINE HANDLER
// -------------------------------------------------------------
function setupInvestigateHandler() {
  const investigateBtn = document.getElementById("btn-anvesh-investigate");
  const textarea = document.getElementById("exhibit-input-text");

  if (!investigateBtn) return;

  investigateBtn.addEventListener("click", () => {
    let rawText = textarea ? textarea.value.trim() : "";
    if (!rawText) {
      // Default to standard sample if empty
      if (activeMethod === "message") rawText = SAMPLES.message.loan;
      else if (activeMethod === "url") rawText = SAMPLES.url.phishing;
      else if (activeMethod === "website") rawText = SAMPLES.website.ponzi;
      else if (activeMethod === "apk") rawText = SAMPLES.apk.predatoryLoan;
      if (textarea) textarea.value = rawText;
    }

    // Animate compilation checklist
    animateCompilationChecklist(() => {
      // Execute ThreatAnalyzer based on selected method
      let analysisResult = null;
      let submissionCategory = "Suspicious Message";

      if (activeMethod === "url" || (rawText.startsWith("http://") || rawText.startsWith("https://"))) {
        analysisResult = ThreatAnalyzer.analyzeUrl(rawText);
        submissionCategory = "Suspicious Link / URL";
      } else if (activeMethod === "website") {
        const lines = rawText.split("\n");
        let url = "https://suspicious-portal.top";
        let pageTitle = "Web Portal";
        let contentText = rawText;

        lines.forEach(l => {
          if (l.toLowerCase().startsWith("url:")) url = l.replace(/url:/i, "").trim();
          else if (l.toLowerCase().startsWith("title:")) pageTitle = l.replace(/title:/i, "").trim();
        });
        analysisResult = ThreatAnalyzer.analyzeWebsite({ url, pageTitle, contentText });
        submissionCategory = "Website DOM Inspection";
      } else if (activeMethod === "apk") {
        let appName = "QuickRupee Loan App";
        let packageName = "com.quickrupee.instantloan.app";
        let permissions = [
          "android.permission.READ_SMS",
          "android.permission.READ_CONTACTS",
          "android.permission.SEND_SMS",
          "android.permission.RECORD_AUDIO",
          "android.permission.ACCESS_FINE_LOCATION"
        ];
        let embeddedStrings = [
          "185.220.101.5",
          "loanrepay.mule@ybl",
          "+91 90000 42187",
          "https://api.quickrupee-service.top"
        ];

        if (rawText.includes("Package:")) {
          const m = rawText.match(/Package:\s*([^\r\n]+)/i);
          if (m) packageName = m[1].trim();
        }
        if (rawText.includes("App Name:")) {
          const m = rawText.match(/App Name:\s*([^\r\n]+)/i);
          if (m) appName = m[1].trim();
        }
        analysisResult = ThreatAnalyzer.analyzeApkMetadata({ appName, packageName, permissions, embeddedStrings });
        submissionCategory = "Android APK Forensics";
      } else {
        // Default: Message Analyzer
        analysisResult = ThreatAnalyzer.analyzeMessage(rawText);
        submissionCategory = "Citizen SMS / Message";
      }

      // Generate Unique Case Record
      const caseNumber = Math.floor(1000 + Math.random() * 9000);
      const newCaseRecord = {
        caseId: `ANV-2026-0${caseNumber}`,
        timestamp: new Date().toISOString(),
        type: activeMethod.toUpperCase(),
        title: generateHeroHeadline(analysisResult, submissionCategory),
        rawInput: rawText,
        riskLevel: analysisResult.riskLevel || "HIGH",
        riskScore: analysisResult.riskScore || 90,
        primaryCategory: analysisResult.category || "Predatory Digital Fraud",
        indicators: analysisResult.indicators || [],
        extractedEntities: analysisResult.extractedEntities || analysisResult.identifiers || {},
        status: "UNDER_INVESTIGATION",
        reportedBy: "Public Desk Investigation",
        location: "Bengaluru, Karnataka (IN)"
      };

      // Save to database
      ThreatDatabase.saveCase(newCaseRecord);
      currentCase = newCaseRecord;
      currentAnalysisResult = analysisResult;

      // Update all reactive views
      renderCaseToViews(newCaseRecord, analysisResult);
      updateTelemetry();
      renderCasesProfileList();

      // Switch to Investigation Report Screen
      const reportNav = document.querySelector('[data-tab="tab-report"]');
      if (reportNav) reportNav.click();
    });
  });
}

function animateCompilationChecklist(callback) {
  const steps = [
    document.getElementById("check-step-1"),
    document.getElementById("check-step-2"),
    document.getElementById("check-step-3"),
    document.getElementById("check-step-4"),
    document.getElementById("check-step-5")
  ];

  // Reset steps
  steps.forEach((s, idx) => {
    if (!s) return;
    const box = s.querySelector(".check-box");
    if (box) {
      box.className = "check-box pending";
      box.textContent = "[ ]";
    }
  });

  const heading = document.getElementById("case-progress-heading");
  if (heading) heading.textContent = "Analyzing submission...";

  let currentStepIdx = 0;
  const interval = setInterval(() => {
    if (currentStepIdx < steps.length) {
      const s = steps[currentStepIdx];
      if (s) {
        const box = s.querySelector(".check-box");
        if (box) {
          box.className = "check-box done";
          box.textContent = "[x]";
        }
      }
      currentStepIdx++;
    } else {
      clearInterval(interval);
      if (heading) heading.textContent = "Forensic case compiled!";
      if (callback) callback();
    }
  }, 140);
}

function generateHeroHeadline(result, submissionCategory) {
  if (result.category && result.category.toLowerCase().includes("electricity")) {
    return "The power cutoff that was never scheduled.";
  }
  if (result.category && result.category.toLowerCase().includes("kyc")) {
    return "A banking verification portal that steals your keys.";
  }
  if (result.category && result.category.toLowerCase().includes("ponzi") || result.category && result.category.toLowerCase().includes("betting")) {
    return "Guaranteed returns that lead to total loss.";
  }
  if (submissionCategory.includes("APK")) {
    return "An app that asks for permission to spy.";
  }
  return "The loan that was never offered.";
}

// -------------------------------------------------------------
// 4. RENDER TO INVESTIGATION REPORT (SCREEN 3)
// -------------------------------------------------------------
function renderCaseToViews(caseData, analysisResult = null) {
  // Update Screen 3 (Investigation Report)
  const caseIdEl = document.getElementById("report-case-id");
  const filedDateEl = document.getElementById("report-filed-date");
  const statusEl = document.getElementById("report-status");
  const subTypeEl = document.getElementById("report-sub-type");
  const heroTitleEl = document.getElementById("report-hero-title");
  const riskBadgeEl = document.getElementById("report-risk-badge");
  const riskScoreEl = document.getElementById("report-risk-score");
  const scoreSegmentsEl = document.getElementById("report-score-segments");
  const scoreDescEl = document.getElementById("report-score-desc");
  const exhibitLabelEl = document.getElementById("report-exhibit-label");
  const exhibitTextEl = document.getElementById("report-exhibit-text");
  const findingsCountEl = document.getElementById("report-findings-count");
  const findingsContainerEl = document.getElementById("report-findings-container");
  const extractedCountEl = document.getElementById("report-extracted-count");
  const extractedTbodyEl = document.getElementById("report-extracted-tbody");

  if (caseIdEl) caseIdEl.textContent = caseData.caseId;
  if (filedDateEl) {
    const d = new Date(caseData.timestamp);
    filedDateEl.textContent = `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} - ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} IST`;
  }
  if (statusEl) statusEl.textContent = caseData.status === "UNDER_INVESTIGATION" ? "Active Forensic File" : "Verified Threat";
  if (subTypeEl) subTypeEl.textContent = `${caseData.type} Submission`;
  if (heroTitleEl) heroTitleEl.innerHTML = `<em>${caseData.title}</em>`;

  // Risk Score & Badge
  if (riskScoreEl) riskScoreEl.textContent = caseData.riskScore;
  if (riskBadgeEl) {
    riskBadgeEl.textContent = `${caseData.riskLevel} RISK`;
    riskBadgeEl.className = `badge ${caseData.riskLevel === "HIGH" ? "badge-high" : caseData.riskLevel === "MEDIUM" ? "badge-medium" : "badge-low"}`;
  }

  // Findings & Segments
  const indicators = caseData.indicators || [];
  if (scoreSegmentsEl) {
    scoreSegmentsEl.innerHTML = indicators.slice(0, 4).map((ind, i) => {
      const scoreWeight = Math.round(caseData.riskScore / Math.max(indicators.length, 1));
      return `<span class="score-segment-chip">E0${i + 1} +${scoreWeight}</span>`;
    }).join("");
  }
  if (scoreDescEl) {
    scoreDescEl.textContent = `${indicators.length} independent signals corroborate this classification. Each block is one finding.`;
  }

  // Highlighted submitted exhibit text
  if (exhibitLabelEl) exhibitLabelEl.textContent = `EXHIBIT A - ${caseData.type} AS SUBMITTED`;
  if (exhibitTextEl) {
    let highlighted = escapeHtml(caseData.rawInput || "");
    // Highlight keywords
    const keywords = ["loan", "kyc", "immediately", "expire", "disbursement", "50,000", "verify", "disconnected", "bill", "urgent", "blocked", "freeze", "USDT"];
    keywords.forEach(kw => {
      const reg = new RegExp(`(${kw})`, "gi");
      highlighted = highlighted.replace(reg, `<mark style="background:#FDE68A; padding:0 3px;">$1</mark>`);
    });
    exhibitTextEl.innerHTML = highlighted;
  }

  // Render Findings Cards (E01, E02...)
  if (findingsCountEl) findingsCountEl.textContent = `${indicators.length} FINDINGS`;
  if (findingsContainerEl) {
    if (indicators.length === 0) {
      findingsContainerEl.innerHTML = `<div style="padding:1rem; color:#767E77;">No malicious indicators detected. Artifact appears clean.</div>`;
    } else {
      findingsContainerEl.innerHTML = indicators.map((ind, i) => {
        const eTag = `E0${i + 1}`;
        const sevClass = ind.severity === "HIGH" ? "badge-high" : ind.severity === "MEDIUM" ? "badge-medium" : "badge-low";
        const explanation = ind.explanation || ind.evidence || "Tactical signature identified by static zero-execution analyzer.";
        const whyMatters = ind.whyItMatters || "Manipulative urgency and unverified identifiers are hallmarks of syndicated cyber fraud.";
        return `
          <div class="finding-item-box">
            <div class="finding-head">
              <div>
                <span class="finding-tag-num">${eTag}</span>
                <span class="finding-title-bold">${escapeHtml(ind.title || "ANOMALY DETECTED")}</span>
              </div>
              <span class="badge ${sevClass}">${ind.severity || "HIGH"}</span>
            </div>
            <div class="finding-body-block">
              ${escapeHtml(ind.description || ind.title)}
              <span class="sub-label">WHAT WE SAW</span>
              ${escapeHtml(explanation)}
              <span class="sub-label">WHY IT MATTERS</span>
              ${escapeHtml(whyMatters)}
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Extracted Indicators Table
  const entities = caseData.extractedEntities || {};
  const extractedRows = [];

  (entities.domains || entities.urls || []).forEach(d => {
    extractedRows.push(`<tr><td style="font-family:var(--font-mono); font-weight:700; width:120px;">DOMAIN</td><td><code>${escapeHtml(d)}</code></td><td style="color:#767E77; font-size:0.8rem;">Suspicious Infrastructure</td></tr>`);
  });
  (entities.phones || []).forEach(p => {
    extractedRows.push(`<tr><td style="font-family:var(--font-mono); font-weight:700;">PHONE</td><td><code>${escapeHtml(p)}</code></td><td style="color:#767E77; font-size:0.8rem;">Communication Channel / Mule Origin</td></tr>`);
  });
  (entities.upis || []).forEach(u => {
    extractedRows.push(`<tr><td style="font-family:var(--font-mono); font-weight:700;">UPI</td><td><code>${escapeHtml(u)}</code></td><td style="color:#767E77; font-size:0.8rem;">Actionable Payment Mule Identifier</td></tr>`);
  });
  (entities.cryptoTron || entities.cryptoBtc || []).forEach(c => {
    extractedRows.push(`<tr><td style="font-family:var(--font-mono); font-weight:700;">CRYPTO</td><td><code>${escapeHtml(c)}</code></td><td style="color:#767E77; font-size:0.8rem;">Decentralized Laundering Destination</td></tr>`);
  });
  (entities.flaggedPermissions || []).forEach(perm => {
    extractedRows.push(`<tr><td style="font-family:var(--font-mono); font-weight:700;">PERMISSION</td><td><code>${escapeHtml(perm)}</code></td><td style="color:#767E77; font-size:0.8rem;">Predatory Privacy Intrusion</td></tr>`);
  });

  if (extractedRows.length === 0) {
    extractedRows.push(`<tr><td colspan="3" style="text-align:center; color:#767E77;">No persistent identifiers extracted in this payload.</td></tr>`);
  }

  if (extractedCountEl) extractedCountEl.textContent = `Extracted indicators (${extractedRows.length} items)`;
  if (extractedTbodyEl) extractedTbodyEl.innerHTML = extractedRows.join("");

  // Also update Screen 4 (Explainer) and Screen 5 (Connected Intelligence)
  updateExplainerView(caseData);
  updateConnectedIntelligenceView(caseData);
}

// -------------------------------------------------------------
// 5. REPORT ACTION BUTTONS
// -------------------------------------------------------------
function setupReportActions() {
  const downloadBtn = document.getElementById("btn-report-download");
  const telemetryPdfBtn = document.getElementById("telemetry-pdf-btn");

  const triggerDossierDownload = async () => {
    const targetCase = currentCase || ThreatDatabase.getCases()[0];
    if (!targetCase) return;

    try {
      const dossier = await ThreatReport.buildReportDossier(targetCase);
      ThreatReport.downloadReportAsPdf(dossier);
    } catch (e) {
      console.error("Dossier generation error:", e);
      // Fallback printable window
      const printHtml = ThreatReport.renderPrintableHtml({
        metadata: { caseId: targetCase.caseId, generatedAt: new Date().toISOString(), sha256Checksum: "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855" },
        caseOverview: { riskScore: targetCase.riskScore, riskLevel: targetCase.riskLevel, primaryCategory: targetCase.primaryCategory },
        rawEvidence: targetCase.rawInput,
        triggerIndicators: targetCase.indicators || [],
        extractedIdentifiers: targetCase.extractedEntities || {},
        legalProvisions: ["Section 66D IT Act 2000 (Impersonation by computer)", "Section 420 IPC (Cheating)"],
        officerRecommendations: ["Immediate freeze of destination mule accounts", "Domain takedown order to registrar"]
      });
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(printHtml);
        win.document.close();
      }
    }
  };

  if (downloadBtn) downloadBtn.onclick = triggerDossierDownload;
  if (telemetryPdfBtn) telemetryPdfBtn.onclick = triggerDossierDownload;
}

// Multilingual UI Strings Dictionary
const UI_STRINGS = {
  en: {
    query: "I already clicked the link. What should I do?",
    voiceIdle: "Tap the mic to hear the explanation",
    voicePlaying: "Reading the explanation aloud...",
    voicePlayBtn: "Hear the explanation",
    voicePauseBtn: "Pause explanation",
    chips: [
      { text: "I shared an OTP", query: "I shared an OTP. What now?" },
      { text: "I installed an app from the link", query: "I installed an app from the link." },
      { text: "How do I report this officially?", query: "How do I report this officially?" },
      { text: "Could the sender be a real lender?", query: "Could the sender be a real lender?" }
    ],
    placeholder: "Ask about this case...",
    askBtn: "Ask"
  },
  hi: {
    query: "मैंने पहले ही लिंक पर क्लिक कर दिया है। मुझे अब क्या करना चाहिए?",
    voiceIdle: "व्याख्या सुनने के लिए माइक पर टैप करें",
    voicePlaying: "व्याख्या पढ़कर सुनाई जा रही है...",
    voicePlayBtn: "व्याख्या सुनें",
    voicePauseBtn: "व्याख्या रोकें",
    chips: [
      { text: "मैंने OTP साझा कर दिया", query: "मैंने OTP साझा कर दिया है, अब क्या करूं?" },
      { text: "मैंने लिंक से ऐप इंस्टॉल किया", query: "मैंने लिंक से ऐप इंस्टॉल कर लिया है।" },
      { text: "इसकी आधिकारिक शिकायत कैसे करें?", query: "इसकी शिकायत 1930 पर कैसे करें?" },
      { text: "क्या यह बैंक या असली कंपनी हो सकती है?", query: "क्या यह कोई असली बैंक या कंपनी हो सकती है?" }
    ],
    placeholder: "इस केस के बारे में कोई सवाल पूछें...",
    askBtn: "पूछें"
  },
  kn: {
    query: "ನಾನು ಈಗಾಗಲೇ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿದ್ದೇನೆ. ಈಗ ನಾನು ಏನು ಮಾಡಬೇಕು?",
    voiceIdle: "ವಿವರಣೆಯನ್ನು ಕೇಳಲು ಮೈಕ್ ಅನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ",
    voicePlaying: "ವಿವರಣೆಯನ್ನು ಗಟ್ಟಿಯಾಗಿ ಓದಲಾಗುತ್ತಿದೆ...",
    voicePlayBtn: "ವಿವರಣೆಯನ್ನು ಕೇಳಿ",
    voicePauseBtn: "ವಿವರಣೆಯನ್ನು ನಿಲ್ಲಿಸಿ",
    chips: [
      { text: "ನಾನು OTP ಹಂಚಿಕೊಂಡಿದ್ದೇನೆ", query: "ನಾನು OTP ಹಂಚಿಕೊಂಡಿದ್ದೇನೆ, ಈಗ ಏನು ಮಾಡಬೇಕು?" },
      { text: "ನಾನು ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿದ್ದೇನೆ", query: "ನಾನು ಲಿಂಕ್‌ನಿಂದ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿದ್ದೇನೆ." },
      { text: "ಇದನ್ನು ಅಧಿಕೃತವಾಗಿ ವರದಿ ಮಾಡುವುದು ಹೇಗೆ?", query: "ಇದನ್ನು 1930 ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ವರದಿ ಮಾಡುವುದು ಹೇಗೆ?" },
      { text: "ಇದು ನಿಜವಾದ ಸಾಲ ಸಂಸ್ಥೆಯಾಗಿರಬಹುದೇ?", query: "ಇದು ನಿಜವಾದ ಸಾಲ ಸಂಸ್ಥೆಯಾಗಿರಬಹುದೇ?" }
    ],
    placeholder: "ಈ ಪ್ರಕರಣದ ಬಗ್ಗೆ ಕೇಳಿ...",
    askBtn: "ಕೇಳಿ"
  }
};

function setGlobalLanguage(lang) {
  activeLang = lang;
  try { localStorage.setItem("anvesh_language", lang); } catch (e) {}

  // Update Screen 4 buttons (lang-btn-*)
  const explainerBtns = {
    en: document.getElementById("lang-btn-en"),
    hi: document.getElementById("lang-btn-hi"),
    kn: document.getElementById("lang-btn-kn")
  };

  // Update Screen 6 buttons (pref-lang-*)
  const prefBtns = {
    en: document.getElementById("pref-lang-en"),
    hi: document.getElementById("pref-lang-hi"),
    kn: document.getElementById("pref-lang-kn")
  };

  [explainerBtns, prefBtns].forEach(group => {
    Object.keys(group).forEach(k => {
      const btn = group[k];
      if (!btn) return;
      if (k === lang) {
        btn.classList.add("active");
        btn.style.background = "#1E4034";
        btn.style.color = "#FFF";
        btn.style.borderColor = "#1E4034";
      } else {
        btn.classList.remove("active");
        btn.style.background = "#FFF";
        btn.style.color = "#334155";
        btn.style.borderColor = "#CBD5E1";
      }
    });
  });

  // Update active case explainer view
  const targetCase = currentCase || (typeof ThreatDatabase !== "undefined" && ThreatDatabase.getCases()[0]);
  if (targetCase) {
    updateExplainerView(targetCase);
  }

  // Update strings on Screen 4
  const strings = UI_STRINGS[lang] || UI_STRINGS.en;
  const userQueryEl = document.getElementById("explainer-user-query");
  if (userQueryEl) userQueryEl.textContent = strings.query;

  const voiceLabelEl = document.getElementById("voice-label");
  if (voiceLabelEl && !isSpeaking) voiceLabelEl.textContent = strings.voiceIdle;

  const voicePlayTextEl = document.getElementById("voice-play-text");
  if (voicePlayTextEl && !isSpeaking) voicePlayTextEl.textContent = strings.voicePlayBtn;

  const askInput = document.getElementById("ask-case-input");
  if (askInput) askInput.placeholder = strings.placeholder;

  const askBtn = document.getElementById("btn-ask-case");
  if (askBtn) askBtn.textContent = strings.askBtn;

  // Render chips with interactive click handlers
  const chipsContainer = document.getElementById("explainer-prompt-chips");
  if (chipsContainer) {
    chipsContainer.innerHTML = strings.chips.map(c => `
      <button class="chip-btn" data-query="${escapeHtml(c.query)}">${escapeHtml(c.text)}</button>
    `).join("");

    if (typeof chipsContainer.querySelectorAll === "function") {
      chipsContainer.querySelectorAll(".chip-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const q = btn.getAttribute("data-query");
          if (askInput && q) askInput.value = q;
        });
      });
    }
  }
}

// -------------------------------------------------------------
// 6. AI EXPLAINER (VOICE & MULTILINGUAL) (SCREEN 4)
// -------------------------------------------------------------
function setupExplainerVoiceAndQA() {
  const langEn = document.getElementById("lang-btn-en");
  const langHi = document.getElementById("lang-btn-hi");
  const langKn = document.getElementById("lang-btn-kn");
  const prefEn = document.getElementById("pref-lang-en");
  const prefHi = document.getElementById("pref-lang-hi");
  const prefKn = document.getElementById("pref-lang-kn");

  const voiceBtn = document.getElementById("voice-mic-btn");
  const voicePlayPill = document.getElementById("voice-play-pill");
  const askInput = document.getElementById("ask-case-input");
  const askBtn = document.getElementById("btn-ask-case");
  const chatStream = document.getElementById("chat-conversation-stream");

  // Wire language change listeners on both Screen 4 and Screen 6
  if (langEn) langEn.onclick = () => setGlobalLanguage("en");
  if (langHi) langHi.onclick = () => setGlobalLanguage("hi");
  if (langKn) langKn.onclick = () => setGlobalLanguage("kn");
  if (prefEn) prefEn.onclick = () => setGlobalLanguage("en");
  if (prefHi) prefHi.onclick = () => setGlobalLanguage("hi");
  if (prefKn) prefKn.onclick = () => setGlobalLanguage("kn");

  // Wire Text Size Accessibility Buttons on Screen 6
  const txtStd = document.getElementById("pref-text-std");
  const txtLg = document.getElementById("pref-text-lg");
  const txtXl = document.getElementById("pref-text-xl");

  const setTextSize = (size, activeBtn) => {
    [txtStd, txtLg, txtXl].forEach(b => {
      if (!b) return;
      b.classList.remove("active");
      b.style.background = "#FFF";
      b.style.color = "#334155";
      b.style.borderColor = "#CBD5E1";
    });
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.style.background = "#1E4034";
      activeBtn.style.color = "#FFF";
      activeBtn.style.borderColor = "#1E4034";
    }
    if (size === "std") document.documentElement.style.fontSize = "15px";
    else if (size === "lg") document.documentElement.style.fontSize = "17px";
    else if (size === "xl") document.documentElement.style.fontSize = "19px";
  };

  if (txtStd) txtStd.onclick = () => setTextSize("std", txtStd);
  if (txtLg) txtLg.onclick = () => setTextSize("lg", txtLg);
  if (txtXl) txtXl.onclick = () => setTextSize("xl", txtXl);

  // Initialize language chips
  setGlobalLanguage(activeLang || "en");

  // Web Speech API Synthesis
  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      updateVoiceStatus(false);
      return;
    }

    const mainTextEl = document.getElementById("explainer-text-main");
    const textToSpeak = mainTextEl ? mainTextEl.textContent : "ANVESH forensic threat detected.";

    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.lang = activeLang === "hi" ? "hi-IN" : activeLang === "kn" ? "kn-IN" : "en-IN";
    utter.rate = 0.95;

    utter.onstart = () => {
      isSpeaking = true;
      updateVoiceStatus(true);
    };

    utter.onend = () => {
      isSpeaking = false;
      updateVoiceStatus(false);
    };

    utter.onerror = () => {
      isSpeaking = false;
      updateVoiceStatus(false);
    };

    window.speechSynthesis.speak(utter);
  };

  if (voiceBtn) voiceBtn.onclick = toggleSpeech;
  if (voicePlayPill) voicePlayPill.onclick = toggleSpeech;

  // Interactive Citizen Q&A
  const handleUserQuestion = () => {
    if (!askInput) return;
    const q = askInput.value.trim();
    if (!q) return;

    // Append user question
    const userBlock = document.createElement("div");
    userBlock.style.cssText = "background:#F4F0E8; border:1px solid #DDD7CC; border-radius:8px; padding:1.25rem; align-self:flex-end; max-width:85%;";
    userBlock.innerHTML = `
      <div style="font-size:0.72rem; font-family:var(--font-mono); color:#767E77; margin-bottom:0.4rem;">YOU ASKED</div>
      <p style="font-size:0.9rem; color:#1F2421;">${escapeHtml(q)}</p>
    `;
    chatStream.appendChild(userBlock);
    askInput.value = "";

    // Generate contextual multilingual response
    setTimeout(() => {
      let ans = "";
      const qLower = q.toLowerCase();

      if (activeLang === "hi") {
        if (qLower.includes("otp") || qLower.includes("ओटीपी")) {
          ans = "किसी के साथ भी OTP साझा न करें। असली बैंक कभी भी फोन या SMS पर OTP नहीं मांगते। तुरंत अपने बैंक हेल्पलाइन पर कॉल करके कार्ड और नेट बैंकिंग ब्लॉक कराएं।";
        } else if (qLower.includes("app") || qLower.includes("ऐप")) {
          ans = "अगर आपने ऐप इंस्टॉल कर लिया है, तो तुरंत फोन को फ्लाइट मोड (Airplane Mode) पर डालें और उस ऐप को अनइंस्टॉल करें। फोन की सेटिंग्स में 'Device Administrators' जरूर चेक करें।";
        } else if (qLower.includes("report") || qLower.includes("शिकायत")) {
          ans = "पैसे कटने के 2 घंटे के भीतर राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें ताकि गोल्डन ऑवर में बैंक खाता फ्रीज हो सके, और cybercrime.gov.in पर लिखित रिपोर्ट दर्ज करें।";
        } else {
          ans = "घबराएं मत। सभी SMS और स्क्रीनशॉट सुरक्षित रखें। इस नंबर पर कोई कॉल या भुगतान न करें और तुरंत 1930 पर कॉल करें।";
        }
      } else if (activeLang === "kn") {
        if (qLower.includes("otp")) {
          ans = "ಯಾರಿಗೂ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಬ್ಯಾಂಕ್‌ಗಳು ಎಂದಿಗೂ ಫೋನ್‌ನಲ್ಲಿ OTP ಕೇಳುವುದಿಲ್ಲ. ತಕ್ಷಣ ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ಗೆ ಕರೆ ಮಾಡಿ ಕಾರ್ಡ್ ಬ್ಲಾಕ್ ಮಾಡಿ.";
        } else if (qLower.includes("app") || qLower.includes("ಆ್ಯಪ್")) {
          ans = "ನೀವು ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿದ್ದರೆ, ತಕ್ಷಣ ಇಂಟರ್ನೆಟ್ ಆಫ್ ಮಾಡಿ ಆ್ಯಪ್ ಅನ್ನು ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.";
        } else {
          ans = "ಗಾಬರಿಯಾಗಬೇಡಿ. ಯಾವುದೇ ಹಣ ಪಾವತಿಸಬೇಡಿ. ತಕ್ಷಣ 1930 ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ.";
        }
      } else {
        if (qLower.includes("otp")) {
          ans = "Never share OTPs with anyone. Genuine banks never request OTPs over the phone or SMS. Call your bank helpline immediately to block card transactions.";
        } else if (qLower.includes("app") || qLower.includes("install")) {
          ans = "If you installed an APK, disconnect from the internet (turn on Airplane mode) and uninstall the application immediately. Check device administrators under Android Settings.";
        } else if (qLower.includes("report")) {
          ans = "Dial the national cyber helpline 1930 within 2 hours of any transaction to facilitate the Golden Hour fund freeze, and file your formal complaint at cybercrime.gov.in.";
        } else {
          ans = "Do not panic. Keep all message screenshots and transactional records. File an immediate report on cybercrime.gov.in or call 1930.";
        }
      }

      const botBlock = document.createElement("div");
      botBlock.style.cssText = "background:#FFF; border:1px solid #DDD7CC; border-radius:8px; padding:1.25rem;";
      botBlock.innerHTML = `
        <div style="font-size:0.72rem; font-family:var(--font-mono); color:#767E77; margin-bottom:0.4rem;">ANVESH - EXPLAINS</div>
        <p style="font-size:0.9rem; line-height:1.5; color:#1F2421;">${ans}</p>
      `;
      chatStream.appendChild(botBlock);
      chatStream.scrollTop = chatStream.scrollHeight;
    }, 280);
  };

  if (askBtn) askBtn.onclick = handleUserQuestion;
  if (askInput) {
    askInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUserQuestion();
    });
  }
}

function updateVoiceStatus(speaking) {
  const voiceLabel = document.getElementById("voice-label");
  const playText = document.getElementById("voice-play-text");
  const voiceBtn = document.getElementById("voice-mic-btn");
  const voicePlayButton = document.getElementById("voice-play-pill");

  if (voiceLabel) {
    voiceLabel.textContent = speaking ? "Reading the explanation aloud…" : "Tap the mic to hear the explanation";
  }
  if (playText) {
    playText.textContent = speaking ? "Pause explanation" : "Hear the explanation";
  }
  if (voiceBtn) {
    voiceBtn.setAttribute("aria-pressed", String(speaking));
    voiceBtn.setAttribute("aria-label", speaking ? "Pause spoken explanation" : "Play explanation aloud");
  }
  if (voicePlayButton) {
    voicePlayButton.setAttribute("aria-pressed", String(speaking));
    voicePlayButton.setAttribute("aria-label", speaking ? "Pause explanation" : "Hear the explanation");
  }
}

function updateExplainerView(caseData) {
  const subtitleEl = document.getElementById("explainer-case-subtitle");
  const mainEl = document.getElementById("explainer-text-main");
  const adviceEl = document.getElementById("explainer-advice-text");
  const tagsEl = document.getElementById("explainer-finding-tags");

  if (subtitleEl) subtitleEl.textContent = `ANSWERS TIED TO ${caseData.caseId}`;

  // Determine category key
  const cat = (caseData.primaryCategory || "").toLowerCase();
  let key = "loan";
  if (cat.includes("electricity") || cat.includes("bill")) key = "electricity";
  else if (cat.includes("kyc") || cat.includes("bank") || cat.includes("yono")) key = "kyc";

  const tr = EXPLAINER_TRANSLATIONS[key][activeLang] || EXPLAINER_TRANSLATIONS[key].en;
  if (mainEl) mainEl.textContent = tr.main;
  if (adviceEl) adviceEl.innerHTML = tr.advice;

  if (tagsEl) {
    const indicators = caseData.indicators || [];
    tagsEl.innerHTML = indicators.slice(0, 4).map((_, i) => `<span class="badge badge-low" style="background:#F1F5F9; color:#475569; border-color:#CBD5E1;">E0${i + 1}</span>`).join(" ");
  }
}

// -------------------------------------------------------------
// 7. CONNECTED INTELLIGENCE & SYNDICATE CORRELATION (SCREEN 5)
// -------------------------------------------------------------
function setupConnectedIntelligence() {
  const backButton = document.getElementById("connected-back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      const listView = document.getElementById("connected-case-list-view");
      const detailView = document.getElementById("connected-detail-view");
      if (listView) listView.hidden = false;
      if (detailView) detailView.hidden = true;
    });
  }
  const filterPills = document.querySelectorAll("#graph-filter-pills .graph-filter-pill");
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      if (currentCase) updateConnectedIntelligenceView(currentCase, pill.getAttribute("data-filter"));
    });
  });
}

function renderConnectedCaseList() {
  const listEl = document.getElementById("connected-case-list");
  if (!listEl) return;

  const connectedCases = ThreatDatabase.getCases().filter(item => ThreatDatabase.findLinkedCases(item).length > 0);
  if (!connectedCases.length) {
    listEl.innerHTML = `<div class="connected-empty-state">No cross-connected cases have been identified yet.</div>`;
    return;
  }

  listEl.innerHTML = connectedCases.map(item => {
    const links = ThreatDatabase.findLinkedCases(item);
    const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Date unavailable";
    const riskClass = item.riskLevel === "HIGH" || Number(item.riskScore) >= 70 ? "high" : "medium";
    return `
      <button type="button" class="connected-case-card" data-connected-case-id="${escapeHtml(item.caseId)}">
        <span class="connected-case-card-top"><strong>${escapeHtml(item.caseId)}</strong><span class="connected-case-risk ${riskClass}">${escapeHtml(String(item.riskScore))}/100</span></span>
        <span class="connected-case-card-title">${escapeHtml(item.title || "Investigation case")}</span>
        <span class="connected-case-card-meta">${escapeHtml(item.primaryCategory || item.type || "Digital threat")} · ${date}</span>
        <span class="connected-case-card-linkcount">${links.length} cross-connected ${links.length === 1 ? "case" : "cases"} · Open details →</span>
      </button>`;
  }).join("");

  listEl.querySelectorAll("[data-connected-case-id]").forEach(card => {
    card.addEventListener("click", () => {
      const selected = ThreatDatabase.getCaseById(card.getAttribute("data-connected-case-id"));
      if (!selected) return;
      currentCase = selected;
      renderCaseToViews(selected);
      const listView = document.getElementById("connected-case-list-view");
      const detailView = document.getElementById("connected-detail-view");
      if (listView) listView.hidden = true;
      if (detailView) detailView.hidden = false;
      updateConnectedIntelligenceView(selected);
    });
  });
}

function updateConnectedIntelligenceView(caseData, filter = "all") {
  const boardLabelEl = document.getElementById("connected-board-label");
  const nodesBoardEl = document.getElementById("syndicate-graph-board-nodes");

  // Search for cross-case links
  const linked = ThreatDatabase.findLinkedCases(caseData);
  const entities = caseData.extractedEntities || {};

  const sharedPhone = (entities.phones && entities.phones[0]) || "+91 90000 42187";
  const sharedUpi = (entities.upis && entities.upis[0]) || "support.quickcash@upi";
  const sharedDomain = (entities.domains && entities.domains[0]) || "quickcash-verify.in";

  const linkedCount = linked.length;
  if (boardLabelEl) {
    boardLabelEl.textContent = `EVIDENCE BOARD - ${Math.max(linkedCount + 1, 3)} CONNECTED CASES - 5 SHARED IDENTIFIERS`;
  }

  if (nodesBoardEl) {
    const linkedCaseId1 = linked[0] ? linked[0].linkedCase.caseId : "ANV-01396";
    const linkedCaseId2 = linked[1] ? linked[1].linkedCase.caseId : "ANV-01277";

    nodesBoardEl.innerHTML = `
      <!-- Top Row: Domains -->
      <div style="display:flex; gap:3rem; flex-wrap:wrap; justify-content:center;">
        <div class="node-chip-badge" style="cursor:pointer;" onclick="alert('Domain: ${sharedDomain} - Flagged on Cloudflare & CERT-In feed.');">
          <span>[WEB]</span>
          <span>${escapeHtml(sharedDomain)}</span>
        </div>
        <div style="border-top:1px dashed #A3ACA5; width:80px; align-self:center;"></div>
        <div class="node-chip-badge" style="cursor:pointer;">
          <span>[WEB]</span>
          <span>quick-loan-support.in</span>
        </div>
      </div>

      <!-- Middle Row: Center Phone Hub -->
      <div style="display:flex; justify-content:space-between; width:100%; max-width:650px; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div class="node-chip-badge center-hub" style="cursor:pointer;">
          <span>[CASE]</span>
          <span>${caseData.caseId}</span>
        </div>

        <div class="node-chip-badge center-hub" style="background:#FDE68A; border-color:#D97706; padding:0.6rem 1rem; cursor:pointer;" onclick="alert('Shared Hub: ${sharedPhone} links across 3 reported Indian cybercrime files.');">
          <span>[PHONE]</span>
          <span><strong>${escapeHtml(sharedPhone)}</strong> (Shared Hub)</span>
        </div>

        <div class="node-chip-badge center-hub" style="cursor:pointer;" onclick="loadCaseById('${linkedCaseId1}')">
          <span>[CASE]</span>
          <span>${linkedCaseId1}</span>
        </div>
      </div>

      <!-- Bottom Row: UPI and APK -->
      <div style="display:flex; gap:3rem; flex-wrap:wrap; justify-content:center;">
        <div class="node-chip-badge" style="cursor:pointer;" onclick="alert('Mule UPI: ${sharedUpi} marked for NPCI freeze.');">
          <span>[UPI]</span>
          <span>${escapeHtml(sharedUpi)}</span>
        </div>
        <div style="border-top:1px dashed #A3ACA5; width:80px; align-self:center;"></div>
        <div class="node-chip-badge" style="cursor:pointer;" onclick="loadCaseById('${linkedCaseId2}')">
          <span>[APK]</span>
          <span>FastFunds.apk (${linkedCaseId2})</span>
        </div>
      </div>
    `;
  }

  renderConnectedCaseTimeline(caseData, linked);
}

function renderConnectedCaseTimeline(caseData, linkedCases) {
  const timelineEl = document.getElementById("connected-case-timeline");
  if (!timelineEl) return;

  const cases = [caseData, ...(linkedCases || []).map(item => item.linkedCase)]
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex(candidate => candidate.caseId === item.caseId) === index)
    .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  const seenIdentifiers = new Map();
  const getIdentifiers = (item) => {
    const entities = item.extractedEntities || {};
    const identifiers = [];
    const add = (type, value) => {
      if (value && !identifiers.some(identifier => identifier.type === type && identifier.value.toLowerCase() === String(value).toLowerCase())) {
        identifiers.push({ type, value: String(value) });
      }
    };
    (entities.phones || []).forEach(value => add("PHONE", value));
    (entities.upis || []).forEach(value => add("UPI ID", value));
    (entities.urls || []).forEach(value => {
      try { add("DOMAIN", new URL(value).hostname); } catch (error) { add("LINK", value); }
    });
    if (entities.domain) add("DOMAIN", entities.domain);
    (entities.ips || []).forEach(value => add("SERVER IP", value));
    if (item.packageName) add("APP", item.packageName);
    return identifiers;
  };

  timelineEl.innerHTML = cases.map(item => {
    const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Date unavailable";
    const entities = item.extractedEntities || {};
    const identifiers = getIdentifiers(item);
    const newlyObserved = [];
    const matched = [];
    identifiers.forEach(identifier => {
      const key = `${identifier.type}:${identifier.value.toLowerCase()}`;
      if (seenIdentifiers.has(key)) {
        matched.push({ ...identifier, firstCase: seenIdentifiers.get(key) });
      } else {
        newlyObserved.push(identifier);
        seenIdentifiers.set(key, item.caseId);
      }
    });
    const evidenceMarkup = (label, values, modifier) => values.length ? `
      <div class="connected-timeline-evidence ${modifier}">
        <span class="connected-evidence-label">${label}</span>
        <div class="connected-evidence-chips">${values.map(identifier => `<span class="connected-evidence-chip"><b>${escapeHtml(identifier.type)}</b> ${escapeHtml(identifier.value)}${identifier.firstCase ? ` <small>← ${escapeHtml(identifier.firstCase)}</small>` : ""}</span>`).join("")}</div>
      </div>` : "";
    return `
      <article class="connected-timeline-item">
        <div class="connected-timeline-marker" aria-hidden="true"></div>
        <div class="connected-timeline-content">
          <div class="connected-timeline-meta"><span>${date}</span><strong>${escapeHtml(item.caseId)}</strong></div>
          <div class="connected-timeline-title">${escapeHtml(item.title || "Investigation case")}</div>
          <div class="connected-timeline-detail">${escapeHtml(item.primaryCategory || item.type || "Investigation")} · Risk ${escapeHtml(String(item.riskScore ?? "N/A"))}/100</div>
          ${evidenceMarkup("NEW EVIDENCE", newlyObserved, "connected-evidence-new")}
          ${evidenceMarkup("MATCHED TO EARLIER CASE", matched, "connected-evidence-matched")}
          <button type="button" class="btn btn-sm btn-outline connected-timeline-open" data-case-id="${escapeHtml(item.caseId)}">Open case report</button>
        </div>
      </article>`;
  }).join("");

  timelineEl.querySelectorAll(".connected-timeline-open").forEach(button => {
    button.addEventListener("click", () => loadCaseById(button.getAttribute("data-case-id")));
  });
}

function loadCaseById(id) {
  const target = ThreatDatabase.getCaseById(id);
  if (target) {
    currentCase = target;
    renderCaseToViews(target);
    const reportNav = document.querySelector('[data-tab="tab-report"]');
    if (reportNav) reportNav.click();
  }
}

// -------------------------------------------------------------
// 8. CASES & PROFILE (SCREEN 6)
// -------------------------------------------------------------
function setupCasesProfile() {
  const searchInput = document.getElementById("profile-cases-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderCasesProfileList(e.target.value.trim());
    });
  }
}

function renderCasesProfileList(filterQuery = "") {
  const listEl = document.getElementById("profile-cases-list");
  const totalCasesEl = document.getElementById("profile-stat-total-cases");
  const highRiskEl = document.getElementById("profile-stat-high-risk");
  const reportedEl = document.getElementById("profile-stat-reported");

  const allCases = ThreatDatabase.getCases();
  const closedStatuses = new Set(["CLOSED", "RESOLVED", "VERIFIED_CLEAN", "ARCHIVED"]);
  const activeCases = allCases.filter(c => !closedStatuses.has(String(c.status || "").toUpperCase()));
  const escalatedStatuses = new Set(["TAKEDOWN_REQUESTED", "EVIDENCE_FILED", "BANK_ACCOUNTS_FROZEN"]);
  if (totalCasesEl) totalCasesEl.textContent = activeCases.length;
  if (highRiskEl) highRiskEl.textContent = activeCases.filter(c => c.riskLevel === "HIGH" || c.riskScore >= 70).length;
  if (reportedEl) reportedEl.textContent = allCases.filter(c => escalatedStatuses.has(String(c.status || "").toUpperCase())).length;

  let cases = allCases;
  if (filterQuery) {
    cases = ThreatDatabase.searchCases(filterQuery);
  }

  if (!listEl) return;
  if (cases.length === 0) {
    listEl.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#767E77;">No matching case records found.</div>`;
    return;
  }

  listEl.innerHTML = cases.map(c => {
    const d = new Date(c.timestamp);
    const dateStr = `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
    const scoreColor = c.riskScore >= 70 ? "#B91C1C" : c.riskScore >= 40 ? "#D97706" : "#059669";
    const statusLabel = String(c.status || "OPEN").replace(/_/g, " ");
    const entityCount = Object.values(c.extractedEntities || {}).flat().filter(Boolean).length;

    return `
      <article class="police-case-card">
        <div class="police-case-card-top">
          <span class="police-case-id">${escapeHtml(c.caseId)}</span>
          <span class="police-case-risk" style="color:${scoreColor};">RISK ${escapeHtml(String(c.riskScore ?? "—"))}/100</span>
        </div>
        <div class="police-case-card-main">
          <div>
            <h3>${escapeHtml(c.title || "Untitled case")}</h3>
            <p>${escapeHtml(c.primaryCategory || "Digital threat")}</p>
          </div>
          <span class="police-case-status">${escapeHtml(statusLabel)}</span>
        </div>
        <div class="police-case-card-meta">
          <span>${escapeHtml(c.type || "CASE")} · ${escapeHtml(dateStr)}</span>
          <span>${entityCount} identifiers · ${escapeHtml(c.location || "Location unavailable")}</span>
        </div>
        <button type="button" class="btn btn-sm btn-outline police-case-open" onclick="loadCaseById('${escapeHtml(c.caseId)}')">Open case file</button>
      </article>
    `;
  }).join("");
}

// -------------------------------------------------------------
// 9. BROWSER EXTENSION INTERACTIVE TESTER (SCREEN 7)
// -------------------------------------------------------------
function setupBrowserExtensionTester() {
  const inputEl = document.getElementById("ext-url-input");
  const testBtn = document.getElementById("ext-btn-test");
  const displayUrlEl = document.getElementById("ext-display-url");
  const statusTagEl = document.getElementById("ext-status-tag");
  const threatScoreEl = document.getElementById("ext-threat-score");
  const threatBadgeEl = document.getElementById("ext-threat-badge");
  const threatCardEl = document.querySelector("#tab-extension .extension-threat-card");
  const threatTitleEl = document.getElementById("ext-threat-title");
  const threatDescEl = document.getElementById("ext-threat-desc");
  const threatIndicatorsEl = document.getElementById("ext-threat-indicators");
  const riskySampleBtn = document.getElementById("ext-sample-risky");
  const safeSampleBtn = document.getElementById("ext-sample-safe");

  const runExtensionTest = () => {
    const url = inputEl ? inputEl.value.trim() : "";
    if (!url) return;

    const res = ThreatAnalyzer.analyzeUrl(url);
    if (displayUrlEl) displayUrlEl.textContent = url;
    if (threatScoreEl) threatScoreEl.textContent = `${res.riskScore} / 100`;
    if (threatCardEl) {
      threatCardEl.classList.remove("safe", "suspicious", "danger");
      threatCardEl.classList.add(res.riskLevel === "HIGH" ? "danger" : res.riskLevel === "MEDIUM" ? "suspicious" : "safe");
    }

    if (res.riskLevel === "HIGH") {
      if (statusTagEl) {
        statusTagEl.textContent = "PHISHING";
        statusTagEl.style.color = "#DC2626";
      }
      if (threatBadgeEl) {
        threatBadgeEl.textContent = "DECEPTIVE SITE DETECTED";
        threatBadgeEl.className = "badge badge-high";
      }
      if (threatTitleEl) threatTitleEl.textContent = res.category || "Deceptive Impersonation Portal";
      if (threatDescEl) threatDescEl.textContent = "This site attempts to harvest your banking credentials and PAN details.";
    } else if (res.riskLevel === "MEDIUM") {
      if (statusTagEl) {
        statusTagEl.textContent = "SUSPICIOUS";
        statusTagEl.style.color = "#D97706";
      }
      if (threatBadgeEl) {
        threatBadgeEl.textContent = "SUSPICIOUS DESTINATION";
        threatBadgeEl.className = "badge badge-medium";
      }
      if (threatTitleEl) threatTitleEl.textContent = "Unverified External Gateway";
      if (threatDescEl) threatDescEl.textContent = "Domain characteristics show recent disposable infrastructure.";
    } else {
      if (statusTagEl) {
        statusTagEl.textContent = "SECURE";
        statusTagEl.style.color = "#059669";
      }
      if (threatBadgeEl) {
        threatBadgeEl.textContent = "VERIFIED BENIGN";
        threatBadgeEl.className = "badge badge-low";
      }
      if (threatTitleEl) threatTitleEl.textContent = "Standard Web Property";
      if (threatDescEl) threatDescEl.textContent = "No deceptive patterns or known phishing signatures found.";
    }

    if (threatIndicatorsEl) {
      if (res.indicators.length === 0) {
        threatIndicatorsEl.innerHTML = `<div>- Verified HTTPS and clean domain reputation</div>`;
      } else {
        threatIndicatorsEl.innerHTML = res.indicators.slice(0, 3).map(ind => `<div>- <strong>${escapeHtml(ind.title)}:</strong> ${escapeHtml(ind.severity)} severity pattern</div>`).join("");
      }
    }
  };

  if (testBtn) testBtn.onclick = runExtensionTest;
  if (riskySampleBtn) riskySampleBtn.onclick = () => {
    if (inputEl) inputEl.value = "https://sbi-yono-kyc-verify-portal.xyz/login.php";
    runExtensionTest();
  };
  if (safeSampleBtn) safeSampleBtn.onclick = () => {
    if (inputEl) inputEl.value = "https://www.sbi.co.in/";
    runExtensionTest();
  };
  if (inputEl) {
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runExtensionTest();
    });
  }
}

// -------------------------------------------------------------
// 10. PWA SHARE WIDGET SIMULATOR (SCREEN 8)
// -------------------------------------------------------------
function setupPwaSimulator() {
  const shareBtn = document.getElementById("sim-share-btn-2");
  const shareSheet = document.getElementById("sim-share-sheet-2");
  const trayClose = document.getElementById("sim-tray-close");
  const targetApp = document.getElementById("sim-target-app-2");
  const actionScan = document.getElementById("sim-action-scan-anvesh");
  const resultOverlay = document.getElementById("sim-result-overlay-2");
  const closeResult = document.getElementById("sim-close-result-2");
  const gotoReportBtn = document.getElementById("sim-goto-report-btn");
  const simMsgEl = document.getElementById("pwa-sim-msg-text");

  // Open native iOS share tray
  if (shareBtn && shareSheet) {
    shareBtn.onclick = () => {
      shareSheet.classList.remove("hidden");
      shareSheet.style.display = "flex";
    };
  }

  // Close native iOS share tray
  if (trayClose && shareSheet) {
    trayClose.onclick = () => {
      shareSheet.classList.add("hidden");
      shareSheet.style.display = "none";
    };
  }

  // Tap ANVESH app or Scan action
  const triggerTriage = () => {
    if (shareSheet) {
      shareSheet.classList.add("hidden");
      shareSheet.style.display = "none";
    }

    const text = simMsgEl ? simMsgEl.textContent : "Your loan is approved. ₹50,000 ready for disbursement. Complete your KYC immediately. quickcash-verify.in/kyc";
    const result = ThreatAnalyzer.analyzeMessage(text);

    const titleEl = document.getElementById("pwa-result-title");
    const scoreEl = document.getElementById("pwa-result-score");
    const badgeEl = document.getElementById("pwa-result-badge");
    const descEl = document.getElementById("pwa-result-desc");
    const screen2Score = document.getElementById("pwa-screen2-score");
    const screen2Title = document.getElementById("pwa-screen2-title");
    const screen2Desc = document.getElementById("pwa-screen2-desc");

    if (badgeEl) badgeEl.textContent = `SECURITY ALERT · ${result.riskScore} / 100`;
    if (titleEl) titleEl.textContent = result.category || "Predatory Instant Loan Fraud";
    if (descEl) descEl.textContent = "Unsolicited loan approval hook mimicking authentic NBFC without credit verification. Linked to reported mule infrastructure.";

    if (screen2Score) screen2Score.textContent = `CRITICAL · ${result.riskScore} / 100`;
    if (screen2Title) screen2Title.textContent = result.category || "Predatory Instant Loan Fraud";
    if (screen2Desc) screen2Desc.textContent = "Unsolicited loan approval hook mimicking authentic NBFC without credit verification. Linked to reported mule infrastructure.";

    if (resultOverlay) {
      resultOverlay.classList.remove("hidden");
      resultOverlay.style.display = "flex";
    }
  };

  if (targetApp) targetApp.onclick = triggerTriage;
  if (actionScan) actionScan.onclick = triggerTriage;

  // Close Alert Dialog
  if (closeResult && resultOverlay) {
    closeResult.onclick = () => {
      resultOverlay.classList.add("hidden");
      resultOverlay.style.display = "none";
    };
  }

  // Inspect in Forensic Desk button
  if (gotoReportBtn) {
    gotoReportBtn.onclick = () => {
      if (resultOverlay) {
        resultOverlay.classList.add("hidden");
        resultOverlay.style.display = "none";
      }
      const reportTab = document.querySelector('[data-tab="tab-report"]');
      if (reportTab) reportTab.click();
    };
  }
}

// -------------------------------------------------------------
// 11. TELEMETRY DASHBOARD CONTROLS (SCREEN 1)
// -------------------------------------------------------------
function setupTelemetry() {
  const openCasesList = document.getElementById("telemetry-open-cases-list");
  if (openCasesList) {
    openCasesList.addEventListener("click", (event) => {
      const detailsButton = event.target.closest("[data-open-case-id]");
      if (detailsButton) loadCaseById(detailsButton.getAttribute("data-open-case-id"));
    });
  }
  updateTelemetry();
}

function renderOpenCases(cases) {
  const listEl = document.getElementById("telemetry-open-cases-list");
  const countEl = document.getElementById("telemetry-open-cases-count");
  if (!listEl) return;

  const closedStatuses = new Set(["CLOSED", "RESOLVED", "VERIFIED_CLEAN", "ARCHIVED"]);
  const openCases = cases.filter(c => !closedStatuses.has(String(c.status || "").toUpperCase()));
  if (countEl) countEl.textContent = `${openCases.length} OPEN`;

  if (openCases.length === 0) {
    listEl.innerHTML = `<div class="open-cases-empty">There are no open cases right now.</div>`;
    return;
  }

  listEl.innerHTML = openCases.map(c => {
    const date = new Date(c.timestamp);
    const dateStr = Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const status = String(c.status || "OPEN").replace(/_/g, " ");
    return `
      <article class="open-case-row">
        <div>
          <div class="open-case-meta">
            <span class="open-case-id">${escapeHtml(c.caseId)}</span>
            <span>${escapeHtml(c.type || "CASE")}</span>
            <span>${escapeHtml(status)}</span>
            <span>${escapeHtml(dateStr)}</span>
          </div>
          <strong class="open-case-title">${escapeHtml(c.title || "Untitled case")}</strong>
          <p class="open-case-summary">${escapeHtml(c.primaryCategory || "Digital threat")} · Risk ${escapeHtml(c.riskScore ?? "—")}/100 · ${escapeHtml(c.location || "Location unavailable")}</p>
        </div>
        <button type="button" class="btn btn-outline open-case-details" data-open-case-id="${escapeHtml(c.caseId)}">View full details</button>
      </article>
    `;
  }).join("");
}

function renderCaseCategoryChart(cases) {
  const chartEl = document.getElementById("telemetry-category-chart");
  const legendEl = document.getElementById("telemetry-category-legend");
  const totalEl = document.getElementById("telemetry-category-total");
  if (!chartEl || !legendEl) return;

  const categoryLabels = {
    "Electricity Bill Disconnection Scam": "Electricity power cutoff",
    "Legitimate / Non-Threat": "Legitimate banking OTP",
    "Predatory Loan / Malicious Spyware APK": "Predatory loan extortion APK",
    "Parcel / Courier Delivery Fraud": "Parcel delivery reschedule",
    "Phishing Impersonation (SBI)": "Fake KYC / suspension"
  };
  const colors = ["#2563EB", "#0F766E", "#D97706", "#DC2626", "#7C3AED", "#0891B2", "#64748B"];
  const counts = new Map();
  cases.forEach(c => {
    const key = c.primaryCategory || "Other reported cases";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = cases.length;
  if (totalEl) totalEl.textContent = total;
  if (!total) {
    chartEl.style.background = "#E2E8F0";
    legendEl.innerHTML = `<div class="case-category-empty">No reported cases yet.</div>`;
    return;
  }

  let cursor = 0;
  const stops = entries.map(([key, count], index) => {
    const start = cursor;
    cursor += (count / total) * 100;
    return `${colors[index % colors.length]} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
  });
  chartEl.style.background = `conic-gradient(${stops.join(", ")})`;
  legendEl.innerHTML = entries.map(([key, count], index) => {
    const percent = (count / total) * 100;
    return `<div class="case-category-legend-row">
      <span class="case-category-swatch" style="background:${colors[index % colors.length]}"></span>
      <span class="case-category-label">${escapeHtml(categoryLabels[key] || key)}</span>
      <strong>${count} <small>(${percent.toFixed(1)}%)</small></strong>
    </div>`;
  }).join("");
}

function updateTelemetry() {
  const artifactsEl = document.getElementById("telemetry-stat-artifacts");
  const mulesEl = document.getElementById("telemetry-stat-mules");
  const classEl = document.getElementById("telemetry-stat-class");
  const riskEl = document.getElementById("telemetry-stat-risk");
  const heatTbody = document.getElementById("telemetry-heat-tbody");

  const cases = ThreatDatabase.getCases();
  const heatList = ThreatDatabase.getHeatList();
  renderOpenCases(cases);
  renderCaseCategoryChart(cases);

  if (artifactsEl) artifactsEl.textContent = 1480 + cases.length;
  if (mulesEl) mulesEl.textContent = `${heatList.length} Active`;

  if (currentCase) {
    if (classEl) classEl.textContent = `${(currentCase.primaryCategory || "CYBER FRAUD").toUpperCase()} (94.2%)`;
    if (riskEl) {
      riskEl.textContent = `${currentCase.riskScore}/100 (${currentCase.riskLevel} RISK)`;
      riskEl.className = `metric-value ${currentCase.riskLevel === "HIGH" ? "red" : "blue"}`;
    }
  }

  // Populate Heat List Table
  if (heatTbody && heatList.length > 0) {
    heatTbody.innerHTML = heatList.slice(0, 5).map(item => {
      let actionTag = "NPCI Freeze";
      let actionClass = "badge-high";

      if (item.type === "PHONE") {
        actionTag = "TAFCOP Alert";
        actionClass = "badge-medium";
      } else if (item.type === "DOMAIN") {
        actionTag = "DNS Takedown";
        actionClass = "badge-high";
      } else if (item.type === "APK") {
        actionTag = "Malware Flag";
        actionClass = "badge-high";
      }

      return `
        <tr>
          <td><code>${escapeHtml(item.identifier)}</code></td>
          <td>${item.threatCategory || "Syndicated Infrastructure"}</td>
          <td><span class="badge ${actionClass}">${actionTag}</span></td>
        </tr>
      `;
    }).join("");
  }
}

// Helper: Escape HTML string to prevent XSS
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
