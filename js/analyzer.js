/**
 * ThreatAnalyzer - Unified Core Engine for Scam, URL, APK, and Website Analysis
 * Implemented in pure JavaScript (Zero-dependency, runs client-side).
 */

const ThreatAnalyzer = (function () {

  // --- Regex Patterns for Financial & Actionable Identifiers ---
  const PATTERNS = {
    phone: /(?:(?:\+|00)91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}|\b\d{10}\b/g,
    upi: /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g,
    url: /https?:\/\/[^\s"'<>]+/gi,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ifsc: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    cryptoBtc: /\b(?:1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\b/g,
    cryptoEth: /\b0x[a-fA-F0-9]{40}\b/g,
    cryptoTron: /\bT[A-Za-z1-9]{28,33}\b/g,
    ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    telegramWa: /(?:t\.me\/[a-zA-Z0-9_]+|wa\.me\/(?:\+?91)?\d{10}|chat\.whatsapp\.com\/[a-zA-Z0-9]+)/gi
  };

  // --- High-Risk Keywords & Categories for Text/SMS Analysis ---
  const THREAT_TAXONOMY = {
    FAKE_KYC: {
      name: "Fake KYC / Banking Suspension Scam",
      regex: /(?:kyc|pan\s*card|aadhaar|block(?:ed)?|suspend(?:ed)?|deactivat(?:ed)?|yono|sbi|hdfc|icici|axis|pnb|paytm|wallet)\b.*?(?:updat(?:e|ed)|verif(?:y|ication)|link|expir(?:e|ed)|immediately)/i,
      severity: "HIGH",
      baseScore: 40,
      description: "Impersonates banks/wallets claiming account suspension due to pending KYC or PAN linkage."
    },
    ELECTRICITY_DISCONNECT: {
      name: "Electricity Bill Disconnection Scam",
      regex: /(?:electricity|power|bijli)\s*(?:bill|supply|power)?.*?(?:disconnect(?:ed)?|cut\s*off|tonight|9:30|update).*?(?:officer|contact|helpline|call)/i,
      severity: "HIGH",
      baseScore: 45,
      description: "Threatens immediate power disconnection tonight due to unpaid bill; directs victim to call a fraud officer."
    },
    PARCEL_COURIER: {
      name: "Parcel / Courier Delivery Fraud",
      regex: /(?:india\s*post|bluedart|dtdc|courier|parcel|shipment|package).*?(?:address|fail(?:ed)?|hold|terminal|dispatched|reschedule|update)/i,
      severity: "HIGH",
      baseScore: 40,
      description: "Fake postal/courier alert stating parcel delivery failed due to wrong address."
    },
    PART_TIME_JOB: {
      name: "Part-Time Task / Telegram Job Scam",
      regex: /(?:work\s*from\s*home|part\s*time\s*job|earn\s*(?:rs\.?|inr|₹)?\s*\d{3,5}|like\s*youtube|rate\s*hotel|daily\s*income).*?(?:whatsapp|telegram|contact|hr|task)/i,
      severity: "HIGH",
      baseScore: 45,
      description: "Promises unrealistic daily income (₹2000-₹8000/day) for liking videos or rating hotels on Telegram."
    },
    FAKE_LOAN: {
      name: "Predatory Instant Loan Trap",
      regex: /(?:instant\s*loan|pre-?approved|loan\s*approved|disbursed|without\s*cibil|zero\s*interest|quick\s*cash|loan\s*credited).*?(?:download|apk|apply|link)/i,
      severity: "HIGH",
      baseScore: 40,
      description: "Lures victims with pre-approved loans requiring no credit check, pushing predatory loan APKs."
    },
    LOTTERY_KBC: {
      name: "Lottery / Prize / KBC Scam",
      regex: /(?:kbc|lottery|winner|won\s*(?:rs\.?|₹)?\s*\d{2,7}|lucky\s*draw|congratulations).*?(?:claim|manager|whatsapp|call)/i,
      severity: "HIGH",
      baseScore: 45,
      description: "Promises false lottery winnings (e.g. KBC 25 Lakhs) requiring upfront processing charges."
    },
    LEGAL_THREAT: {
      name: "Digital Arrest / Fake Legal Notice",
      regex: /(?:police|cyber\s*crime|cbi|narcotics|arrest\s*warrant|court|legal\s*action|fir\s*registered).*?(?:immediately|contact|appear|fine)/i,
      severity: "HIGH",
      baseScore: 50,
      description: "Digital arrest extortion impersonating police/CBI with fake legal summons."
    }
  };

  // --- High Risk TLDs and URL Characteristics ---
  const HIGH_RISK_TLDS = ['.xyz', '.top', '.vip', '.buzz', '.work', '.click', '.club', '.rest', '.cam', '.live', '.online', '.site', '.loan', '.tk', '.ml', '.ga', '.cf', '.gq', '.icu', '.monster'];
  const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.me', 'wa.me', 'is.gd', 'cutt.ly', 'rb.gy', 'v.gd', 'rebrand.ly'];
  const BANK_BRANDS = ['sbi', 'yono', 'hdfc', 'icici', 'axis', 'paytm', 'phonepe', 'gpay', 'bhim', 'pnb', 'bob', 'canara', 'indiapost'];

  // --- DANGEROUS APK PERMISSION CLUSTERS ---
  const PREDATORY_PERMISSIONS = {
    "android.permission.READ_CONTACTS": { weight: 20, reason: "Harvests user's phone contacts for harassment and debt extortion" },
    "android.permission.READ_SMS": { weight: 25, reason: "Intercepts incoming bank OTPs and financial verification messages" },
    "android.permission.RECEIVE_SMS": { weight: 25, reason: "Real-time OTP interception without user notification" },
    "android.permission.SEND_SMS": { weight: 15, reason: "Can send premium rate SMS or worm itself to contacts" },
    "android.permission.CAMERA": { weight: 15, reason: "Enables covert photo capture for morphed image blackmail" },
    "android.permission.ACCESS_FINE_LOCATION": { weight: 10, reason: "Tracks precise physical whereabouts of victim" },
    "android.permission.RECORD_AUDIO": { weight: 15, reason: "Unauthorized ambient audio recording" },
    "android.permission.READ_CALL_LOG": { weight: 15, reason: "Extracts call patterns and emergency family contacts" },
    "android.permission.BIND_ACCESSIBILITY_SERVICE": { weight: 35, reason: "Dangerous: Can click buttons, read screen text, and steal credentials silently" }
  };

  // Helper: Extract unique matches from string
  function getUniqueMatches(regex, text) {
    if (!text) return [];
    const matches = text.match(regex) || [];
    return [...new Set(matches.map(m => m.trim()))];
  }

  // ==========================================
  // 1. MESSAGE / TEXT ANALYZER
  // ==========================================
  function analyzeMessage(text) {
    if (!text || typeof text !== 'string') {
      return { error: "Empty or invalid message input" };
    }

    const cleanText = text.trim();
    let riskScore = 0;
    const indicators = [];
    const matchedCategories = [];

    // Extract Actionable Identifiers
    const extractedEntities = {
      phones: getUniqueMatches(PATTERNS.phone, cleanText),
      urls: getUniqueMatches(PATTERNS.url, cleanText),
      upis: getUniqueMatches(PATTERNS.upi, cleanText),
      emails: getUniqueMatches(PATTERNS.email, cleanText),
      telegramOrWa: getUniqueMatches(PATTERNS.telegramWa, cleanText)
    };

    // 1. Check Threat Taxonomy Patterns
    for (const [key, category] of Object.entries(THREAT_TAXONOMY)) {
      if (category.regex.test(cleanText)) {
        riskScore += category.baseScore;
        matchedCategories.push(category.name);
        indicators.push({
          code: key,
          title: category.name,
          severity: category.severity,
          description: category.description,
          impact: `+${category.baseScore} Risk`
        });
      }
    }

    // 2. Urgency & Coercion Detection
    const urgencyRegex = /\b(urgently|immediately|within\s*\d+\s*(?:hours|hrs|mins|minutes)|right\s*now|tonight|today\s*itself|last\s*chance|warning|action\s*required|blocked\s*today)\b/i;
    if (urgencyRegex.test(cleanText)) {
      riskScore += 20;
      indicators.push({
        code: "PSYCHOLOGICAL_URGENCY",
        title: "Artificial Urgency & Fear Tactic",
        severity: "HIGH",
        description: "Uses coercive deadlines ('immediately', 'within 24 hrs', 'tonight') designed to panic victim into compliance.",
        impact: "+20 Risk"
      });
    }

    // 3. Embedded Link Inspection
    if (extractedEntities.urls.length > 0) {
      riskScore += 15;
      indicators.push({
        code: "EMBEDDED_LINK",
        title: "Contains External Action Link",
        severity: "MEDIUM",
        description: `Found ${extractedEntities.urls.length} link(s) embedded in the message.`,
        impact: "+15 Risk"
      });

      // Analyze embedded URLs individually
      extractedEntities.urls.forEach(u => {
        const urlReport = analyzeUrl(u);
        if (urlReport.riskScore >= 60) {
          riskScore += 25;
          indicators.push({
            code: "MALICIOUS_EMBEDDED_URL",
            title: `High-Risk Embedded Link: ${urlReport.hostname}`,
            severity: "HIGH",
            description: urlReport.summary || "Embedded link exhibits strong phishing or deceptive characteristics.",
            impact: "+25 Risk"
          });
        }
      });
    }

    // 4. Contact Redirection (Personal mobile number or WhatsApp/Telegram)
    if (extractedEntities.phones.length > 0 && matchedCategories.length > 0) {
      riskScore += 15;
      indicators.push({
        code: "UNOFFICIAL_CONTACT_CALLOUT",
        title: "Direct Mobile / Helpline Spoofing",
        severity: "MEDIUM",
        description: "Directs victim to call/message personal 10-digit mobile numbers instead of official toll-free portals.",
        impact: "+15 Risk"
      });
    }

    // 5. Legitimate Transactional Check (Negative Weight to prevent false positive on genuine OTPs)
    const legitOtpPattern = /\b(?:is\s*your\s*one\s*time\s*password|otp\s*for\s*(?:login|txn|transaction|card)|do\s*not\s*share\s*(?:this|otp)|valid\s*for\s*\d+\s*mins?)\b/i;
    const isStandardOtp = legitOtpPattern.test(cleanText) && extractedEntities.urls.length === 0 && matchedCategories.length === 0;
    if (isStandardOtp) {
      riskScore = Math.max(0, riskScore - 40);
      indicators.push({
        code: "STANDARD_BANKING_OTP",
        title: "Legitimate Transaction / OTP Pattern",
        severity: "LOW",
        description: "Message resembles authentic one-time password communication with standard security advisories.",
        impact: "-40 Risk"
      });
    }

    // Cap Risk Score between 0 and 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    let riskLevel = "LOW";
    if (riskScore >= 65) riskLevel = "HIGH";
    else if (riskScore >= 35) riskLevel = "MEDIUM";

    return {
      type: "MESSAGE",
      timestamp: new Date().toISOString(),
      rawInput: cleanText,
      riskScore,
      riskLevel,
      primaryCategory: matchedCategories[0] || (riskLevel === "LOW" ? "Legitimate / Non-Threat" : "Suspicious Text"),
      categories: matchedCategories,
      indicators,
      extractedEntities,
      summary: generateSummary("Message", riskLevel, riskScore, indicators)
    };
  }

  // ==========================================
  // 2. URL & DOMAIN ANALYZER
  // ==========================================
  function analyzeUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') {
      return { error: "Invalid URL string" };
    }

    let urlObj;
    let normalized = urlStr.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "http://" + normalized;
    }

    try {
      urlObj = new URL(normalized);
    } catch (e) {
      return {
        type: "URL",
        rawInput: urlStr,
        riskScore: 80,
        riskLevel: "HIGH",
        indicators: [{
          code: "MALFORMED_URL",
          title: "Malformed or Obfuscated URL Syntax",
          severity: "HIGH",
          description: "URL syntax is invalid or crafted to evade standard parsers."
        }],
        extractedEntities: { phones: [], urls: [urlStr], upis: [] },
        summary: "Malformed URL crafted to bypass standard domain security checks."
      };
    }

    let riskScore = 0;
    const indicators = [];
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    // 1. Protocol Check (HTTP vs HTTPS)
    if (urlObj.protocol === 'http:') {
      riskScore += 20;
      indicators.push({
        code: "INSECURE_HTTP",
        title: "Unencrypted Connection (HTTP)",
        severity: "MEDIUM",
        description: "Uses unencrypted HTTP protocol. Legitimate banking and institutional portals mandate HTTPS.",
        impact: "+20 Risk"
      });
    }

    // 2. IP Address in Hostname
    if (PATTERNS.ip.test(hostname)) {
      riskScore += 45;
      indicators.push({
        code: "NUMERIC_IP_HOST",
        title: "Direct IP Address Host",
        severity: "HIGH",
        description: "Uses a raw numerical IP address instead of a registered domain name (common in drive-by C2 servers).",
        impact: "+45 Risk"
      });
    }

    // 3. High-Risk / Free-tier TLD Check
    const hasHighRiskTld = HIGH_RISK_TLDS.some(tld => hostname.endsWith(tld));
    if (hasHighRiskTld) {
      riskScore += 35;
      const matchedTld = HIGH_RISK_TLDS.find(tld => hostname.endsWith(tld));
      indicators.push({
        code: "HIGH_RISK_TLD",
        title: `High-Risk TLD Abuse (${matchedTld})`,
        severity: "HIGH",
        description: `Uses top-level domain ${matchedTld}, heavily favored by automated phishing kits and disposable scam campaigns.`,
        impact: "+35 Risk"
      });
    }

    // 4. URL Shortener Detection
    const isShortener = SHORTENERS.some(s => hostname.includes(s));
    if (isShortener) {
      riskScore += 25;
      indicators.push({
        code: "URL_SHORTENER_MASK",
        title: "URL Shortener Masking",
        severity: "MEDIUM",
        description: "Uses a URL redirection/shortening service to conceal the true destination and bypass domain reputation filters.",
        impact: "+25 Risk"
      });
    }

    // 5. Brand Impersonation / Typosquatting in Hostname or Path
    const targetBrand = BANK_BRANDS.find(brand => hostname.includes(brand) || pathname.includes(brand));
    if (targetBrand) {
      // Check if it's the official domain
      const officialDomains = ['onlinesbi.sbi', 'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'paytm.com', 'phonepe.com', 'indiapost.gov.in'];
      const isOfficial = officialDomains.some(od => hostname === od || hostname.endsWith('.' + od));
      
      if (!isOfficial) {
        riskScore += 50;
        indicators.push({
          code: "BRAND_TYPOSQUATTING",
          title: `Brand Impersonation (${targetBrand.toUpperCase()})`,
          severity: "HIGH",
          description: `Target name '${targetBrand}' found in an unofficial domain (${hostname}). High likelihood of phishing clone.`,
          impact: "+50 Risk"
        });
      }
    }

    // 6. Suspicious Keywords in Path or Subdomains
    const suspiciousPathRegex = /(?:kyc|update|login|signin|verification|banking|secure|yono|disbursement|pan-card|wallet-refund|apk)/i;
    if (suspiciousPathRegex.test(pathname) || suspiciousPathRegex.test(hostname)) {
      riskScore += 25;
      indicators.push({
        code: "DECEPTIVE_PATH_KEYWORDS",
        title: "Deceptive Credential / Verification Keywords",
        severity: "MEDIUM",
        description: "Path or subdomain contains sensitive trigger words ('kyc', 'update', 'login', 'secure').",
        impact: "+25 Risk"
      });
    }

    // 7. Excessive Hyphens / Subdomain Sprawl
    const hyphenCount = (hostname.match(/-/g) || []).length;
    if (hyphenCount >= 3) {
      riskScore += 20;
      indicators.push({
        code: "HYPHEN_OBFUSCATION",
        title: "Excessive Domain Hyphenation",
        severity: "MEDIUM",
        description: `Hostname contains ${hyphenCount} hyphens, a common pattern in machine-generated phishing look-alike domains.`,
        impact: "+20 Risk"
      });
    }

    // 8. Direct APK download link in URL
    if (pathname.endsWith('.apk')) {
      riskScore += 40;
      indicators.push({
        code: "DIRECT_APK_DOWNLOAD",
        title: "Direct Unverified APK Download",
        severity: "HIGH",
        description: "Links directly to an Android package file (.apk) hosted outside verified app stores (Play Store/App Store).",
        impact: "+40 Risk"
      });
    }

    // Cap Risk Score
    riskScore = Math.min(100, Math.max(0, riskScore));
    let riskLevel = "LOW";
    if (riskScore >= 65) riskLevel = "HIGH";
    else if (riskScore >= 35) riskLevel = "MEDIUM";

    return {
      type: "URL",
      timestamp: new Date().toISOString(),
      rawInput: urlStr,
      normalizedUrl: urlObj.href,
      hostname,
      protocol: urlObj.protocol,
      pathname: urlObj.pathname,
      riskScore,
      riskLevel,
      primaryCategory: targetBrand ? `Phishing Impersonation (${targetBrand.toUpperCase()})` : (riskLevel === "HIGH" ? "Suspicious Phishing Domain" : "Clean / Low-Risk URL"),
      indicators,
      extractedEntities: {
        phones: getUniqueMatches(PATTERNS.phone, urlStr),
        urls: [urlObj.href],
        upis: getUniqueMatches(PATTERNS.upi, urlStr),
        domain: hostname
      },
      summary: generateSummary("URL", riskLevel, riskScore, indicators)
    };
  }

  // ==========================================
  // 3. ANDROID APK FORENSICS (Static Inspection)
  // ==========================================
  function analyzeApkMetadata({ appName, packageName, permissions = [], embeddedStrings = [], certFingerprint, iconCloneOf = null }) {
    let riskScore = 0;
    const indicators = [];
    const flaggedPermissions = [];

    // 1. Permission Audit
    let predatoryPermissionCount = 0;
    permissions.forEach(perm => {
      const known = PREDATORY_PERMISSIONS[perm];
      if (known) {
        predatoryPermissionCount++;
        riskScore += known.weight;
        flaggedPermissions.push({ permission: perm, reason: known.reason, weight: known.weight });
      }
    });

    if (flaggedPermissions.length > 0) {
      indicators.push({
        code: "PREDATORY_PERMISSIONS",
        title: `Predatory Permission Abuse (${flaggedPermissions.length} High-Risk Flags)`,
        severity: "HIGH",
        description: `App requests intrusive permissions: ${flaggedPermissions.map(p => p.permission.replace('android.permission.', '')).join(', ')}.`,
        impact: `+${Math.min(60, flaggedPermissions.reduce((acc, p) => acc + p.weight, 0))} Risk`
      });
    }

    // 2. High-Risk Permission Combos (The Classic Loan Extortion Cluster)
    const hasContacts = permissions.includes("android.permission.READ_CONTACTS");
    const hasSms = permissions.includes("android.permission.READ_SMS") || permissions.includes("android.permission.RECEIVE_SMS");
    const hasLocation = permissions.includes("android.permission.ACCESS_FINE_LOCATION");
    const hasCamera = permissions.includes("android.permission.CAMERA");

    if (hasContacts && hasSms && (hasLocation || hasCamera)) {
      riskScore += 35;
      indicators.push({
        code: "LOAN_EXTORTION_CLUSTER",
        title: "Signature Loan-Extortion Permission Cluster",
        severity: "HIGH",
        description: "Requests READ_CONTACTS + READ_SMS + CAMERA/LOCATION. Standard signature of illegal loan shark apps used to harvest contacts and blackmail victims with morphed media.",
        impact: "+35 Risk"
      });
    }

    // 3. Embedded URLs and IPs in Decompiled Strings
    const allStrings = embeddedStrings.join(" ");
    const extractedIps = getUniqueMatches(PATTERNS.ip, allStrings);
    const extractedUrls = getUniqueMatches(PATTERNS.url, allStrings);
    const extractedUpis = getUniqueMatches(PATTERNS.upi, allStrings);
    const extractedPhones = getUniqueMatches(PATTERNS.phone, allStrings);

    if (extractedIps.length > 0) {
      riskScore += 25;
      indicators.push({
        code: "HARDCODED_C2_IPS",
        title: `Hardcoded Server IP Endpoints (${extractedIps.length} found)`,
        severity: "HIGH",
        description: `Found embedded numerical IP communication endpoints: ${extractedIps.slice(0, 3).join(', ')}. Typical of evading DNS-based takedowns.`,
        impact: "+25 Risk"
      });
    }

    // 4. Package Name Impersonation / Typosquatting
    const lowerPkg = (packageName || "").toLowerCase();
    const pkgBank = BANK_BRANDS.find(b => lowerPkg.includes(b));
    if (pkgBank && !lowerPkg.startsWith("com.sbi.") && !lowerPkg.startsWith("com.hdfcbank.") && !lowerPkg.startsWith("net.one97.paytm")) {
      riskScore += 40;
      indicators.push({
        code: "PACKAGE_NAME_SPOOF",
        title: `Package Name Typosquatting (${pkgBank.toUpperCase()})`,
        severity: "HIGH",
        description: `Package identifier '${packageName}' references brand '${pkgBank}' without official developer signature.`,
        impact: "+40 Risk"
      });
    }

    // 5. Visual App Icon Cloned
    if (iconCloneOf) {
      riskScore += 45;
      indicators.push({
        code: "ICON_PHASH_CLONE",
        title: `Visual Icon Impersonation: ${iconCloneOf}`,
        severity: "HIGH",
        description: `App launcher icon perceptual hash matches known banking app '${iconCloneOf}' (Similarity > 94%).`,
        impact: "+45 Risk"
      });
    }

    // Cap Risk
    riskScore = Math.min(100, Math.max(0, riskScore));
    let riskLevel = "LOW";
    if (riskScore >= 65) riskLevel = "HIGH";
    else if (riskScore >= 35) riskLevel = "MEDIUM";

    return {
      type: "APK",
      timestamp: new Date().toISOString(),
      appName: appName || "Unknown APK",
      packageName: packageName || "com.unknown.app",
      certFingerprint: certFingerprint || "SHA256:7B:4A:9C:12:... [Unsigned/Self-Signed]",
      riskScore,
      riskLevel,
      primaryCategory: riskScore >= 60 ? "Predatory Loan / Malicious Spyware APK" : "Standard Android Application",
      indicators,
      flaggedPermissions,
      allPermissions: permissions,
      extractedEntities: {
        ips: extractedIps,
        urls: extractedUrls,
        upis: extractedUpis,
        phones: extractedPhones
      },
      summary: generateSummary("APK", riskLevel, riskScore, indicators)
    };
  }

  // ==========================================
  // 4. WEBSITE / PONZI / BETTING ANALYZER
  // ==========================================
  function analyzeWebsite({ url, pageTitle, contentText }) {
    const text = (pageTitle || "") + "\n" + (contentText || "");
    let riskScore = 0;
    const indicators = [];
    const matchedCategories = [];

    // Extract Financial & Contact Identifiers
    const extractedEntities = {
      upis: getUniqueMatches(PATTERNS.upi, text),
      bankIfsc: getUniqueMatches(PATTERNS.ifsc, text),
      phones: getUniqueMatches(PATTERNS.phone, text),
      cryptoBtc: getUniqueMatches(PATTERNS.cryptoBtc, text),
      cryptoEth: getUniqueMatches(PATTERNS.cryptoEth, text),
      cryptoTron: getUniqueMatches(PATTERNS.cryptoTron, text),
      telegramWa: getUniqueMatches(PATTERNS.telegramWa, text),
      urls: getUniqueMatches(PATTERNS.url, text)
    };

    // 1. Guaranteed Returns / HYIP Ponzi Language
    const ponziRegex = /(?:guaranteed\s*(?:returns?|profit|daily)|100%\s*profit|double\s*your\s*money|daily\s*roi|no\s*risk\s*investment|daily\s*(?:3%|5%|10%|20%)|invest\s*\d+\s*get\s*\d+)/i;
    if (ponziRegex.test(text)) {
      riskScore += 45;
      matchedCategories.push("High-Yield Ponzi Scheme");
      indicators.push({
        code: "PONZI_GUARANTEED_RETURNS",
        title: "Guaranteed Return & Ponzi Deception",
        severity: "HIGH",
        description: "Promises impossible or guaranteed daily ROI ('100% profit', 'double your money'). Violates financial regulation (SEBI/RBI).",
        impact: "+45 Risk"
      });
    }

    // 2. MLM & Multi-Tier Referral Chain
    const mlmRegex = /(?:referral\s*commission|level\s*[1-9]|binary\s*tree|downline\s*bonus|upline|direct\s*referral\s*(?:10%|20%|income)|team\s*reward)/i;
    if (mlmRegex.test(text)) {
      riskScore += 35;
      matchedCategories.push("Multi-Level Pyramid / MLM Chain");
      indicators.push({
        code: "MLM_PYRAMID_CHAIN",
        title: "Multi-Tier Referral Pyramid Scheme",
        severity: "HIGH",
        description: "Incentivizes recruiting new members via multi-tier commission structures ('Level 1 to 5', 'downline bonuses').",
        impact: "+35 Risk"
      });
    }

    // 3. Illegal Betting / Casino / Color Prediction
    const bettingRegex = /(?:color\s*prediction|wingo|aviator|teen\s*patti|roulette|dragon\s*vs\s*tiger|instant\s*withdrawal\s*to\s*upi|recharge\s*wallet|daman\s*games)/i;
    if (bettingRegex.test(text)) {
      riskScore += 50;
      matchedCategories.push("Illegal Online Betting & Casino");
      indicators.push({
        code: "ILLEGAL_BETTING_PLATFORM",
        title: "Illegal Betting / Color Prediction Mechanism",
        severity: "HIGH",
        description: "Hosts unauthorized real-money gaming, color prediction algorithms, and direct UPI wallet recharge mechanisms.",
        impact: "+50 Risk"
      });
    }

    // 4. Actionable Financial Identifiers Presence
    if (extractedEntities.upis.length > 0) {
      riskScore += 15;
      indicators.push({
        code: "UNREGULATED_UPI_COLLECTION",
        title: `Direct UPI Ingestion Endpoints (${extractedEntities.upis.length} found)`,
        severity: "MEDIUM",
        description: `Direct personal or mule UPI handles identified: ${extractedEntities.upis.slice(0, 3).join(', ')}.`,
        impact: "+15 Risk"
      });
    }

    if (extractedEntities.cryptoEth.length > 0 || extractedEntities.cryptoTron.length > 0 || extractedEntities.cryptoBtc.length > 0) {
      riskScore += 25;
      indicators.push({
        code: "UNREGULATED_CRYPTO_COLLECTION",
        title: "Cryptocurrency Ingestion Wallets",
        severity: "HIGH",
        description: "Collects funds via anonymous cryptocurrency rails (USDT Tron TRC-20, ETH, BTC), preventing bank chargebacks.",
        impact: "+25 Risk"
      });
    }

    // 5. URL Domain evaluation if provided
    if (url) {
      const urlReport = analyzeUrl(url);
      if (urlReport.riskScore >= 50) {
        riskScore += 20;
        indicators.push({
          code: "DECEPTIVE_HOSTING_INFRASTRUCTURE",
          title: `Suspicious Hosting & Domain: ${urlReport.hostname}`,
          severity: "HIGH",
          description: urlReport.summary,
          impact: "+20 Risk"
        });
      }
    }

    // Cap Risk Score
    riskScore = Math.min(100, Math.max(0, riskScore));
    let riskLevel = "LOW";
    if (riskScore >= 65) riskLevel = "HIGH";
    else if (riskScore >= 35) riskLevel = "MEDIUM";

    return {
      type: "WEBSITE",
      timestamp: new Date().toISOString(),
      url: url || "Direct HTML / Text Inspection",
      pageTitle: pageTitle || "Web Page Content",
      riskScore,
      riskLevel,
      primaryCategory: matchedCategories[0] || (riskLevel === "HIGH" ? "Fraudulent Web Portal" : "Standard Web Content"),
      categories: matchedCategories,
      indicators,
      extractedEntities,
      summary: generateSummary("Website", riskLevel, riskScore, indicators)
    };
  }

  // --- Helper to Generate Human-Readable Explainable Summary ---
  function generateSummary(targetType, level, score, indicators) {
    if (score < 30) {
      return `${targetType} exhibits normal benign behavior with no dominant fraud signatures detected (Risk Score: ${score}/100).`;
    }
    const topFlags = indicators.slice(0, 3).map(i => i.title).join(", ");
    return `${level} RISK (${score}/100): ${targetType} exhibits high-confidence threat indicators including ${topFlags}. Actionable identifiers extracted for evidentiary filing.`;
  }

  // --- Public API ---
  return {
    analyzeMessage,
    analyzeUrl,
    analyzeApkMetadata,
    analyzeWebsite,
    PATTERNS,
    PREDATORY_PERMISSIONS
  };

})();

if (typeof window !== 'undefined') {
  window.ThreatAnalyzer = ThreatAnalyzer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreatAnalyzer;
}

