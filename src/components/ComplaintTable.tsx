import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  Building2,
  FileSpreadsheet,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  Eye,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import {
  ComplaintCategory,
  ComplaintRecord,
  HumanReviewStatus,
  RouteDepartment,
  SeverityLevel,
} from '../types/triage';

interface ComplaintTableProps {
  records: ComplaintRecord[];
  onSelectRecord: (record: ComplaintRecord) => void;
  onTriageSingleRecord: (recordId: string) => void;
  onBatchTriage: (recordIds?: string[]) => void;
  onDeleteRecords: (recordIds: string[]) => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  isBatchProcessing: boolean;
  batchProgress: { current: number; total: number } | null;
  activeFilterSeverity: string | null;
  onSelectSeverityFilter: (severity: string | null) => void;
  activeHumanReviewFilter: string | null;
  onSelectHumanReviewFilter: (status: string | null) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  records,
  onSelectRecord,
  onTriageSingleRecord,
  onBatchTriage,
  onDeleteRecords,
  onExportCsv,
  onExportExcel,
  isBatchProcessing,
  batchProgress,
  activeFilterSeverity,
  onSelectSeverityFilter,
  activeHumanReviewFilter,
  onSelectHumanReviewFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'date' | 'severity' | 'id'>('severity');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (filteredRecords: ComplaintRecord[]) => {
    if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchText = r.complaintText.toLowerCase().includes(query);
          const matchId = r.id.toLowerCase().includes(query) || (r.patientId && r.patientId.toLowerCase().includes(query));
          const matchSummary = r.triage?.executiveSummary.toLowerCase().includes(query);
          const matchDept = (r.department && r.department.toLowerCase().includes(query)) || (r.triage?.recommendedDepartment.toLowerCase().includes(query));
          const matchCategory = r.triage?.primaryCategory.toLowerCase().includes(query);
          if (!matchText && !matchId && !matchSummary && !matchDept && !matchCategory) return false;
        }

        // Severity filter
        if (activeFilterSeverity) {
          if (!r.triage || r.triage.severityLevel !== activeFilterSeverity) {
            return false;
          }
        }

        // Human review filter
        if (activeHumanReviewFilter) {
          if (!r.triage || r.triage.humanReviewStatus !== activeHumanReviewFilter) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== 'All') {
          if (!r.triage || (r.triage.primaryCategory !== categoryFilter && !r.triage.secondaryCategories?.includes(categoryFilter as ComplaintCategory))) {
            return false;
          }
        }

        // Department filter
        if (departmentFilter !== 'All') {
          if (!r.triage || r.triage.recommendedDepartment !== departmentFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'severity') {
          const sevA = a.triage?.severityLevelNumber || 0;
          const sevB = b.triage?.severityLevelNumber || 0;
          comparison = sevB - sevA; // higher severity first by default
        } else if (sortField === 'date') {
          comparison = a.dateReceived.localeCompare(b.dateReceived);
        } else if (sortField === 'id') {
          comparison = a.id.localeCompare(b.id);
        }
        return sortAsc ? comparison * -1 : comparison;
      });
  }, [
    records,
    searchTerm,
    activeFilterSeverity,
    activeHumanReviewFilter,
    categoryFilter,
    departmentFilter,
    sortField,
    sortAsc,
  ]);

  const untriagedCount = records.filter((r) => !r.triaged).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Header & Search / Filters Toolbar */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaints, patient IDs, keywords, categories..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Run Batch Triage Button */}
            {untriagedCount > 0 && (
              <button
                onClick={() => onBatchTriage()}
                disabled={isBatchProcessing}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors inline-flex items-center shadow-xs disabled:opacity-60"
              >
                {isBatchProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>
                      Triaging Batch ({batchProgress?.current || 0}/{batchProgress?.total || untriagedCount})
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    <span>Triage Untriaged ({untriagedCount})</span>
                  </>
                )}
              </button>
            )}

            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => onBatchTriage(Array.from(selectedIds))}
                  disabled={isBatchProcessing}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors inline-flex items-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Re-triage Selected ({selectedIds.size})
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${selectedIds.size} selected complaints?`)) {
                      onDeleteRecords(Array.from(selectedIds));
                      setSelectedIds(new Set());
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors inline-flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              </>
            )}

            {/* Export Dropdown / Buttons */}
            <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
              <button
                onClick={onExportCsv}
                className="px-2.5 py-1.5 text-xs font-medium rounded text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors inline-flex items-center"
                title="Export triaged database to CSV"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
                CSV
              </button>
              <button
                onClick={onExportExcel}
                className="px-2.5 py-1.5 text-xs font-medium rounded text-emerald-700 hover:bg-emerald-50 border border-emerald-300 transition-colors inline-flex items-center"
                title="Export triaged database to Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-slate-500 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Filters:
          </span>

          {/* Severity Filter Chips */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onSelectSeverityFilter(null)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeFilterSeverity === null
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Severities
            </button>
            <button
              onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 4 – Critical' ? null : 'LEVEL 4 – Critical')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeFilterSeverity === 'LEVEL 4 – Critical'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              L4 Critical
            </button>
            <button
              onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 3 – High' ? null : 'LEVEL 3 – High')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeFilterSeverity === 'LEVEL 3 – High'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              L3 High
            </button>
            <button
              onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 2 – Moderate' ? null : 'LEVEL 2 – Moderate')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeFilterSeverity === 'LEVEL 2 – Moderate'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              L2 Moderate
            </button>
            <button
              onClick={() => onSelectSeverityFilter(activeFilterSeverity === 'LEVEL 1 – Low' ? null : 'LEVEL 1 – Low')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeFilterSeverity === 'LEVEL 1 – Low'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              L1 Low
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Human Review Filter */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onSelectHumanReviewFilter(activeHumanReviewFilter === 'Human Review Required' ? null : 'Human Review Required')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeHumanReviewFilter === 'Human Review Required'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              Review Required
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-[11px] border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Patient Safety">Patient Safety</option>
            <option value="Clinical Care">Clinical Care</option>
            <option value="Accessibility and Equity">Accessibility & Equity</option>
            <option value="Privacy or Security">Privacy or Security</option>
            <option value="Billing">Billing</option>
            <option value="Discharge and Follow-Up">Discharge & Follow-Up</option>
            <option value="Communication">Communication</option>
            <option value="Scheduling">Scheduling</option>
            <option value="Wait Time">Wait Time</option>
            <option value="Staff Conduct">Staff Conduct</option>
            <option value="Technology / Patient Portal">Technology / Portal</option>
          </select>

          {/* Department Dropdown */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-[11px] border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none"
          >
            <option value="All">All Route Departments</option>
            <option value="Risk Management">Risk Management</option>
            <option value="Compliance Office">Compliance Office</option>
            <option value="Physician Leadership">Physician Leadership</option>
            <option value="Nursing Leadership">Nursing Leadership</option>
            <option value="Revenue Cycle / Billing">Revenue Cycle / Billing</option>
            <option value="Patient Experience Team">Patient Experience</option>
            <option value="Accessibility Coordinator">Accessibility Coordinator</option>
            <option value="Quality Improvement Team">Quality Improvement</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Executive Review">Executive Review</option>
          </select>

          {(activeFilterSeverity || activeHumanReviewFilter || categoryFilter !== 'All' || departmentFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                onSelectSeverityFilter(null);
                onSelectHumanReviewFilter(null);
                setCategoryFilter('All');
                setDepartmentFilter('All');
                setSearchTerm('');
              }}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-medium underline ml-auto"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Batch Processing Progress Bar */}
      {isBatchProcessing && batchProgress && (
        <div className="bg-teal-50 px-4 py-2 border-b border-teal-200 flex items-center justify-between text-xs text-teal-900 animate-pulse">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span className="font-medium">
              Processing AI Clinical Triage Protocol: {batchProgress.current} of {batchProgress.total} complaints completed...
            </span>
          </div>
          <span className="font-bold">
            {Math.round((batchProgress.current / batchProgress.total) * 100)}%
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === filteredRecords.length}
                  onChange={() => handleSelectAll(filteredRecords)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => { setSortField('id'); setSortAsc(!sortAsc); }}>
                <span className="inline-flex items-center">
                  Case ID
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </span>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => { setSortField('severity'); setSortAsc(!sortAsc); }}>
                <span className="inline-flex items-center">
                  Severity (Step 2)
                  <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                </span>
              </th>
              <th className="py-3 px-3">Category (Step 1)</th>
              <th className="py-3 px-3 min-w-[220px]">Complaint Summary</th>
              <th className="py-3 px-3">Flagged Risks (Step 3)</th>
              <th className="py-3 px-3">Route & Priority (Step 4)</th>
              <th className="py-3 px-3">Human Review (Step 5)</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No grievances match current filters</p>
                    <p className="text-xs text-slate-500">Try adjusting your search keywords, severity chips, or reset filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const t = r.triage;
                const isSelected = selectedIds.has(r.id);

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50/40' : ''
                    } ${
                      t?.severityLevelNumber === 4
                        ? 'border-l-4 border-l-rose-500'
                        : t?.severityLevelNumber === 3
                        ? 'border-l-4 border-l-orange-400'
                        : ''
                    }`}
                    onClick={() => onSelectRecord(r)}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(r.id)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    {/* Case ID & Date */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 block">
                        {r.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {r.dateReceived}
                      </span>
                    </td>

                    {/* Severity Level */}
                    <td className="py-3 px-3">
                      {t ? (
                        <div>
                          {t.severityLevelNumber === 4 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <Flame className="w-3 h-3 mr-1 text-rose-600" />
                              L4 Critical
                            </span>
                          ) : t.severityLevelNumber === 3 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                              <AlertTriangle className="w-3 h-3 mr-1 text-orange-600" />
                              L3 High
                            </span>
                          ) : t.severityLevelNumber === 2 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 mr-1 text-amber-600" />
                              L2 Moderate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              L1 Low
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                          Untriaged
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      {t ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {t.primaryCategory}
                          </span>
                          {t.secondaryCategories && t.secondaryCategories.length > 0 && (
                            <span className="text-[10px] text-slate-500 line-clamp-1">
                              +{t.secondaryCategories.join(', ')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>

                    {/* Complaint Excerpt / Executive Summary */}
                    <td className="py-3 px-3 max-w-sm">
                      <p className="font-medium text-slate-900 line-clamp-2 leading-relaxed">
                        {t ? t.executiveSummary : r.complaintText}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Unit: {r.department || 'General'} &bull; Source: {r.source}
                      </span>
                    </td>

                    {/* Flagged Risks */}
                    <td className="py-3 px-3">
                      {t?.riskFlags && t.riskFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[170px]">
                          {t.riskFlags.slice(0, 2).map((rf, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                rf.riskType === 'Patient Safety Risk'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : rf.riskType === 'Equity Risk' || rf.riskType === 'Privacy Risk'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : rf.riskType === 'Compliance Risk'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                              title={rf.explanation}
                            >
                              {rf.riskType.replace(' Risk', '')}
                            </span>
                          ))}
                          {t.riskFlags.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-medium self-center">
                              +{t.riskFlags.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Route & Priority */}
                    <td className="py-3 px-3">
                      {t ? (
                        <div>
                          <span className="font-semibold text-slate-800 flex items-center text-[11px]">
                            <Building2 className="w-3 h-3 mr-1 text-slate-500" />
                            {t.recommendedDepartment}
                          </span>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                              t.escalationPriority === 'Immediate'
                                ? 'bg-rose-100 text-rose-800'
                                : t.escalationPriority === 'Priority'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.escalationPriority}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Human Review Status */}
                    <td className="py-3 px-3">
                      {t ? (
                        <div>
                          {t.humanReviewStatus === 'Human Review Required' ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              <UserCheck className="w-3 h-3 mr-1 text-rose-600" />
                              Review Required
                            </span>
                          ) : t.humanReviewStatus === 'Human Review Recommended' ? (
                            <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              <ShieldAlert className="w-3 h-3 mr-1 text-amber-600" />
                              Recommended
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                              AI Only
                            </span>
                          )}
                          {t.humanAuditStatus === 'Approved' && (
                            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                              ✓ Approved by Clinician
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {t ? (
                        <button
                          onClick={() => onSelectRecord(r)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors inline-flex items-center"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View File
                        </button>
                      ) : (
                        <button
                          onClick={() => onTriageSingleRecord(r.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors inline-flex items-center shadow-xs"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Triage Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <div>
          Showing {filteredRecords.length} of {records.length} grievances ({records.filter(r => r.triaged).length} triaged)
        </div>
        <div className="flex items-center space-x-3">
          <span>Sort by Severity (L4 to L1) by default</span>
        </div>
      </div>
    </div>
  );
};
