import { ComplaintRecord } from '../types/triage';

export const SAMPLE_COMPLAINTS: ComplaintRecord[] = [
  {
    id: 'GRIEV-2026-081',
    patientId: 'PT-99412',
    patientName: 'Eleanor Vance',
    source: 'Patient Portal Message',
    dateReceived: '2026-10-21',
    department: 'Cardiology Clinic',
    location: 'West Wing - Level 3',
    complaintText:
      'I was discharged yesterday after stent placement. When I picked up my prescriptions at the outpatient pharmacy, the doctor had accidentally prescribed Metoprolol 200mg instead of the 25mg we agreed on, and it interacted dangerously with my asthma inhaler. I started wheezing severely last night and my blood pressure plunged to 82/45. I called the on-call nurse three times between 1 AM and 4 AM and never received a callback. I had to take an ambulance back to the ER this morning.',
    triaged: true,
    triage: {
      primaryCategory: 'Patient Safety',
      secondaryCategories: ['Clinical Care', 'Discharge and Follow-Up', 'Communication'],
      severityLevel: 'LEVEL 4 – Critical',
      severityLevelNumber: 4,
      severityJustification:
        'Immediate patient safety incident involving a tenfold medication dosage error causing acute hypotension (BP 82/45), severe bronchospasm, and an avoidable emergency readmission due to lack of after-hours clinical triage response.',
      riskFlags: [
        {
          riskType: 'Patient Safety Risk',
          explanation: 'Severe adverse drug event and medication overdose causing acute physiologic decompensation.',
        },
        {
          riskType: 'Clinical Risk',
          explanation: 'Prescribing error unaddressed during discharge reconciliation and failure of on-call response system.',
        },
        {
          riskType: 'Compliance Risk',
          explanation: 'Mandatory sentinel event / serious reportable event review under Joint Commission & state health regulations.',
        },
        {
          riskType: 'Reputational Risk',
          explanation: 'High likelihood of external patient advocate or regulatory complaint following ambulance readmission.',
        },
      ],
      recommendedDepartment: 'Risk Management',
      escalationPriority: 'Immediate',
      humanReviewStatus: 'Human Review Required',
      humanReviewReason:
        'Patient safety event involving direct physiological harm, medication error, and emergency readmission.',
      executiveSummary:
        'Critical patient safety event triggered by a 200mg vs 25mg Metoprolol prescribing error and unanswered after-hours calls, resulting in acute hypotension and emergency readmission. Urgent Risk Management and Physician Leadership review mandated immediately.',
      keyIncidentPoints: [
        'Post-stent discharge medication reconciliation discrepancy (Metoprolol 200mg vs 25mg).',
        'Severe acute hypotension (82/45) and asthma exacerbation.',
        'Three unanswered on-call nurse contacts overnight.',
        'Required emergency 911 ambulance transport back to hospital.',
      ],
      triagedAt: '2026-10-21T08:15:00Z',
      humanAuditStatus: 'Pending',
    },
  },
  {
    id: 'GRIEV-2026-082',
    patientId: 'PT-44289',
    patientName: 'Marcus Chen',
    source: 'Grievance Report',
    dateReceived: '2026-10-20',
    department: 'Radiology & Imaging',
    location: 'Main Pavilion',
    complaintText:
      'During my MRI appointment, the technician was visibly frustrated because my elderly mother speaks Mandarin and needed a medical interpreter. Instead of requesting the video translation iPad that hospital policy guarantees, the technician rolled his eyes and said loudly in front of other waiting patients: "If people come to this hospital they need to speak English or bring their own translator." He then rushed her onto the scanner without proper safety screening questions. My mother was terrified and crying the entire scan.',
    triaged: true,
    triage: {
      primaryCategory: 'Accessibility and Equity',
      secondaryCategories: ['Staff Conduct', 'Communication', 'Patient Safety'],
      severityLevel: 'LEVEL 4 – Critical',
      severityLevelNumber: 4,
      severityJustification:
        'Explicit civil rights and Title VI language discrimination allegation coupled with violation of Title III ADA/Section 1557 requirements, accompanied by bypassing required MRI pre-scan safety screening.',
      riskFlags: [
        {
          riskType: 'Equity Risk',
          explanation: 'Severe violation of Limited English Proficiency (LEP) federal nondiscrimination standards and refusal of mandated interpretation.',
        },
        {
          riskType: 'Compliance Risk',
          explanation: 'Direct violation of HHS Section 1557 and Joint Commission rights standards regarding certified medical interpreters.',
        },
        {
          riskType: 'Patient Safety Risk',
          explanation: 'Technician rushed patient into magnetic resonance scanner without translating crucial safety screening checklist for metal implants.',
        },
        {
          riskType: 'Reputational Risk',
          explanation: 'Public humiliation of elderly patient in waiting room witnessed by other visitors.',
        },
      ],
      recommendedDepartment: 'Compliance Office',
      escalationPriority: 'Immediate',
      humanReviewStatus: 'Human Review Required',
      humanReviewReason:
        'Discrimination allegation involving federal language access rights (Section 1557) and MRI safety checklist omission.',
      executiveSummary:
        'Critical civil rights and compliance violation involving refusal of mandated medical interpretation and verbal hostility toward an LEP patient, accompanied by a skipped MRI safety screening. Immediate investigation by Compliance Office and Accessibility Coordinator required.',
      keyIncidentPoints: [
        'Refusal to provide required video interpretation equipment.',
        'Discriminatory verbal remarks regarding non-English speaking patients.',
        'Failure to administer pre-MRI implant screening in primary language.',
        'Severe emotional distress inflicted on vulnerable patient.',
      ],
      triagedAt: '2026-10-20T14:40:00Z',
      humanAuditStatus: 'Approved',
      reviewedBy: 'Dr. Sarah Lin (Chief Quality Officer)',
      humanAuditorNotes: 'Escalated to VP of Patient Relations & Lead Radiologist. Staff member placed on administrative duty pending review.',
    },
  },
  {
    id: 'GRIEV-2026-083',
    patientId: 'PT-10852',
    patientName: 'Devon Miller',
    source: 'Billing Inquiry / Grievance',
    dateReceived: '2026-10-19',
    department: 'Emergency Medicine',
    location: 'North Tower ED',
    complaintText:
      'I was billed $3,450 for an out-of-network trauma surgeon consultation during my emergency room visit on Sept 14th, even though your hospital is fully in-network with Blue Cross Blue Shield. I never consented to an out-of-network provider and under the federal No Surprises Act, emergency services cannot balance-bill patients like this. Your billing customer service representative hung up on me when I cited the statute.',
    triaged: true,
    triage: {
      primaryCategory: 'Billing',
      secondaryCategories: ['Staff Conduct', 'Communication'],
      severityLevel: 'LEVEL 3 – High',
      severityLevelNumber: 3,
      severityJustification:
        'Potential federal statutory non-compliance under the No Surprises Act involving disputed balance billing of $3,450 for emergency trauma care, worsened by staff disconnect.',
      riskFlags: [
        {
          riskType: 'Compliance Risk',
          explanation: 'Potential violation of federal No Surprises Act (NSA) emergency balance billing prohibitions.',
        },
        {
          riskType: 'Reputational Risk',
          explanation: 'Patient citing statutory enforcement; high probability of state insurance commissioner complaint.',
        },
        {
          riskType: 'Operational Risk',
          explanation: 'Customer support staff unequipped or mishandling statutory dispute calls by disconnecting.',
        },
      ],
      recommendedDepartment: 'Revenue Cycle / Billing',
      escalationPriority: 'Priority',
      humanReviewStatus: 'Human Review Required',
      humanReviewReason:
        'Legal and compliance exposure regarding federal No Surprises Act balance billing rules.',
      executiveSummary:
        'High-severity billing grievance alleging unlawful emergency balance billing ($3,450) in breach of the federal No Surprises Act. Route to Revenue Cycle Leadership and Compliance for immediate account hold and recalculation.',
      keyIncidentPoints: [
        '$3,450 out-of-network balance bill for emergency ED consultation.',
        'Direct claim under Federal No Surprises Act protections.',
        'Patient disconnected by billing call center staff.',
      ],
      triagedAt: '2026-10-19T11:20:00Z',
      humanAuditStatus: 'Pending',
    },
  },
  {
    id: 'GRIEV-2026-084',
    patientId: 'PT-67104',
    patientName: 'Sarah Jenkins',
    source: 'Patient Portal Message',
    dateReceived: '2026-10-18',
    department: 'Health Informatics',
    location: 'Virtual Care',
    complaintText:
      'When I logged into my MyChart patient portal this morning to look at my biopsy results, I saw the complete medical record, full name, social security number, pathology notes, and HIV test results of another patient named Robert K.! This is an appalling breach of HIPAA privacy. Did someone else receive my confidential biopsy results too?',
    triaged: true,
    triage: {
      primaryCategory: 'Privacy or Security',
      secondaryCategories: ['Technology / Patient Portal'],
      severityLevel: 'LEVEL 4 – Critical',
      severityLevelNumber: 4,
      severityJustification:
        'Confirmed unauthorized disclosure of Protected Health Information (PHI) including sensitive diagnostic status (HIV) and SSN, triggering mandatory HIPAA Breach Notification Rule assessment.',
      riskFlags: [
        {
          riskType: 'Privacy Risk',
          explanation: 'Direct exposure of high-sensitivity PHI (SSN, name, pathology, HIV diagnosis) to an unauthorized third party.',
        },
        {
          riskType: 'Compliance Risk',
          explanation: 'HHS Office for Civil Rights (OCR) HIPAA privacy rule violation requiring forensic IT audit and potential notification within 60 days.',
        },
        {
          riskType: 'Reputational Risk',
          explanation: 'Major patient trust erosion and legal liability regarding confidential infectious disease records.',
        },
        {
          riskType: 'Operational Risk',
          explanation: 'Possible database indexing misconfiguration in patient portal identity mapping.',
        },
      ],
      recommendedDepartment: 'Compliance Office',
      escalationPriority: 'Immediate',
      humanReviewStatus: 'Human Review Required',
      humanReviewReason:
        'Serious privacy breach of Protected Health Information requiring immediate security containment and compliance notification protocol.',
      executiveSummary:
        'Critical privacy and HIPAA breach where a patient was exposed another individual’s SSN and confidential HIV pathology results via MyChart. Immediate lockout, IT security root-cause analysis, and Compliance Privacy Officer escalation required.',
      keyIncidentPoints: [
        'Unauthorized disclosure of external patient record containing SSN and HIV results.',
        'Patient portal mapping misconfiguration or record merge glitch.',
        'Patient expresses fear that their own biopsy was leaked to other users.',
      ],
      triagedAt: '2026-10-18T09:05:00Z',
      humanAuditStatus: 'Approved',
      reviewedBy: 'Chief Information Security Officer',
    },
  },
  {
    id: 'GRIEV-2026-085',
    patientId: 'PT-31998',
    patientName: 'Arthur Pendelton',
    source: 'Survey Comment',
    dateReceived: '2026-10-17',
    department: 'Orthopedic Surgery Clinic',
    location: 'East Wing Suite 200',
    complaintText:
      'I arrived on time for my 10:15 AM post-operative checkup. I was placed in exam room 4 and waited for 1 hour and 45 minutes before anyone came in. The physician was friendly once he arrived, but nobody gave me an update or offered water while I waited with a heavy cast. A simple update from the desk would have made a huge difference.',
    triaged: true,
    triage: {
      primaryCategory: 'Wait Time',
      secondaryCategories: ['Communication', 'Scheduling'],
      severityLevel: 'LEVEL 1 – Low',
      severityLevelNumber: 1,
      severityJustification:
        'Routine clinic delay and inconvenience without clinical deterioration, safety compromise, or regulatory violation.',
      riskFlags: [
        {
          riskType: 'Operational Risk',
          explanation: 'Clinic schedule slippage and lack of proactive rounding communication by medical assistants.',
        },
      ],
      recommendedDepartment: 'Patient Experience Team',
      escalationPriority: 'Routine',
      humanReviewStatus: 'AI Review Only',
      humanReviewReason:
        'Standard operational delay with no clinical risks, threats, or regulatory breaches.',
      executiveSummary:
        'Level 1 wait time concern regarding an uncommunicated 1 hour 45 minute post-op room wait. Route to Patient Experience for standard clinic workflow coaching and service recovery follow-up.',
      keyIncidentPoints: [
        'Waited 105 minutes in exam room without status update.',
        'Clinical interaction was positive once provider arrived.',
        'Patient requested better status communication during delays.',
      ],
      triagedAt: '2026-10-17T15:30:00Z',
      humanAuditStatus: 'Approved',
    },
  },
  {
    id: 'GRIEV-2026-086',
    patientId: 'PT-88310',
    patientName: 'Rosa Martinez',
    source: 'Online Review',
    dateReceived: '2026-10-16',
    department: 'Pediatrics Call Center',
    location: 'Downtown Ambulatory Hub',
    complaintText:
      'I have called four separate times over the last two weeks trying to reschedule my 3-year-old daughter’s 24-month developmental vaccination appointment. Every time, I am on hold for 35+ minutes and then the phone line drops automatically. Now her booster vaccines are two months overdue and daycare is threatening to disenroll her next Monday because the clinic won’t send the immunization certificate.',
    triaged: true,
    triage: {
      primaryCategory: 'Scheduling',
      secondaryCategories: ['Technology / Patient Portal', 'Clinical Care'],
      severityLevel: 'LEVEL 2 – Moderate',
      severityLevelNumber: 2,
      severityJustification:
        'Repeated service failure across two weeks resulting in phone disconnects, causing a clinical delay in childhood immunizations and immediate daycare disenrollment.',
      riskFlags: [
        {
          riskType: 'Operational Risk',
          explanation: 'Telephony queue drops at 35-minute mark indicating IVR capacity or routing failure.',
        },
        {
          riskType: 'Clinical Risk',
          explanation: 'Delay in pediatric immunizations impacting community wellness and preventive schedule.',
        },
        {
          riskType: 'Reputational Risk',
          explanation: 'Public 1-star online review describing systemic inability to reach pediatric clinic.',
        },
      ],
      recommendedDepartment: 'Nursing Leadership',
      escalationPriority: 'Priority',
      humanReviewStatus: 'Human Review Recommended',
      humanReviewReason:
        'Repeated access barrier directly delaying pediatric preventive care and threatening child daycare enrollment.',
      executiveSummary:
        'Moderate severity scheduling and telephony breakdown causing two-month delay in pediatric vaccinations. Route to Pediatric Nursing Leadership and IT for same-day appointment booking and phone trunk inspection.',
      keyIncidentPoints: [
        'Four dropped calls after 35-minute holds across 2 weeks.',
        'Childhood immunization booster two months overdue.',
        'Impending daycare suspension deadline.',
      ],
      triagedAt: '2026-10-16T12:00:00Z',
      humanAuditStatus: 'Pending',
    },
  },
  {
    id: 'GRIEV-2026-087',
    patientId: 'PT-55731',
    patientName: 'Gregory Scott',
    source: 'Patient Portal Message',
    dateReceived: '2026-10-15',
    department: 'General Surgery / Inpatient',
    location: 'Floor 6 Surgical Ward',
    complaintText:
      'I was discharged after laparoscopic hernia repair on Tuesday. The resident gave me a one-page sheet with tiny print and told me to take over-the-counter Tylenol. Nobody explained signs of infection. By Thursday the surgical site was bright red, oozing yellow pus, and burning with a 102.4 fever. When I called the surgical clinic desk, they told me the earliest appointment was in 3 weeks. I am now in an urgent care clinic receiving IV antibiotics for cellulitis.',
    triaged: true,
    triage: {
      primaryCategory: 'Discharge and Follow-Up',
      secondaryCategories: ['Clinical Care', 'Communication', 'Patient Safety'],
      severityLevel: 'LEVEL 3 – High',
      severityLevelNumber: 3,
      severityJustification:
        'Deficient post-operative discharge education combined with clinic inability to provide timely acute follow-up, resulting in untreated surgical site infection requiring IV antibiotics.',
      riskFlags: [
        {
          riskType: 'Clinical Risk',
          explanation: 'Post-operative surgical site infection (SSI) and wound dehiscence with systemic fever.',
        },
        {
          riskType: 'Patient Safety Risk',
          explanation: 'Inadequate discharge counseling on infection warning signs and failure of surgical clinic triage safety net.',
        },
        {
          riskType: 'Compliance Risk',
          explanation: 'Readmission and surgical site infection metrics tracking under NSQIP / CMS hospital-acquired conditions.',
        },
      ],
      recommendedDepartment: 'Physician Leadership',
      escalationPriority: 'Priority',
      humanReviewStatus: 'Human Review Required',
      humanReviewReason:
        'Clinical care concern involving surgical site infection, failed post-op education, and 3-week clinic delay.',
      executiveSummary:
        'High severity post-surgical discharge breakdown leading to untreated SSI cellulitis with 102.4 fever. Route to General Surgery Physician Leadership and Quality Improvement for immediate clinical audit.',
      keyIncidentPoints: [
        'Deficient surgical discharge education regarding SSI warning signs.',
        'Clinic offered 3-week appointment for acute fever and purulent wound drainage.',
        'Patient required urgent outpatient IV antibiotic rescue therapy.',
      ],
      triagedAt: '2026-10-15T16:20:00Z',
      humanAuditStatus: 'Approved',
    },
  },
  {
    id: 'GRIEV-2026-088',
    patientId: 'PT-72419',
    patientName: 'Brenda Holloway',
    source: 'Feedback Submission',
    dateReceived: '2026-10-14',
    department: 'Physical Therapy & Rehab',
    location: 'South Campus Annex',
    complaintText:
      'The automatic wheelchair entrance door at the rehabilitation clinic has been broken with a yellow "Out of Order" sign for over 6 weeks. I am a quadriplegic patient who comes twice a week. Every visit, I have to wait outside in the rain or cold and knock loudly on the glass until someone happens to walk by. The curb ramp is also cracked and nearly tipped my electric chair.',
    triaged: true,
    triage: {
      primaryCategory: 'Accessibility and Equity',
      secondaryCategories: ['Patient Safety', 'Other'],
      severityLevel: 'LEVEL 3 – High',
      severityLevelNumber: 3,
      severityJustification:
        'Chronic physical accessibility barrier (6 weeks) violating Americans with Disabilities Act (ADA) Title III access, creating physical tip-over safety hazard for electric wheelchair users.',
      riskFlags: [
        {
          riskType: 'Accessibility Risk',
          explanation: 'Prolonged non-functioning ADA automated entrance in a specialized physical therapy facility.',
        },
        {
          riskType: 'Compliance Risk',
          explanation: 'Federal ADA Title III accessibility non-compliance exposure and building code violation.',
        },
        {
          riskType: 'Patient Safety Risk',
          explanation: 'Structural deterioration of curb ramp posing tip hazard for power mobility equipment.',
        },
      ],
      recommendedDepartment: 'Accessibility Coordinator',
      escalationPriority: 'Priority',
      humanReviewStatus: 'Human Review Required',
      humanReviewReason:
        'Significant physical accessibility barrier and ADA compliance violation risking patient physical injury.',
      executiveSummary:
        'High severity chronic ADA accessibility violation involving broken power entrance and unsafe ramp at physical therapy annex. Route to Accessibility Coordinator and Facilities for emergency repair within 24 hours.',
      keyIncidentPoints: [
        'Automated wheelchair access door inoperative for over 6 weeks.',
        'Quadriplegic patient stranded outside repeatedly in adverse weather.',
        'Cracked curb ramp presents severe power wheelchair tip hazard.',
      ],
      triagedAt: '2026-10-14T10:10:00Z',
      humanAuditStatus: 'Pending',
    },
  },
];
