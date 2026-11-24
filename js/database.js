/**
 * ThreatDatabase - Case Storage, Cross-Case Identifier Correlation, and Heat-List Aggregator
 * Runs client-side using localStorage with realistic pre-seeded cybercrime case history.
 */

const ThreatDatabase = (function () {
  const STORAGE_KEY = "SALAMI_CYBER_CASES_V1";

  // Pre-seeded authentic case records representing Indian cyber fraud trends
  const SEED_CASES = [
    {
      caseId: "CASE-2026-IND-001",
      timestamp: "2026-11-20T10:14:00.000Z",
      type: "MESSAGE",
      title: "Electricity Disconnection Panic Alert",
      rawInput: "Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma at 9876543210. BESCOM Helpline.",
      riskLevel: "HIGH",
      riskScore: 92,
      primaryCategory: "Electricity Bill Disconnection Scam",
      indicators: [
        { title: "Electricity Bill Disconnection Scam", severity: "HIGH", impact: "+45 Risk" },
        { title: "Artificial Urgency & Fear Tactic", severity: "HIGH", impact: "+20 Risk" },
        { title: "Direct Mobile / Helpline Spoofing", severity: "MEDIUM", impact: "+15 Risk" }
      ],
      extractedEntities: {
        phones: ["9876543210"],
        urls: [],
        upis: ["bijli.officer@paytm"],
        emails: []
      },
      status: "UNDER_INVESTIGATION",
      reportedBy: "Citizen Portal (PWA Widget)",
      location: "Bengaluru, Karnataka"
    },
    {
      caseId: "CASE-2026-IND-002",
      timestamp: "2026-11-21T14:30:00.000Z",
      type: "URL",
      title: "SBI YONO Lookalike Phishing Portal",
      rawInput: "http://sbi-yono-kyc-verify-portal.xyz/login.php?ref=sms9876543210",
      riskLevel: "HIGH",
      riskScore: 95,
      primaryCategory: "Phishing Impersonation (SBI)",
      indicators: [
        { title: "Brand Impersonation (SBI)", severity: "HIGH", impact: "+50 Risk" },
        { title: "High-Risk TLD Abuse (.xyz)", severity: "HIGH", impact: "+35 Risk" },
        { title: "Deceptive Credential / Verification Keywords", severity: "MEDIUM", impact: "+25 Risk" },
        { title: "Unencrypted Connection (HTTP)", severity: "MEDIUM", impact: "+20 Risk" }
      ],
      extractedEntities: {
        phones: ["9876543210"],
        urls: ["http://sbi-yono-kyc-verify-portal.xyz/login.php?ref=sms9876543210"],
        upis: [],
        domain: "sbi-yono-kyc-verify-portal.xyz"
      },
      status: "TAKEDOWN_REQUESTED",
      reportedBy: "Cyber Cell Patrol",
      location: "Mumbai, Maharashtra"
    },
    {
      caseId: "CASE-2026-IND-003",
      timestamp: "2026-11-22T08:45:00.000Z",
      type: "APK",
      title: "QuickCash Instant Loan (Predatory Harassment APK)",
      rawInput: "QuickCash_v2.4_disbursement.apk",
      appName: "QuickCash Loan",
      packageName: "com.quickcash.instantcredit.loan",
      certFingerprint: "SHA256:4C:8E:1A:99:F2:B3:01:A8:12:34:56:78:9A:BC:DE:F0",
      riskLevel: "HIGH",
      riskScore: 96,
      primaryCategory: "Predatory Loan / Malicious Spyware APK",
      indicators: [
        { title: "Signature Loan-Extortion Permission Cluster", severity: "HIGH", impact: "+35 Risk" },
        { title: "Predatory Permission Abuse (4 High-Risk Flags)", severity: "HIGH", impact: "+50 Risk" },
        { title: "Hardcoded Server IP Endpoints (185.220.101.5)", severity: "HIGH", impact: "+25 Risk" }
      ],
      extractedEntities: {
        ips: ["185.220.101.5", "103.251.167.22"],
        urls: ["http://api.quickcash-server.top/sync"],
        upis: ["loanrepay.mule@ybl", "bijli.officer@paytm"],
        phones: ["9876543210", "9123456780"]
      },
      status: "EVIDENCE_FILED",
      reportedBy: "Citizen FIR #402/2026",
      location: "New Delhi"
    },
    {
      caseId: "CASE-2026-IND-004",
      timestamp: "2026-11-22T19:10:00.000Z",
      type: "WEBSITE",
      title: "Royal Fortune 99 - Color Prediction & Ponzi Portal",
      rawInput: "https://royalfortune99-win.club",
      url: "https://royalfortune99-win.club",
      pageTitle: "Royal Fortune 99 | 100% Guaranteed Daily Return & Color Game",
      riskLevel: "HIGH",
      riskScore: 98,
      primaryCategory: "Illegal Online Betting & Casino",
      indicators: [
        { title: "Illegal Betting / Color Prediction Mechanism", severity: "HIGH", impact: "+50 Risk" },
        { title: "Guaranteed Return & Ponzi Deception", severity: "HIGH", impact: "+45 Risk" },
        { title: "Multi-Tier Referral Pyramid Scheme", severity: "HIGH", impact: "+35 Risk" },
        { title: "Cryptocurrency Ingestion Wallets (USDT TRC-20)", severity: "HIGH", impact: "+25 Risk" }
      ],
      extractedEntities: {
        upis: ["royalfortune.deposit@okhdfcbank", "loanrepay.mule@ybl"],
        bankIfsc: ["HDFC0001234"],
        phones: ["9123456780"],
        cryptoTron: ["TXzK49w6U7vNm1qRt88sV2xPqLz3Jb"],
        telegramWa: ["t.me/royalfortune_admin"],
        urls: ["https://royalfortune99-win.club"]
      },
      status: "BANK_ACCOUNTS_FROZEN",
      reportedBy: "State Cyber Security Agency",
      location: "Hyderabad, Telangana"
    },
    {
      caseId: "CASE-2026-IND-005",
      timestamp: "2026-11-23T11:20:00.000Z",
      type: "MESSAGE",
      title: "India Post Failed Parcel Notification",
      rawInput: "India Post: Your parcel IN-88231 has arrived at dispatch hub but cannot be delivered due to incomplete street address. Please update your address within 24 hours to avoid return: http://indiapost-parcel-reschedule.top/track",
      riskLevel: "HIGH",
      riskScore: 88,
      primaryCategory: "Parcel / Courier Delivery Fraud",
      indicators: [
        { title: "Parcel / Courier Delivery Fraud", severity: "HIGH", impact: "+40 Risk" },
        { title: "Artificial Urgency & Fear Tactic", severity: "HIGH", impact: "+20 Risk" },
        { title: "High-Risk Embedded Link: indiapost-parcel-reschedule.top", severity: "HIGH", impact: "+25 Risk" }
      ],
      extractedEntities: {
        phones: [],
        urls: ["http://indiapost-parcel-reschedule.top/track"],
        upis: [],
        emails: []
      },
      status: "UNDER_INVESTIGATION",
      reportedBy: "WhatsApp Share Target",
      location: "Jaipur, Rajasthan"
    },
    {
      caseId: "CASE-2026-IND-006",
      timestamp: "2026-11-23T16:00:00.000Z",
      type: "MESSAGE",
      title: "Legitimate HDFC Bank NetBanking OTP",
      rawInput: "482910 is your secret OTP for transaction of INR 1,500.00 on Amazon Pay with HDFC Bank Card ending 4012. Do not share OTP with anyone including bank staff.",
      riskLevel: "LOW",
      riskScore: 5,
      primaryCategory: "Legitimate / Non-Threat",
      indicators: [
        { title: "Legitimate Transaction / OTP Pattern", severity: "LOW", impact: "-40 Risk" }
      ],
      extractedEntities: {
        phones: [],
        urls: [],
        upis: [],
        emails: []
      },
      status: "VERIFIED_CLEAN",
      reportedBy: "Citizen Self-Check",
      location: "Pune, Maharashtra"
    }
  ];

  function getCases() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CASES));
        return SEED_CASES;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Storage error:", e);
      return SEED_CASES;
    }
  }

  function saveCase(newCase) {
    const cases = getCases();
    // Prepend new case
    cases.unshift(newCase);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.warn("Storage quota full, keeping in memory", e);
    }
    return newCase;
  }

  function getCaseById(id) {
    return getCases().find(c => c.caseId === id) || null;
  }

  // --- CROSS-CASE IDENTIFIER LINKING (The Graph Engine) ---
  function findLinkedCases(caseData) {
    const allCases = getCases().filter(c => c.caseId !== caseData.caseId);
    const linked = [];

    // Extract identifiers of target case
    const targetPhones = new Set(caseData.extractedEntities?.phones || []);
    const targetUpis = new Set((caseData.extractedEntities?.upis || []).map(u => u.toLowerCase()));
    const targetUrls = new Set(caseData.extractedEntities?.urls || []);
    const targetDomains = new Set([
      caseData.extractedEntities?.domain,
      ...(caseData.extractedEntities?.urls || []).map(u => {
        try { return new URL(u).hostname.toLowerCase(); } catch (e) { return null; }
      }).filter(Boolean)
    ]);
    const targetIps = new Set(caseData.extractedEntities?.ips || []);
    const targetCrypto = new Set([
      ...(caseData.extractedEntities?.cryptoTron || []),
      ...(caseData.extractedEntities?.cryptoEth || []),
      ...(caseData.extractedEntities?.cryptoBtc || [])
    ]);

    allCases.forEach(c => {
      const matchedTokens = [];

      // Check phone match
      (c.extractedEntities?.phones || []).forEach(p => {
        if (targetPhones.has(p)) matchedTokens.push({ type: "PHONE_NUMBER", value: p });
      });

      // Check UPI match
      (c.extractedEntities?.upis || []).forEach(u => {
        if (targetUpis.has(u.toLowerCase())) matchedTokens.push({ type: "UPI_ID", value: u });
      });

      // Check Domain match
      (c.extractedEntities?.urls || []).forEach(u => {
        try {
          const host = new URL(u).hostname.toLowerCase();
          if (targetDomains.has(host)) matchedTokens.push({ type: "DOMAIN", value: host });
        } catch (e) {}
      });

      // Check IP match
      (c.extractedEntities?.ips || []).forEach(ip => {
        if (targetIps.has(ip)) matchedTokens.push({ type: "SERVER_IP", value: ip });
      });

      // Check Crypto match
      const cCrypto = [
        ...(c.extractedEntities?.cryptoTron || []),
        ...(c.extractedEntities?.cryptoEth || []),
        ...(c.extractedEntities?.cryptoBtc || [])
      ];
      cCrypto.forEach(w => {
        if (targetCrypto.has(w)) matchedTokens.push({ type: "CRYPTO_WALLET", value: w });
      });

      if (matchedTokens.length > 0) {
        linked.push({
          linkedCase: c,
          matchedTokens,
          linkConfidence: matchedTokens.length >= 2 ? "CONFIRMED_SYNDICATE" : "HIGH_PROBABILITY"
        });
      }
    });

    return linked;
  }

  // --- HEAT-LIST AGGREGATOR ---
  function getHeatList() {
    const cases = getCases();
    const phoneMap = {};
    const domainMap = {};
    const upiMap = {};
    const appMap = {};

    cases.forEach(c => {
      // 1. Phone counts
      (c.extractedEntities?.phones || []).forEach(p => {
        if (!phoneMap[p]) phoneMap[p] = { identifier: p, count: 0, cases: [], lastSeen: c.timestamp, risk: c.riskLevel };
        phoneMap[p].count++;
        phoneMap[p].cases.push(c.caseId);
      });

      // 2. UPI counts
      (c.extractedEntities?.upis || []).forEach(u => {
        const key = u.toLowerCase();
        if (!upiMap[key]) upiMap[key] = { identifier: key, count: 0, cases: [], lastSeen: c.timestamp, risk: c.riskLevel };
        upiMap[key].count++;
        upiMap[key].cases.push(c.caseId);
      });

      // 3. Domain counts
      const urls = c.extractedEntities?.urls || [];
      if (c.extractedEntities?.domain) urls.push("http://" + c.extractedEntities.domain);
      urls.forEach(u => {
        try {
          const host = new URL(u).hostname.toLowerCase();
          if (host && !host.includes("amazon") && !host.includes("hdfcbank.com")) {
            if (!domainMap[host]) domainMap[host] = { identifier: host, count: 0, cases: [], lastSeen: c.timestamp, risk: c.riskLevel };
            domainMap[host].count++;
            domainMap[host].cases.push(c.caseId);
          }
        } catch (e) {}
      });

      // 4. App counts
      if (c.packageName) {
        const pkg = c.packageName;
        if (!appMap[pkg]) appMap[pkg] = { identifier: pkg, appName: c.appName || pkg, count: 0, cases: [], lastSeen: c.timestamp, risk: c.riskLevel };
        appMap[pkg].count++;
        appMap[pkg].cases.push(c.caseId);
      }
    });

    const sortByCount = obj => Object.values(obj).sort((a, b) => b.count - a.count);

    const topPhones = sortByCount(phoneMap).slice(0, 10).map(x => ({ ...x, type: "PHONE", threatCategory: "SMS Phishing Ring" }));
    const topUpis = sortByCount(upiMap).slice(0, 10).map(x => ({ ...x, type: "UPI", threatCategory: "Mule Account Extortion" }));
    const topDomains = sortByCount(domainMap).slice(0, 10).map(x => ({ ...x, type: "DOMAIN", threatCategory: "Typosquatting KYC" }));
    const topApps = sortByCount(appMap).slice(0, 10).map(x => ({ ...x, type: "APK", threatCategory: "Predatory Permissions" }));

    const flatList = [...topUpis, ...topPhones, ...topDomains, ...topApps];
    flatList.topPhones = topPhones;
    flatList.topUpis = topUpis;
    flatList.topDomains = topDomains;
    flatList.topApps = topApps;

    return flatList;
  }

  // --- SEARCH AND FILTER ---
  function searchCases(query = "", typeFilter = "ALL", riskFilter = "ALL") {
    const cases = getCases();
    const q = query.toLowerCase().trim();

    return cases.filter(c => {
      // Type Filter
      if (typeFilter !== "ALL" && c.type !== typeFilter) return false;
      // Risk Filter
      if (riskFilter !== "ALL" && c.riskLevel !== riskFilter) return false;
      // Query search
      if (!q) return true;

      const titleMatch = (c.title || "").toLowerCase().includes(q);
      const rawMatch = (c.rawInput || "").toLowerCase().includes(q);
      const idMatch = c.caseId.toLowerCase().includes(q);
      const categoryMatch = (c.primaryCategory || "").toLowerCase().includes(q);
      const phoneMatch = (c.extractedEntities?.phones || []).some(p => p.includes(q));
      const upiMatch = (c.extractedEntities?.upis || []).some(u => u.toLowerCase().includes(q));
      const urlMatch = (c.extractedEntities?.urls || []).some(u => u.toLowerCase().includes(q));
      const pkgMatch = (c.packageName || "").toLowerCase().includes(q);

      return titleMatch || rawMatch || idMatch || categoryMatch || phoneMatch || upiMatch || urlMatch || pkgMatch;
    });
  }

  function resetToDefault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CASES));
    return SEED_CASES;
  }

  return {
    getCases,
    saveCase,
    getCaseById,
    findLinkedCases,
    getHeatList,
    searchCases,
    resetToDefault
  };
})();

if (typeof window !== 'undefined') {
  window.ThreatDatabase = ThreatDatabase;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreatDatabase;
}

