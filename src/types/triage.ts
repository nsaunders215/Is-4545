export type ComplaintCategory =
  | 'Communication'
  | 'Scheduling'
  | 'Wait Time'
  | 'Technology / Patient Portal'
  | 'Billing'
  | 'Clinical Care'
  | 'Discharge and Follow-Up'
  | 'Accessibility and Equity'
  | 'Patient Safety'
  | 'Privacy or Security'
  | 'Staff Conduct'
  | 'Other';

export type SeverityLevel =
  | 'LEVEL 1 – Low'
  | 'LEVEL 2 – Moderate'
  | 'LEVEL 3 – High'
  | 'LEVEL 4 – Critical';

export type RiskType =
  | 'Patient Safety Risk'
  | 'Clinical Risk'
  | 'Compliance Risk'
  | 'Privacy Risk'
  | 'Accessibility Risk'
  | 'Equity Risk'
  | 'Reputational Risk'
  | 'Operational Risk';

export type RouteDepartment =
  | 'Patient Experience Team'
  | 'Nursing Leadership'
  | 'Physician Leadership'
  | 'Quality Improvement Team'
  | 'Compliance Office'
  | 'Information Technology'
  | 'Revenue Cycle / Billing'
  | 'Accessibility Coordinator'
  | 'Risk Management'
  | 'Executive Review';

export type EscalationPriority = 'Routine' | 'Priority' | 'Immediate';

export type HumanReviewStatus =
  | 'AI Review Only'
  | 'Human Review Recommended'
  | 'Human Review Required';

export interface RiskFlag {
  riskType: RiskType;
  explanation: string;
}

export interface TriageResult {
  primaryCategory: ComplaintCategory;
  secondaryCategories?: ComplaintCategory[];
  severityLevel: SeverityLevel;
  severityLevelNumber: 1 | 2 | 3 | 4;
  severityJustification: string;
  riskFlags: RiskFlag[];
  recommendedDepartment: RouteDepartment;
  escalationPriority: EscalationPriority;
  humanReviewStatus: HumanReviewStatus;
  humanReviewReason?: string;
  executiveSummary: string;
  keyIncidentPoints?: string[];
  triagedAt?: string;
  // Human override / audit fields
  humanAuditStatus?: 'Pending' | 'Approved' | 'Modified';
  humanAuditorNotes?: string;
  reviewedBy?: string;
}

export interface ComplaintRecord {
  id: string;
  patientId?: string;
  source: string; // e.g., 'Patient Portal', 'Survey Comment', 'Grievance Report', 'Online Review'
  dateReceived: string;
  complaintText: string;
  department?: string;
  location?: string;
  patientName?: string;
  triaged: boolean;
  triage?: TriageResult;
}

export interface BatchProcessingStats {
  total: number;
  processed: number;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  humanReviewRequired: number;
  immediatePriority: number;
}
