import {
  ComplaintCategory,
  ComplaintRecord,
  EscalationPriority,
  HumanReviewStatus,
  RiskFlag,
  RiskType,
  RouteDepartment,
  SeverityLevel,
  TriageResult,
} from '../types/triage';

/**
 * Call server-side Gemini 3.8 Flash triage endpoint
 */
export async function triageWithGemini(
  complaintText: string,
  metadata?: { patientId?: string; source?: string; department?: string }
): Promise<TriageResult> {
  try {
    const res = await fetch('/api/triage/single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaintText,
        patientId: metadata?.patientId,
        source: metadata?.source,
        department: metadata?.department,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.result) {
      const resObj = data.result;
      return {
        primaryCategory: resObj.primaryCategory as ComplaintCategory,
        secondaryCategories: resObj.secondaryCategories || [],
        severityLevel: resObj.severityLevel as SeverityLevel,
        severityLevelNumber: (resObj.severityLevelNumber || 2) as 1 | 2 | 3 | 4,
        severityJustification: resObj.severityJustification,
        riskFlags: resObj.riskFlags || [],
        recommendedDepartment: resObj.recommendedDepartment as RouteDepartment,
        escalationPriority: resObj.escalationPriority as EscalationPriority,
        humanReviewStatus: resObj.humanReviewStatus as HumanReviewStatus,
        humanReviewReason: resObj.humanReviewReason,
        executiveSummary: resObj.executiveSummary,
        keyIncidentPoints: resObj.keyIncidentPoints || [],
        triagedAt: new Date().toISOString(),
        humanAuditStatus: 'Pending',
      };
    }
    throw new Error('Invalid response structure');
  } catch (err: any) {
    console.warn('Gemini triage call failed, falling back to Clinical Rule Engine:', err.message);
    // Use heuristic clinical rule engine fallback
    return heuristicClinicalTriage(complaintText, metadata);
  }
}

/**
 * Batch triage helper with chunking
 */
export async function batchTriageWithGemini(
  complaints: Array<{ id: string; text: string; source?: string; department?: string }>,
  onProgress?: (processed: number, total: number) => void
): Promise<Map<string, TriageResult>> {
  const resultMap = new Map<string, TriageResult>();
  const chunkSize = 5; // process in small batches for real-time progress and token safety

  for (let i = 0; i < complaints.length; i += chunkSize) {
    const chunk = complaints.slice(i, i + chunkSize);

    try {
      const res = await fetch('/api/triage/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaints: chunk }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          for (const item of data.results) {
            resultMap.set(item.id, {
              primaryCategory: item.primaryCategory as ComplaintCategory,
              secondaryCategories: item.secondaryCategories || [],
              severityLevel: item.severityLevel as SeverityLevel,
              severityLevelNumber: (item.severityLevelNumber || 2) as 1 | 2 | 3 | 4,
              severityJustification: item.severityJustification,
              riskFlags: item.riskFlags || [],
              recommendedDepartment: item.recommendedDepartment as RouteDepartment,
              escalationPriority: item.escalationPriority as EscalationPriority,
              humanReviewStatus: item.humanReviewStatus as HumanReviewStatus,
              humanReviewReason: item.humanReviewReason,
              executiveSummary: item.executiveSummary,
              keyIncidentPoints: item.keyIncidentPoints || [],
              triagedAt: new Date().toISOString(),
              humanAuditStatus: 'Pending',
            });
          }
        }
      } else {
        // Fallback for this chunk
        for (const item of chunk) {
          resultMap.set(item.id, heuristicClinicalTriage(item.text, { source: item.source, department: item.department }));
        }
      }
    } catch {
      // Local fallback
      for (const item of chunk) {
        resultMap.set(item.id, heuristicClinicalTriage(item.text, { source: item.source, department: item.department }));
      }
    }

    if (onProgress) {
      onProgress(Math.min(i + chunkSize, complaints.length), complaints.length);
    }
  }

  return resultMap;
}

/**
 * Clinical Heuristic Triage Rule Engine (Complies with the 6 required steps)
 */
export function heuristicClinicalTriage(
  text: string,
  metadata?: { patientId?: string; source?: string; department?: string }
): TriageResult {
  const lower = text.toLowerCase();

  // STEP 1: Categories
  const categories: ComplaintCategory[] = [];
  
  if (lower.match(/\b(medication|drug|dose|overdose|allergic|reaction|harm|bleeding|fall|fell|seizure|coma|code blue|wrong patient|passed away|died|stroke|embolism|septic|sepsis|icu|resuscitation|vital)\b/)) {
    categories.push('Patient Safety');
  }
  if (lower.match(/\b(doctor|physician|surgeon|nurse|care|treatment|diagnosis|misdiagnos|surgery|biopsy|infection|wound|pus|fever|symptoms|stitch|drain)\b/)) {
    categories.push('Clinical Care');
  }
  if (lower.match(/\b(hipaa|privacy|breach|confidential|ssn|social security|leak|other patient|records seen|unauthorized|hacked|password)\b/)) {
    categories.push('Privacy or Security');
  }
  if (lower.match(/\b(discriminat|racis|race|language|translator|interpreter|accent|english|deaf|blind|wheelchair|ramp|ada|accessible|handicap|disability)\b/)) {
    categories.push('Accessibility and Equity');
  }
  if (lower.match(/\b(bill|billing|charge|insurance|overcharg|no surprises act|out of network|copay|deductible|cost|refund|statement|financial)\b/)) {
    categories.push('Billing');
  }
  if (lower.match(/\b(discharge|discharged|follow-up|follow up|instructions|readmit|at home|home health|prescription pick up)\b/)) {
    categories.push('Discharge and Follow-Up');
  }
  if (lower.match(/\b(rude|yelled|attitude|hostile|disrespect|hung up|cursed|ignored|unprofessional|slammed|eye roll)\b/)) {
    categories.push('Staff Conduct');
  }
  if (lower.match(/\b(portal|mychart|app|login|password|system down|website|server|glitch|technical)\b/)) {
    categories.push('Technology / Patient Portal');
  }
  if (lower.match(/\b(wait|waited|waiting|delay|hours|late|held|queue)\b/)) {
    categories.push('Wait Time');
  }
  if (lower.match(/\b(schedul|appointment|cancel|reschedul|booking|slot|calendar)\b/)) {
    categories.push('Scheduling');
  }
  if (lower.match(/\b(call|called|phone|voicemail|callback|message|answer|communication|informed|told)\b/)) {
    categories.push('Communication');
  }

  if (categories.length === 0) {
    categories.push('Other');
  }

  const primaryCategory = categories[0];
  const secondaryCategories = categories.slice(1);

  // STEP 2: Severity Assessment & STEP 3: Risk Detection
  const riskFlags: RiskFlag[] = [];
  let severityLevel: SeverityLevel = 'LEVEL 1 – Low';
  let severityLevelNumber: 1 | 2 | 3 | 4 = 1;
  let severityJustification = 'Minor inconvenience or routine dissatisfaction without clinical deterioration.';

  const isLevel4Trigger =
    lower.match(/\b(immediate|emergency|er|ambulance|life-threatening|overdose|wrong drug|icu|passed away|died|paralyzed|severe harm|hypotension|anaphylaxis|suicide|sexual|assault)\b/) ||
    lower.match(/\b(hipaa|breach|ssn|social security|hiv|confidentiality leak)\b/) ||
    lower.match(/\b(racist|racial|discrimina|civil rights|title vi|refused translator|denied service because)\b/) ||
    lower.match(/\b(lawyer|attorney|sue|legal action|malpractice|litigation)\b/);

  const isLevel3Trigger =
    lower.match(/\b(potential harm|wrong dose|medication error|reaction|asthma|infection|pus|fever|cellulitis|readmit|readmission|broken ramp|wheelchair trap|no surprises act|unlawful bill)\b/) ||
    lower.match(/\b(escalat|urgent|unanswered for days|chest pain|wound open)\b/);

  const isLevel2Trigger =
    lower.match(/\b(repeated|multiple times|called four times|weeks|frustrated|dropped line|terrible service|nobody cares)\b/);

  if (isLevel4Trigger) {
    severityLevel = 'LEVEL 4 – Critical';
    severityLevelNumber = 4;
    severityJustification =
      'Immediate patient safety risk, potential legal exposure, civil rights / discrimination allegation, or severe statutory privacy breach.';
  } else if (isLevel3Trigger) {
    severityLevel = 'LEVEL 3 – High';
    severityLevelNumber = 3;
    severityJustification =
      'Potential clinical harm, medication-related concern, serious accessibility obstruction, or statutory billing escalation.';
  } else if (isLevel2Trigger) {
    severityLevel = 'LEVEL 2 – Moderate';
    severityLevelNumber = 2;
    severityJustification =
      'Repeated service failures, ongoing access obstacles, or noticeable communication breakdown.';
  } else {
    severityLevel = 'LEVEL 1 – Low';
    severityLevelNumber = 1;
    severityJustification =
      'Routine operational dissatisfaction, wait time inconvenience, or general patient suggestion.';
  }

  // Populate Risk Flags
  if (primaryCategory === 'Patient Safety' || lower.match(/\b(harm|safety|fall|drug|medication|overdose|vital|infection)\b/)) {
    riskFlags.push({
      riskType: 'Patient Safety Risk',
      explanation: 'Potential or actual compromise to patient physical well-being or clinical treatment regimen.',
    });
  }
  if (primaryCategory === 'Clinical Care' || lower.match(/\b(doctor|surgery|wound|diagnosis|clinical|physician)\b/)) {
    riskFlags.push({
      riskType: 'Clinical Risk',
      explanation: 'Clinical care pathway deviation, post-procedure complication, or diagnosis delay.',
    });
  }
  if (primaryCategory === 'Privacy or Security' || lower.match(/\b(hipaa|privacy|ssn|breach|confidential|record)\b/)) {
    riskFlags.push({
      riskType: 'Privacy Risk',
      explanation: 'Unauthorized access or disclosure of sensitive Protected Health Information (PHI).',
    });
  }
  if (primaryCategory === 'Accessibility and Equity' || lower.match(/\b(discriminat|translator|interpreter|language|race|equity)\b/)) {
    riskFlags.push({
      riskType: 'Equity Risk',
      explanation: 'Violation of Title VI / Section 1557 non-discrimination or limited English proficiency standards.',
    });
  }
  if (lower.match(/\b(ada|wheelchair|ramp|accessible|disability|blind|deaf)\b/)) {
    riskFlags.push({
      riskType: 'Accessibility Risk',
      explanation: 'Physical or sensory access barrier in violation of Americans with Disabilities Act standards.',
    });
  }
  if (lower.match(/\b(statute|no surprises act|illegal|law|hipaa|attorney|regulation|compliance|joint commission)\b/)) {
    riskFlags.push({
      riskType: 'Compliance Risk',
      explanation: 'Regulatory non-compliance with federal, state, or accrediting healthcare mandates.',
    });
  }
  if (lower.match(/\b(review|online|google|yelp|reputation|news|media|public)\b/) || severityLevelNumber >= 3) {
    riskFlags.push({
      riskType: 'Reputational Risk',
      explanation: 'High exposure to negative public scrutiny, online ratings, or formal external complaints.',
    });
  }
  if (lower.match(/\b(delay|wait|queue|phone|staff|schedule|dropped|hold|glitch)\b/)) {
    riskFlags.push({
      riskType: 'Operational Risk',
      explanation: 'Inefficiency or failure in administrative, telephony, or operational workflows.',
    });
  }

  if (riskFlags.length === 0) {
    riskFlags.push({
      riskType: 'Operational Risk',
      explanation: 'Routine service flow variance.',
    });
  }

  // STEP 4: Escalation Recommendation
  let recommendedDepartment: RouteDepartment = 'Patient Experience Team';
  let escalationPriority: EscalationPriority = 'Routine';

  if (severityLevelNumber === 4) {
    escalationPriority = 'Immediate';
    if (primaryCategory === 'Privacy or Security') {
      recommendedDepartment = 'Compliance Office';
    } else if (primaryCategory === 'Accessibility and Equity') {
      recommendedDepartment = 'Compliance Office';
    } else if (primaryCategory === 'Patient Safety' || lower.match(/\b(malpractice|lawyer|sue|death|overdose)\b/)) {
      recommendedDepartment = 'Risk Management';
    } else {
      recommendedDepartment = 'Executive Review';
    }
  } else if (severityLevelNumber === 3) {
    escalationPriority = 'Priority';
    if (primaryCategory === 'Billing') {
      recommendedDepartment = 'Revenue Cycle / Billing';
    } else if (primaryCategory === 'Accessibility and Equity') {
      recommendedDepartment = 'Accessibility Coordinator';
    } else if (primaryCategory === 'Clinical Care' || primaryCategory === 'Discharge and Follow-Up') {
      recommendedDepartment = 'Physician Leadership';
    } else if (primaryCategory === 'Patient Safety') {
      recommendedDepartment = 'Quality Improvement Team';
    } else {
      recommendedDepartment = 'Nursing Leadership';
    }
  } else if (severityLevelNumber === 2) {
    escalationPriority = 'Priority';
    if (primaryCategory === 'Technology / Patient Portal') {
      recommendedDepartment = 'Information Technology';
    } else if (primaryCategory === 'Billing') {
      recommendedDepartment = 'Revenue Cycle / Billing';
    } else if (primaryCategory === 'Scheduling' || primaryCategory === 'Wait Time') {
      recommendedDepartment = 'Patient Experience Team';
    } else {
      recommendedDepartment = 'Nursing Leadership';
    }
  } else {
    escalationPriority = 'Routine';
    if (primaryCategory === 'Billing') {
      recommendedDepartment = 'Revenue Cycle / Billing';
    } else if (primaryCategory === 'Technology / Patient Portal') {
      recommendedDepartment = 'Information Technology';
    } else {
      recommendedDepartment = 'Patient Experience Team';
    }
  }

  // STEP 5: Human Review Requirement
  // Rule: Human Review Required whenever:
  // - Patient safety concerns exist
  // - Discrimination is alleged
  // - Privacy concerns exist
  // - Legal or compliance risks are present
  // - The complaint is ambiguous and requires investigation
  let humanReviewStatus: HumanReviewStatus = 'AI Review Only';
  let humanReviewReason = 'Routine operational feedback without clinical or regulatory flags.';

  const hasPatientSafety = riskFlags.some((r) => r.riskType === 'Patient Safety Risk') || primaryCategory === 'Patient Safety';
  const hasDiscrimination = riskFlags.some((r) => r.riskType === 'Equity Risk') || lower.match(/\b(discrimina|racis|bias)\b/);
  const hasPrivacy = riskFlags.some((r) => r.riskType === 'Privacy Risk') || primaryCategory === 'Privacy or Security';
  const hasCompliance = riskFlags.some((r) => r.riskType === 'Compliance Risk') || lower.match(/\b(legal|lawyer|sue|statute)\b/);

  if (hasPatientSafety || hasDiscrimination || hasPrivacy || hasCompliance || severityLevelNumber >= 3) {
    humanReviewStatus = 'Human Review Required';
    humanReviewReason = hasPatientSafety
      ? 'Patient safety risks and potential physiological harm require mandatory clinical human triage oversight.'
      : hasDiscrimination
      ? 'Allegation of discrimination or civil rights non-compliance requires formal officer investigation.'
      : hasPrivacy
      ? 'Privacy violation / HIPAA security trigger mandates compliance review.'
      : 'Regulatory exposure or high severity level mandates clinical/operational human audit.';
  } else if (severityLevelNumber === 2 || riskFlags.some((r) => r.riskType === 'Clinical Risk')) {
    humanReviewStatus = 'Human Review Recommended';
    humanReviewReason = 'Moderate service disruption or repeated failure suggests human follow-up.';
  }

  // STEP 6: Executive Summary
  const majorRisk = riskFlags[0]?.riskType || 'Operational Risk';
  const executiveSummary = `${severityLevel} incident classified under ${primaryCategory}. Major identified vulnerability: ${majorRisk}. Recommended routing to ${recommendedDepartment} under ${escalationPriority} priority with ${humanReviewStatus}.`;

  const keyIncidentPoints = [
    `Primary concern: ${primaryCategory}${secondaryCategories.length > 0 ? ` (Secondary: ${secondaryCategories.join(', ')})` : ''}`,
    `Severity: ${severityLevel} due to observed clinical/operational impact`,
    `Action: Routed to ${recommendedDepartment} (${escalationPriority} queue)`,
  ];

  return {
    primaryCategory,
    secondaryCategories,
    severityLevel,
    severityLevelNumber,
    severityJustification,
    riskFlags,
    recommendedDepartment,
    escalationPriority,
    humanReviewStatus,
    humanReviewReason,
    executiveSummary,
    keyIncidentPoints,
    triagedAt: new Date().toISOString(),
    humanAuditStatus: 'Pending',
  };
}

/**
 * Generate formatted text output matching exact required format
 */
export function formatTriageTextOutput(triage: TriageResult): string {
  const secondary = triage.secondaryCategories && triage.secondaryCategories.length > 0
    ? triage.secondaryCategories.join(', ')
    : 'None';

  const riskLines = triage.riskFlags
    .map((r) => `  * ${r.riskType}: ${r.explanation}`)
    .join('\n');

  return `Complaint Category: ${triage.primaryCategory}
Secondary Categories: ${secondary}
Severity Level: ${triage.severityLevel}
Severity Justification: ${triage.severityJustification}
Risk Flags:
${riskLines}
Recommended Department: ${triage.recommendedDepartment}
Escalation Priority: ${triage.escalationPriority}
Human Review Status: ${triage.humanReviewStatus}
Executive Summary: ${triage.executiveSummary}`;
}
