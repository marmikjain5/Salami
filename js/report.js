/**
 * ThreatReport - Generates Police & Law-Enforcement Ready Cybercrime Evidentiary Reports
 * Formatted for investigation records, FIR attachments, and legal chain of custody.
 */

const ThreatReport = (function () {

  // Generate SHA-256 checksum using Web Crypto API
  async function computeSha256(text) {
    if (!window.crypto || !window.crypto.subtle) {
      return "SHA256:FALLBACK_" + Math.random().toString(36).substring(2, 15);
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Map threat types to standard Indian IT Act / BNS (IPC) sections
  function getLegalSections(category, riskScore) {
    if (riskScore < 35) return ["None (Non-Cognizable / Benign Activity)"];
    
    const sections = [
      "IT Act Sec 66D: Cheating by personation using computer resource",
      "BNS Sec 318(4) (formerly IPC Sec 420): Cheating and dishonestly inducing delivery of property"
    ];

    const catUpper = (category || "").toUpperCase();
    if (catUpper.includes("LOAN") || catUpper.includes("EXTORTION")) {
      sections.push("IT Act Sec 66E: Violation of privacy (unauthorized contact harvesting)");
      sections.push("BNS Sec 351(2) (formerly IPC Sec 506): Criminal intimidation and harassment");
    }
    if (catUpper.includes("BETTING") || catUpper.includes("PONZI")) {
      sections.push("Public Gambling Act / State Online Gaming Prohibition Act");
      sections.push("Banning of Unregulated Deposit Schemes Act, 2019 (BUDS Act)");
    }
    if (catUpper.includes("DIGITAL ARREST") || catUpper.includes("LEGAL")) {
      sections.push("BNS Sec 204 (formerly IPC Sec 170): Personating a public servant");
      sections.push("BNS Sec 308(2) (formerly IPC Sec 384): Extortion");
    }

    return sections;
  }

  // Build the complete investigation report object
  async function buildReportDossier(caseData) {
    const rawArtifact = caseData.rawInput || "";
    const evidenceHash = await computeSha256(rawArtifact);
    const linkedCases = ThreatDatabase.findLinkedCases(caseData);
    const legalSections = getLegalSections(caseData.primaryCategory, caseData.riskScore);

    return {
      metadata: {
        reportId: `CYBER-IR-${Date.now().toString(36).toUpperCase()}`,
        caseId: caseData.caseId || `CASE-${Date.now().toString().slice(-6)}`,
        generatedAt: new Date().toISOString(),
        evidenceHashSha256: evidenceHash,
        classification: "CONFIDENTIAL / LAW ENFORCEMENT SENSITIVE",
        reportingAuthority: "National Cyber Fraud Triage & Intelligence Platform"
      },
      caseOverview: {
        targetType: caseData.type,
        riskLevel: caseData.riskLevel,
        riskScore: `${caseData.riskScore}/100`,
        primaryCategory: caseData.primaryCategory,
        timestamp: caseData.timestamp,
        reportedBy: caseData.reportedBy || "Citizen Triage Portal"
      },
      triggerIndicators: caseData.indicators || [],
      extractedIdentifiers: caseData.extractedEntities || {},
      linkedCasesSummary: linkedCases.map(link => ({
        linkedCaseId: link.linkedCase.caseId,
        linkedType: link.linkedCase.type,
        title: link.linkedCase.title,
        matchedTokens: link.matchedTokens,
        confidence: link.linkConfidence
      })),
      legalProvisions: legalSections,
      rawEvidence: rawArtifact,
      officerRecommendations: generateRecommendations(caseData, linkedCases)
    };
  }

  function generateRecommendations(caseData, linkedCases) {
    const recommendations = [];
    const entities = caseData.extractedEntities || {};

    if (caseData.riskLevel === "HIGH") {
      if ((entities.phones || []).length > 0) {
        recommendations.push(`Issue emergency blocking request to DoT / TAFCOP for suspected mule phone number(s): ${entities.phones.join(', ')}.`);
      }
      if ((entities.upis || []).length > 0) {
        recommendations.push(`File freeze advisory with NPCI / nodal bank to freeze associated beneficiary UPI accounts: ${entities.upis.join(', ')}.`);
      }
      if ((entities.urls || []).length > 0 || entities.domain) {
        const domains = entities.domain ? [entities.domain] : entities.urls;
        recommendations.push(`Request immediate emergency DNS takedown and registrar blacklisting via NCIIPC/CERT-In for domain(s): ${domains.join(', ')}.`);
      }
      if (linkedCases.length > 0) {
        recommendations.push(`HIGH SYNDICATE THREAT: This threat shares identifiers with ${linkedCases.length} other registered cases. Merge evidence into consolidated syndicate investigation.`);
      }
    } else {
      recommendations.push("Maintain passive logging. No active blocking warranted at current confidence threshold.");
    }

    return recommendations;
  }

  // Format report as clean printable HTML
  function renderPrintableHtml(dossier) {
    const meta = dossier.metadata;
    const ov = dossier.caseOverview;
    const ents = dossier.extractedIdentifiers;

    return `
      <div class="report-document">
        <div class="report-header">
          <div class="report-badge">LAW ENFORCEMENT EVIDENCE REPORT</div>
          <h2>CYBER FRAUD & PHISHING FORENSIC DOSSIER</h2>
          <p class="subtitle">Unified Threat Intelligence & Actionable Identifiers Report</p>
          <div class="report-meta-grid">
            <div><strong>Report ID:</strong> ${meta.reportId}</div>
            <div><strong>Case ID:</strong> ${meta.caseId}</div>
            <div><strong>Timestamp:</strong> ${new Date(ov.timestamp).toLocaleString('en-IN')}</div>
            <div><strong>Integrity Checksum (SHA-256):</strong> <code>${meta.evidenceHashSha256}</code></div>
          </div>
        </div>

        <hr/>

        <div class="report-section">
          <h3>1. Executive Threat Classification</h3>
          <table class="report-table">
            <tr>
              <th width="30%">Target Type</th>
              <td><strong>${ov.targetType}</strong></td>
            </tr>
            <tr>
              <th>Risk Assessment</th>
              <td>
                <span class="badge badge-${ov.riskLevel.toLowerCase()}">${ov.riskLevel} RISK (${ov.riskScore})</span>
              </td>
            </tr>
            <tr>
              <th>Primary Scam Category</th>
              <td><strong>${ov.primaryCategory}</strong></td>
            </tr>
          </table>
        </div>

        <div class="report-section">
          <h3>2. Specific Forensic Indicators (Explainable AI Engine)</h3>
          <ul class="indicators-list">
            ${dossier.triggerIndicators.map(i => `
              <li>
                <strong>${i.title}</strong> [Severity: ${i.severity || 'HIGH'}]
                <p>${i.description}</p>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="report-section">
          <h3>3. Actionable Extracted Identifiers (Mules & Infrastructure)</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Identifier Type</th>
                <th>Extracted Value(s)</th>
                <th>Investigation Priority</th>
              </tr>
            </thead>
            <tbody>
              ${(ents.phones && ents.phones.length) ? `
                <tr>
                  <td><strong>Phone / WhatsApp</strong></td>
                  <td>${ents.phones.join('<br>')}</td>
                  <td><span class="tag-urgent">HIGH (TAFCOP / Telecom Freeze)</span></td>
                </tr>
              ` : ''}
              ${(ents.upis && ents.upis.length) ? `
                <tr>
                  <td><strong>UPI IDs (Payment)</strong></td>
                  <td>${ents.upis.join('<br>')}</td>
                  <td><span class="tag-urgent">CRITICAL (NPCI / Account Freeze)</span></td>
                </tr>
              ` : ''}
              ${(ents.urls && ents.urls.length) ? `
                <tr>
                  <td><strong>Phishing / Malicious URLs</strong></td>
                  <td>${ents.urls.join('<br>')}</td>
                  <td><span class="tag-urgent">HIGH (CERT-In DNS Takedown)</span></td>
                </tr>
              ` : ''}
              ${(ents.ips && ents.ips.length) ? `
                <tr>
                  <td><strong>C2 Server IPs</strong></td>
                  <td>${ents.ips.join('<br>')}</td>
                  <td><span class="tag-urgent">CRITICAL (Hosting Subpoena)</span></td>
                </tr>
              ` : ''}
              ${(ents.cryptoTron && ents.cryptoTron.length) ? `
                <tr>
                  <td><strong>USDT Tron (TRC-20) Wallets</strong></td>
                  <td>${ents.cryptoTron.join('<br>')}</td>
                  <td><span class="tag-urgent">CRITICAL (Exchange Taint Analysis)</span></td>
                </tr>
              ` : ''}
              ${(!ents.phones?.length && !ents.upis?.length && !ents.urls?.length && !ents.ips?.length) ? `
                <tr><td colspan="3">No external financial or contact identifiers detected.</td></tr>
              ` : ''}
            </tbody>
          </table>
        </div>

        ${dossier.linkedCasesSummary.length > 0 ? `
          <div class="report-section">
            <h3>4. Cross-Case Linkage & Syndicate Correlation</h3>
            <div class="alert-box alert-warning">
              <strong>LINKED SYNDICATE IDENTIFIED:</strong> This threat shares identical phone, UPI, or hosting identifiers with ${dossier.linkedCasesSummary.length} previously recorded cases.
            </div>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Linked Case</th>
                  <th>Type</th>
                  <th>Shared Identifiers</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                ${dossier.linkedCasesSummary.map(link => `
                  <tr>
                    <td><strong>${link.linkedCaseId}</strong> (${link.title})</td>
                    <td>${link.linkedType}</td>
                    <td>${link.matchedTokens.map(m => `<code>${m.type}: ${m.value}</code>`).join('<br>')}</td>
                    <td><span class="badge badge-high">${link.confidence}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="report-section">
          <h3>5. Applicable Statutory Provisions</h3>
          <ul class="legal-list">
            ${dossier.legalProvisions.map(lp => `<li>${lp}</li>`).join('')}
          </ul>
        </div>

        <div class="report-section">
          <h3>6. Recommended Law Enforcement Next Steps</h3>
          <ol class="action-list">
            ${dossier.officerRecommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ol>
        </div>

        <div class="report-section">
          <h3>7. Original Raw Evidence Artifact</h3>
          <pre class="raw-evidence-box">${escapeHtml(dossier.rawEvidence)}</pre>
        </div>

        <div class="report-footer">
          <p>This document was automatically compiled by anvesh Automated Forensic Triage Engine for Law Enforcement & Citizen Defense.</p>
          <p>Cryptographic Evidence Verification: Verified Authentic | SHA-256: ${meta.evidenceHashSha256}</p>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Build a compact, self-contained PDF without an external library.
  function downloadReportAsPdf(dossier) {
    const meta = dossier.metadata;
    const ov = dossier.caseOverview;
    const ents = dossier.extractedIdentifiers || {};
    const lines = [
      "ANVESH | DIGITAL FRAUD FORENSIC REPORT",
      "",
      `Report ID: ${meta.reportId}`,
      `Case ID: ${meta.caseId}`,
      `Generated: ${meta.generatedAt}`,
      `Classification: ${meta.classification}`,
      `Evidence SHA-256: ${meta.evidenceHashSha256}`,
      "",
      "1. THREAT CLASSIFICATION",
      `Target type: ${ov.targetType || "Unknown"}`,
      `Risk: ${ov.riskLevel || "Unknown"} (${ov.riskScore || "N/A"})`,
      `Category: ${ov.primaryCategory || "Unknown"}`,
      `Reported via: ${ov.reportedBy || "Unknown"}`,
      "",
      "2. TRIGGERED RISK INDICATORS"
    ];

    (dossier.triggerIndicators || []).forEach((ind, i) => {
      lines.push(`${i + 1}. ${ind.title || "Finding"} [${ind.severity || "INFO"}]`);
      if (ind.description) lines.push(`   ${ind.description}`);
    });

    lines.push("", "3. EXTRACTED IDENTIFIERS");
    const entityLabels = { phones: "Phone numbers", upis: "UPI accounts", urls: "URLs", ips: "Server IPs", cryptoTron: "USDT TRC20" };
    Object.keys(entityLabels).forEach(key => {
      if (Array.isArray(ents[key]) && ents[key].length) lines.push(`${entityLabels[key]}: ${ents[key].join(", ")}`);
    });

    if (dossier.linkedCasesSummary && dossier.linkedCasesSummary.length) {
      lines.push("", "4. LINKED CASES");
      dossier.linkedCasesSummary.forEach(link => lines.push(`${link.linkedCaseId}: ${link.title} (${link.confidence})`));
    }

    lines.push("", "5. LEGAL PROVISIONS");
    (dossier.legalProvisions || []).forEach(item => lines.push(`- ${item}`));
    lines.push("", "6. INVESTIGATIVE RECOMMENDATIONS");
    (dossier.officerRecommendations || []).forEach((item, i) => lines.push(`${i + 1}. ${item}`));
    lines.push("", "7. RAW EVIDENCE", dossier.rawEvidence || "", "", "END OF REPORT");

    const pdfBlob = createPdfBlob(lines);
    const url = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${meta.caseId}_Forensic_Evidence_Report.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function createPdfBlob(sourceLines) {
    const safe = value => String(value)
      .replace(/₹/g, "INR ")
      .replace(/[^\x20-\x7E]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    const wrapped = [];
    sourceLines.forEach(value => {
      const line = safe(value);
      if (!line) { wrapped.push(""); return; }
      for (let i = 0; i < line.length; i += 94) wrapped.push(line.slice(i, i + 94));
    });
    const pages = [];
    for (let i = 0; i < wrapped.length; i += 50) pages.push(wrapped.slice(i, i + 50));
    if (!pages.length) pages.push([""]);

    const objects = [];
    const addObject = body => { objects.push(body); return objects.length; };
    const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const pageIds = [];
    const contentIds = [];
    pages.forEach(page => {
      let stream = "BT\n/F1 10 Tf\n48 794 Td\n";
      page.forEach((line, index) => {
        if (index) stream += "0 -14 Td\n";
        stream += `(${line}) Tj\n`;
      });
      stream += "ET";
      contentIds.push(addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`));
      pageIds.push(addObject(""));
    });
    const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
    pageIds.forEach((id, index) => {
      objects[id - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`;
    });
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets = [0];
    objects.forEach((body, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  }

  // Trigger browser download of report as text/markdown
  function downloadReportAsText(dossier) {
    const meta = dossier.metadata;
    const ov = dossier.caseOverview;
    const ents = dossier.extractedIdentifiers;

    let text = `================================================================================\n`;
    text += `         CYBERCRIME FORENSIC INVESTIGATION REPORT (EVIDENTIARY DOSSIER)\n`;
    text += `================================================================================\n`;
    text += `Report ID:      ${meta.reportId}\n`;
    text += `Case ID:        ${meta.caseId}\n`;
    text += `Date/Time:      ${meta.generatedAt}\n`;
    text += `Evidence Hash:  ${meta.evidenceHashSha256} (SHA-256)\n`;
    text += `Classification: ${meta.classification}\n\n`;

    text += `--------------------------------------------------------------------------------\n`;
    text += `1. THREAT CLASSIFICATION\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `Target Type:      ${ov.targetType}\n`;
    text += `Assessed Risk:    ${ov.riskLevel} (${ov.riskScore})\n`;
    text += `Scam Category:    ${ov.primaryCategory}\n`;
    text += `Reported Via:     ${ov.reportedBy}\n\n`;

    text += `--------------------------------------------------------------------------------\n`;
    text += `2. TRIGGERED RISK INDICATORS (EXPLAINABLE AI ENGINE)\n`;
    text += `--------------------------------------------------------------------------------\n`;
    dossier.triggerIndicators.forEach((ind, i) => {
      text += `[${i + 1}] ${ind.title} (${ind.severity})\n`;
      text += `    ${ind.description}\n`;
    });
    text += `\n`;

    text += `--------------------------------------------------------------------------------\n`;
    text += `3. ACTIONABLE EXTRACTED IDENTIFIERS\n`;
    text += `--------------------------------------------------------------------------------\n`;
    if (ents.phones && ents.phones.length) text += `Phone Numbers: ${ents.phones.join(', ')}\n`;
    if (ents.upis && ents.upis.length) text += `UPI Accounts:  ${ents.upis.join(', ')}\n`;
    if (ents.urls && ents.urls.length) text += `URLs / Links:  ${ents.urls.join(', ')}\n`;
    if (ents.ips && ents.ips.length) text += `Server IPs:    ${ents.ips.join(', ')}\n`;
    if (ents.cryptoTron && ents.cryptoTron.length) text += `USDT TRC20:    ${ents.cryptoTron.join(', ')}\n`;
    text += `\n`;

    if (dossier.linkedCasesSummary.length > 0) {
      text += `--------------------------------------------------------------------------------\n`;
      text += `4. CROSS-CASE SYNDICATE LINKAGE (${dossier.linkedCasesSummary.length} Linked Cases)\n`;
      text += `--------------------------------------------------------------------------------\n`;
      dossier.linkedCasesSummary.forEach(link => {
        text += `• Linked to ${link.linkedCaseId} (${link.title})\n`;
        text += `  Confidence: ${link.confidence} | Shared: ${link.matchedTokens.map(m => `${m.type}:${m.value}`).join(', ')}\n`;
      });
      text += `\n`;
    }

    text += `--------------------------------------------------------------------------------\n`;
    text += `5. STATUTORY LEGAL PROVISIONS\n`;
    text += `--------------------------------------------------------------------------------\n`;
    dossier.legalProvisions.forEach(lp => { text += `• ${lp}\n`; });
    text += `\n`;

    text += `--------------------------------------------------------------------------------\n`;
    text += `6. INVESTIGATIVE RECOMMENDATIONS\n`;
    text += `--------------------------------------------------------------------------------\n`;
    dossier.officerRecommendations.forEach((r, i) => { text += `[${i + 1}] ${r}\n`; });
    text += `\n`;

    text += `--------------------------------------------------------------------------------\n`;
    text += `7. RAW EVIDENCE SNAPSHOT\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `${dossier.rawEvidence}\n\n`;
    text += `================================================================================\n`;
    text += `END OF REPORT | CRYPTOGRAPHIC EVIDENCE INTEGRITY VERIFIED\n`;
    text += `================================================================================\n`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.caseId}_Forensic_Evidence_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    computeSha256,
    buildReportDossier,
    renderPrintableHtml,
    downloadReportAsPdf,
    downloadReportAsText
  };

})();

if (typeof window !== 'undefined') {
  window.ThreatReport = ThreatReport;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreatReport;
}

