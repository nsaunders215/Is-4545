import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  CheckCircle2,
  UserCheck,
  Building2,
  Copy,
  Check,
  Send,
  Printer,
  ChevronRight,
  ExternalLink,
  Edit3,
  Save,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import {
  ComplaintCategory,
  ComplaintRecord,
  EscalationPriority,
  HumanReviewStatus,
  RouteDepartment,
  SeverityLevel,
} from '../types/triage';
import { formatTriageTextOutput } from '../utils/triageEngine';

interface ComplaintDetailModalProps {
  record: ComplaintRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTriage: (recordId: string, updatedRecord: ComplaintRecord) => void;
}

const ALL_CATEGORIES: ComplaintCategory[] = [
  'Communication',
  'Scheduling',
  'Wait Time',
  'Technology / Patient Portal',
  'Billing',
  'Clinical Care',
  'Discharge and Follow-Up',
  'Accessibility and Equity',
  'Patient Safety',
  'Privacy or Security',
  'Staff Conduct',
  'Other',
];

const ALL_DEPARTMENTS: RouteDepartment[] = [
  'Patient Experience Team',
  'Nursing Leadership',
  'Physician Leadership',
  'Quality Improvement Team',
  'Compliance Office',
  'Information Technology',
  'Revenue Cycle / Billing',
  'Accessibility Coordinator',
  'Risk Management',
  'Executive Review',
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onUpdateTriage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields for human oversight
  const [editCategory, setEditCategory] = useState<ComplaintCategory>('Patient Safety');
  const [editSeverityLevel, setEditSeverityLevel] = useState<SeverityLevel>('LEVEL 3 – High');
  const [editDepartment, setEditDepartment] = useState<RouteDepartment>('Risk Management');
  const [editPriority, setEditPriority] = useState<EscalationPriority>('Priority');
  const [editHumanReview, setEditHumanReview] = useState<HumanReviewStatus>('Human Review Required');
  const [auditorNotes, setAuditorNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  if (!isOpen || !record) return null;

  const triage = record.triage;

  const handleStartEdit = () => {
    if (triage) {
      setEditCategory(triage.primaryCategory);
      setEditSeverityLevel(triage.severityLevel);
      setEditDepartment(triage.recommendedDepartment);
      setEditPriority(triage.escalationPriority);
      setEditHumanReview(triage.humanReviewStatus);
      setAuditorNotes(triage.humanAuditorNotes || '');
      setReviewerName(triage.reviewedBy || 'Clinical Risk Officer');
    }
    setIsEditing(true);
  };

  const handleSaveAudit = () => {
    if (!triage) return;

    let num: 1 | 2 | 3 | 4 = 1;
    if (editSeverityLevel.includes('4')) num = 4;
    else if (editSeverityLevel.includes('3')) num = 3;
    else if (editSeverityLevel.includes('2')) num = 2;

    const updatedRecord: ComplaintRecord = {
      ...record,
      triage: {
        ...triage,
        primaryCategory: editCategory,
        severityLevel: editSeverityLevel,
        severityLevelNumber: num,
        recommendedDepartment: editDepartment,
        escalationPriority: editPriority,
        humanReviewStatus: editHumanReview,
        humanAuditStatus: 'Modified',
        humanAuditorNotes: auditorNotes,
        reviewedBy: reviewerName,
      },
    };

    onUpdateTriage(record.id, updatedRecord);
    setIsEditing(false);
  };

  const handleApproveAsIs = () => {
    if (!triage) return;
    const updatedRecord: ComplaintRecord = {
      ...record,
      triage: {
        ...triage,
        humanAuditStatus: 'Approved',
        reviewedBy: reviewerName || 'Verified Clinical Reviewer',
        humanAuditorNotes: auditorNotes || 'Reviewed and validated with AI triage recommendations.',
      },
    };
    onUpdateTriage(record.id, updatedRecord);
  };

  const handleCopyStandardOutput = () => {
    if (!triage) return;
    const text = formatTriageTextOutput(triage);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getSeverityBadge = (level: string) => {
    if (level.includes('4') || level.includes('Critical')) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <Flame className="w-3.5 h-3.5 mr-1 text-rose-600 animate-pulse" />
          LEVEL 4 – Critical
        </span>
      );
    }
    if (level.includes('3') || level.includes('High')) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-orange-600" />
          LEVEL 3 – High
        </span>
      );
    }
    if (level.includes('2') || level.includes('Moderate')) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
          LEVEL 2 – Moderate
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
        LEVEL 1 – Low
      </span>
    );
  };

  const getHumanReviewBadge = (status: HumanReviewStatus) => {
    if (status === 'Human Review Required') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-900 border border-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
          Human Review Required
        </span>
      );
    }
    if (status === 'Human Review Recommended') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />
          Human Review Recommended
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-600" />
        AI Review Only
      </span>
    );
  };

  const getPriorityBadge = (priority: EscalationPriority) => {
    if (priority === 'Immediate') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-rose-600 text-white shadow-xs">
          Immediate Escalation
        </span>
      );
    }
    if (priority === 'Priority') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-600 text-white shadow-xs">
          Priority Escalation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-600 text-white">
        Routine
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600/30 text-teal-300 flex items-center justify-center font-mono font-bold text-xs">
              {record.id.slice(-4)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  Complaint Triage File: {record.id}
                </h3>
                {record.patientId && (
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    Patient ID: {record.patientId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Source: {record.source} &bull; Received: {record.dateReceived} &bull; Unit: {record.department || 'General'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Print Triage Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyStandardOutput}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors inline-flex items-center text-xs"
              title="Copy Standard Format to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Original Complaint Text Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Original Complaint / Grievance Text
              </span>
              <span className="text-[11px] text-slate-500">
                Channel: {record.source}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-slate-200">
              "{record.complaintText}"
            </p>
          </div>

          {/* If untriaged */}
          {!triage ? (
            <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-amber-900">
                This grievance has not yet been processed by the Triage Engine.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Close this modal and click "Triage All Intake" or run triage on this record.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Quick Status Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-100 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Assigned Severity
                  </span>
                  <div className="mt-1">{getSeverityBadge(triage.severityLevel)}</div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Escalation Route & Priority
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      {triage.recommendedDepartment}
                    </span>
                    {getPriorityBadge(triage.escalationPriority)}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Human Oversight Status
                  </span>
                  <div className="mt-1">{getHumanReviewBadge(triage.humanReviewStatus)}</div>
                </div>
              </div>

              {/* 6-Step Triage Execution Cards */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center border-b border-slate-200 pb-2">
                  <FileCheck className="w-4 h-4 mr-1.5 text-teal-600" />
                  Clinical Triage Protocol Breakdown (Steps 1 – 6)
                </h4>

                {/* STEP 1: Complaint Category */}
                <div className="border border-slate-200 rounded-lg p-3.5 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      STEP 1: Complaint Category
                    </span>
                    <span className="text-[11px] bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded border border-teal-200">
                      Primary: {triage.primaryCategory}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-700">
                    <p>
                      <strong className="text-slate-900">Primary Classification:</strong>{' '}
                      {triage.primaryCategory}
                    </p>
                    <p className="mt-1">
                      <strong className="text-slate-900">Secondary Categories:</strong>{' '}
                      {triage.secondaryCategories && triage.secondaryCategories.length > 0 ? (
                        <span className="inline-flex flex-wrap gap-1 mt-1">
                          {triage.secondaryCategories.map((cat, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200"
                            >
                              {cat}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None identified</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* STEP 2: Severity Assessment */}
                <div className="border border-slate-200 rounded-lg p-3.5 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      STEP 2: Severity Assessment
                    </span>
                    <div>{getSeverityBadge(triage.severityLevel)}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <p className="font-semibold text-slate-900 mb-0.5">Clinical / Operational Justification:</p>
                    <p className="leading-relaxed">{triage.severityJustification}</p>
                  </div>
                </div>

                {/* STEP 3: Risk Detection */}
                <div className="border border-slate-200 rounded-lg p-3.5 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      STEP 3: Risk Detection
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {triage.riskFlags.length} risk flags detected
                    </span>
                  </div>
                  <div className="space-y-2">
                    {triage.riskFlags.map((risk, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded border-l-4 border-l-amber-500 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                            {risk.riskType}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1 pl-5 leading-relaxed">
                          {risk.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 4: Escalation Recommendation */}
                <div className="border border-slate-200 rounded-lg p-3.5 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      STEP 4: Escalation Recommendation
                    </span>
                    <div>{getPriorityBadge(triage.escalationPriority)}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-teal-50/60 border border-teal-200 rounded">
                      <span className="text-[11px] uppercase font-bold text-teal-800 block">
                        Target Department Routing
                      </span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center">
                        <Building2 className="w-4 h-4 mr-1 text-teal-700" />
                        {triage.recommendedDepartment}
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[11px] uppercase font-bold text-slate-600 block">
                        Response Timeframe SLA
                      </span>
                      <p className="font-medium text-slate-800 text-xs mt-1">
                        {triage.escalationPriority === 'Immediate'
                          ? '< 4 Hours (Urgent Clinical/Legal Risk Protocol)'
                          : triage.escalationPriority === 'Priority'
                          ? '< 24 Hours (Department Leadership Review)'
                          : '< 5 Business Days (Standard Patient Experience)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* STEP 5: Human Review Requirement */}
                <div className="border border-slate-200 rounded-lg p-3.5 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      STEP 5: Human Review Requirement
                    </span>
                    <div>{getHumanReviewBadge(triage.humanReviewStatus)}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-700">
                    <p className="leading-relaxed">
                      <strong className="text-slate-900">Determining Criteria:</strong>{' '}
                      {triage.humanReviewReason ||
                        'Evaluated against clinical safety, discrimination allegation, HIPAA privacy rule, or statutory compliance standards.'}
                    </p>
                  </div>
                </div>

                {/* STEP 6: Executive Summary */}
                <div className="border border-teal-200 rounded-lg p-3.5 bg-teal-50/40 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                      STEP 6: Executive Summary
                    </span>
                    <span className="text-[10px] text-teal-700 uppercase font-semibold">
                      For Leadership Digest
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                    {triage.executiveSummary}
                  </p>
                </div>

                {/* Official Copy-Pasteable Output Card */}
                <div className="mt-4 border border-slate-300 rounded-lg p-4 bg-slate-900 text-slate-100 font-mono text-xs shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-bold text-teal-400">
                      Standardized Output Record (Copy-Ready)
                    </span>
                    <button
                      onClick={handleCopyStandardOutput}
                      className="inline-flex items-center text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy Format
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-slate-200">
                    {formatTriageTextOutput(triage)}
                  </pre>
                </div>
              </div>

              {/* Human Oversight & Clinical Override Section */}
              <div className="mt-6 border-t-2 border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <UserCheck className="w-4 h-4 mr-1.5 text-purple-600" />
                    Human Auditor & Clinician Oversight
                  </h4>
                  <div className="flex items-center space-x-2">
                    {triage.humanAuditStatus === 'Approved' && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded border border-emerald-300">
                        Clinically Approved
                      </span>
                    )}
                    {triage.humanAuditStatus === 'Modified' && (
                      <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded border border-purple-300">
                        Modified by Human
                      </span>
                    )}
                    {!isEditing && (
                      <button
                        onClick={handleStartEdit}
                        className="inline-flex items-center text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-600" />
                        Modify Triage
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-lg space-y-3 text-xs">
                    <p className="font-bold text-purple-900">
                      Override AI Recommendations (Human Clinician in the Loop):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Primary Category Override:
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as ComplaintCategory)}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                        >
                          {ALL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Severity Level Override:
                        </label>
                        <select
                          value={editSeverityLevel}
                          onChange={(e) => setEditSeverityLevel(e.target.value as SeverityLevel)}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                        >
                          <option value="LEVEL 1 – Low">LEVEL 1 – Low</option>
                          <option value="LEVEL 2 – Moderate">LEVEL 2 – Moderate</option>
                          <option value="LEVEL 3 – High">LEVEL 3 – High</option>
                          <option value="LEVEL 4 – Critical">LEVEL 4 – Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Route To Department:
                        </label>
                        <select
                          value={editDepartment}
                          onChange={(e) => setEditDepartment(e.target.value as RouteDepartment)}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                        >
                          {ALL_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Escalation Priority:
                        </label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as EscalationPriority)}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                        >
                          <option value="Routine">Routine</option>
                          <option value="Priority">Priority</option>
                          <option value="Immediate">Immediate</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Auditor Clinical Notes & Decision Rationale:
                      </label>
                      <textarea
                        rows={2}
                        value={auditorNotes}
                        onChange={(e) => setAuditorNotes(e.target.value)}
                        placeholder="Document human clinical rationale for modifying or confirming this triage..."
                        className="w-full text-xs rounded border border-slate-300 p-2 bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Reviewer Name / Title (e.g. Dr. Jane Smith, Risk Officer)"
                        className="text-xs rounded border border-slate-300 px-2 py-1 w-64 bg-white"
                      />

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAudit}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold inline-flex items-center"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Save Human Override
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-slate-800">
                        <strong className="text-slate-900">Auditor Status:</strong>{' '}
                        {triage.humanAuditStatus || 'Pending Review'}
                        {triage.reviewedBy && (
                          <span className="text-slate-600 ml-2">
                            (By: {triage.reviewedBy})
                          </span>
                        )}
                      </p>
                      {triage.humanAuditorNotes && (
                        <p className="text-slate-600 mt-0.5 italic">
                          "{triage.humanAuditorNotes}"
                        </p>
                      )}
                    </div>

                    {triage.humanAuditStatus !== 'Approved' && (
                      <button
                        onClick={handleApproveAsIs}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold inline-flex items-center shrink-0 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approve Triage As-Is
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {triage?.triagedAt && (
              <span>Triaged on {new Date(triage.triagedAt).toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Triage File
          </button>
        </div>
      </div>
    </div>
  );
};
