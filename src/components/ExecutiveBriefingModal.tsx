import React from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  AlertTriangle,
  FileText,
  Building2,
  UserCheck,
} from 'lucide-react';
import { ComplaintRecord } from '../types/triage';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: ComplaintRecord[];
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const triaged = records.filter((r) => r.triaged && r.triage);
  const criticals = triaged.filter((r) => r.triage?.severityLevelNumber === 4);
  const highs = triaged.filter((r) => r.triage?.severityLevelNumber === 3);
  const humanReviewRequired = triaged.filter(
    (r) => r.triage?.humanReviewStatus === 'Human Review Required'
  );

  // Group by primary category
  const categoryCounts: Record<string, number> = {};
  triaged.forEach((r) => {
    const cat = r.triage?.primaryCategory || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Group by routed department
  const deptCounts: Record<string, number> = {};
  triaged.forEach((r) => {
    const dept = r.triage?.recommendedDepartment || 'Unassigned';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const reportText = `HEALTHCARE COMPLAINT TRIAGE EXECUTIVE BRIEFING
Date: ${new Date().toLocaleDateString()}
Total Complaints Analyzed: ${triaged.length}
Critical Severity (Level 4): ${criticals.length}
High Severity (Level 3): ${highs.length}
Mandatory Human Review Required: ${humanReviewRequired.length}

CRITICAL INCIDENTS (LEVEL 4):
${criticals
  .map(
    (c) =>
      `• [${c.id}] ${c.triage?.primaryCategory} - Routed to ${c.triage?.recommendedDepartment} (${c.triage?.escalationPriority})\n  Summary: ${c.triage?.executiveSummary}\n  Justification: ${c.triage?.severityJustification}\n`
  )
  .join('\n')}

DEPARTMENT ACTION QUEUES:
${Object.entries(deptCounts)
  .map(([dept, count]) => `• ${dept}: ${count} cases`)
  .join('\n')}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-teal-600/30 text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Executive Grievance & Triage Briefing</h3>
              <p className="text-xs text-slate-300">
                Hospital Quality, Risk Management & Leadership Synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Print Briefing"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors inline-flex items-center text-xs"
              title="Copy Briefing Text"
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs font-sans">
          {/* Key Executive Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">
                Total Triaged
              </span>
              <span className="text-2xl font-bold text-slate-900">{triaged.length}</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
              <span className="text-rose-800 text-[10px] uppercase font-bold block">
                Critical (Level 4)
              </span>
              <span className="text-2xl font-bold text-rose-900">{criticals.length}</span>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <span className="text-orange-800 text-[10px] uppercase font-bold block">
                High Risk (Level 3)
              </span>
              <span className="text-2xl font-bold text-orange-900">{highs.length}</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <span className="text-purple-800 text-[10px] uppercase font-bold block">
                Human Review Req.
              </span>
              <span className="text-2xl font-bold text-purple-950">
                {humanReviewRequired.length}
              </span>
            </div>
          </div>

          {/* Level 4 Critical Cases Callout */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center mb-2">
              <Flame className="w-4 h-4 mr-1.5 text-rose-600" />
              Critical Incidents Requiring Immediate Action
            </h4>
            {criticals.length === 0 ? (
              <p className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs">
                No Level 4 Critical incidents currently pending in intake.
              </p>
            ) : (
              <div className="space-y-2.5">
                {criticals.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-rose-50/70 border border-rose-300 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-rose-950">
                        {c.id} &bull; {c.triage?.primaryCategory}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                        {c.triage?.escalationPriority} Escalation &rarr; {c.triage?.recommendedDepartment}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium mt-1">
                      {c.triage?.executiveSummary}
                    </p>
                    <p className="text-slate-600 text-[11px] mt-1 italic">
                      Clinical Justification: {c.triage?.severityJustification}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              Grievance Category Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div
                  key={cat}
                  className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
                >
                  <span className="text-slate-700 truncate pr-1">{cat}</span>
                  <span className="font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Routing Queue Distribution */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center mb-2">
              <Building2 className="w-4 h-4 mr-1.5 text-teal-600" />
              Department Escalation Queues
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(deptCounts).map(([dept, count]) => (
                <div
                  key={dept}
                  className="p-2.5 bg-teal-50/50 border border-teal-200 rounded flex items-center justify-between"
                >
                  <span className="font-medium text-slate-800">{dept}</span>
                  <span className="font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded-full">
                    {count} case{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Official Clinical Quality & Patient Safety Briefing Document
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
