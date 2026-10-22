import React from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  Activity,
} from 'lucide-react';
import { ComplaintRecord } from '../types/triage';

interface StatsSummaryProps {
  records: ComplaintRecord[];
  activeFilterSeverity: string | null;
  onSelectSeverityFilter: (severity: string | null) => void;
  activeHumanReviewFilter: string | null;
  onSelectHumanReviewFilter: (status: string | null) => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  records,
  activeFilterSeverity,
  onSelectSeverityFilter,
  activeHumanReviewFilter,
  onSelectHumanReviewFilter,
}) => {
  const total = records.length;
  const triagedList = records.filter((r) => r.triaged && r.triage);
  const triagedCount = triagedList.length;

  const level4 = triagedList.filter((r) => r.triage?.severityLevelNumber === 4).length;
  const level3 = triagedList.filter((r) => r.triage?.severityLevelNumber === 3).length;
  const level2 = triagedList.filter((r) => r.triage?.severityLevelNumber === 2).length;
  const level1 = triagedList.filter((r) => r.triage?.severityLevelNumber === 1).length;

  const humanRequired = triagedList.filter(
    (r) => r.triage?.humanReviewStatus === 'Human Review Required'
  ).length;

  const immediatePriority = triagedList.filter(
    (r) => r.triage?.escalationPriority === 'Immediate'
  ).length;

  return (
    <div className="space-y-3">
      {/* Critical safety banner if Level 4 or Immediate exist */}
      {level4 > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-3.5 rounded-r-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <div>
              <p className="text-sm font-semibold text-rose-950">
                {level4} Critical Level 4 Incident{level4 > 1 ? 's' : ''} Identified
              </p>
              <p className="text-xs text-rose-800">
                Mandatory human review required for patient safety, civil rights, or HIPAA privacy triggers.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 4 – Critical' ? null : 'LEVEL 4 – Critical')}
            className="px-3 py-1 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors"
          >
            {activeFilterSeverity === 'LEVEL 4 – Critical' ? 'Clear Filter' : 'Filter Critical'}
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Card */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Intake</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500 ml-1.5">
              ({triagedCount} triaged)
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${total ? (triagedCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Level 4 Critical Card */}
        <button
          onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 4 – Critical' ? null : 'LEVEL 4 – Critical')}
          className={`text-left p-3.5 rounded-lg border transition-all shadow-sm flex flex-col justify-between ${
            activeFilterSeverity === 'LEVEL 4 – Critical'
              ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-500/30'
              : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold uppercase tracking-wider">
            <span>Level 4 Critical</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-950">{level4}</span>
            <span className="text-xs text-rose-700 font-medium">Immediate</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-800 line-clamp-1">
            Safety / Privacy / Legal
          </p>
        </button>

        {/* Level 3 High Card */}
        <button
          onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 3 – High' ? null : 'LEVEL 3 – High')}
          className={`text-left p-3.5 rounded-lg border transition-all shadow-sm flex flex-col justify-between ${
            activeFilterSeverity === 'LEVEL 3 – High'
              ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-500/30'
              : 'bg-orange-50/70 border-orange-200 hover:bg-orange-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-orange-800 text-xs font-semibold uppercase tracking-wider">
            <span>Level 3 High</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-orange-950">{level3}</span>
            <span className="text-xs text-orange-700 font-medium">Priority</span>
          </div>
          <p className="mt-1 text-[11px] text-orange-800 line-clamp-1">
            Harm risk / Medications
          </p>
        </button>

        {/* Level 2 Moderate Card */}
        <button
          onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 2 – Moderate' ? null : 'LEVEL 2 – Moderate')}
          className={`text-left p-3.5 rounded-lg border transition-all shadow-sm flex flex-col justify-between ${
            activeFilterSeverity === 'LEVEL 2 – Moderate'
              ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-500/30'
              : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <span>Level 2 Moderate</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-950">{level2}</span>
            <span className="text-xs text-amber-700 font-medium">Service Failures</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-800 line-clamp-1">
            Repeated delays & breakdowns
          </p>
        </button>

        {/* Level 1 Low Card */}
        <button
          onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 1 – Low' ? null : 'LEVEL 1 – Low')}
          className={`text-left p-3.5 rounded-lg border transition-all shadow-sm flex flex-col justify-between ${
            activeFilterSeverity === 'LEVEL 1 – Low'
              ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500/30'
              : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <span>Level 1 Low</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-950">{level1}</span>
            <span className="text-xs text-emerald-700 font-medium">Routine</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-800 line-clamp-1">
            General feedback / Wait time
          </p>
        </button>

        {/* Human Review Required Card */}
        <button
          onClick={() => onSelectHumanReviewFilter(activeHumanReviewFilter === 'Human Review Required' ? null : 'Human Review Required')}
          className={`text-left p-3.5 rounded-lg border transition-all shadow-sm flex flex-col justify-between ${
            activeHumanReviewFilter === 'Human Review Required'
              ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-500/30'
              : 'bg-purple-50/70 border-purple-200 hover:bg-purple-100/70'
          }`}
        >
          <div className="flex items-center justify-between text-purple-900 text-xs font-semibold uppercase tracking-wider">
            <span>Human Review</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-950">{humanRequired}</span>
            <span className="text-xs text-purple-700 font-medium">Mandatory</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-800 line-clamp-1">
            {immediatePriority} immediate queue
          </p>
        </button>
      </div>
    </div>
  );
};
