import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StatsSummary } from './components/StatsSummary';
import { ComplaintTable } from './components/ComplaintTable';
import { UploadModal } from './components/UploadModal';
import { SingleComplaintModal } from './components/SingleComplaintModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ExecutiveBriefingModal } from './components/ExecutiveBriefingModal';
import { SAMPLE_COMPLAINTS } from './data/sampleComplaints';
import { ComplaintRecord } from './types/triage';
import {
  batchTriageWithGemini,
  triageWithGemini,
} from './utils/triageEngine';
import {
  exportTriagedDataToCsv,
  exportTriagedDataToExcel,
} from './utils/fileHandler';
import {
  CheckCircle2,
  FileSpreadsheet,
  Info,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<ComplaintRecord[]>(SAMPLE_COMPLAINTS);
  const [selectedRecord, setSelectedRecord] = useState<ComplaintRecord | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSingleTriageOpen, setIsSingleTriageOpen] = useState(false);
  const [isExecutiveBriefingOpen, setIsExecutiveBriefingOpen] = useState(false);

  // Filters
  const [activeFilterSeverity, setActiveFilterSeverity] = useState<string | null>(null);
  const [activeHumanReviewFilter, setActiveHumanReviewFilter] = useState<string | null>(null);

  // Batch triage execution state
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Handle uploaded data
  const handleDataLoaded = async (newRecords: ComplaintRecord[], shouldAutoTriage: boolean) => {
    // Merge or replace
    const combined = [...newRecords, ...records];
    setRecords(combined);

    if (shouldAutoTriage) {
      const idsToTriage = newRecords.map((r) => r.id);
      await runBatchTriage(idsToTriage, combined);
    }
  };

  // Run Batch Triage on specified record IDs or all untriaged
  const runBatchTriage = async (targetIds?: string[], sourceRecords = records) => {
    const listToProcess = targetIds
      ? sourceRecords.filter((r) => targetIds.includes(r.id))
      : sourceRecords.filter((r) => !r.triaged);

    if (listToProcess.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: listToProcess.length });

    try {
      const formattedItems = listToProcess.map((r) => ({
        id: r.id,
        text: r.complaintText,
        source: r.source,
        department: r.department,
      }));

      const resultsMap = await batchTriageWithGemini(formattedItems, (current, total) => {
        setBatchProgress({ current, total });
      });

      setRecords((prev) =>
        prev.map((rec) => {
          if (resultsMap.has(rec.id)) {
            return {
              ...rec,
              triaged: true,
              triage: resultsMap.get(rec.id),
            };
          }
          return rec;
        })
      );
    } catch (err) {
      console.error('Batch triage failed:', err);
    } finally {
      setIsBatchProcessing(false);
      setBatchProgress(null);
    }
  };

  // Triage single record
  const handleTriageSingleRecord = async (recordId: string) => {
    const target = records.find((r) => r.id === recordId);
    if (!target) return;

    try {
      const triage = await triageWithGemini(target.complaintText, {
        patientId: target.patientId,
        source: target.source,
        department: target.department,
      });

      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? {
                ...r,
                triaged: true,
                triage,
              }
            : r
        )
      );

      // Open detail modal for immediate review
      setSelectedRecord({
        ...target,
        triaged: true,
        triage,
      });
    } catch (err) {
      console.error('Single triage error:', err);
    }
  };

  // Save human audit changes
  const handleUpdateTriage = (recordId: string, updatedRecord: ComplaintRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === recordId ? updatedRecord : r)));
    setSelectedRecord(updatedRecord);
  };

  // Delete records
  const handleDeleteRecords = (ids: string[]) => {
    const set = new Set(ids);
    setRecords((prev) => prev.filter((r) => !set.has(r.id)));
  };

  // Reset to sample cases
  const handleResetToSamples = () => {
    if (confirm('Reload the default clinical test suite of grievances?')) {
      setRecords(SAMPLE_COMPLAINTS);
      setActiveFilterSeverity(null);
      setActiveHumanReviewFilter(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Navigation */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSingleTriage={() => setIsSingleTriageOpen(true)}
        onOpenExecutiveBriefing={() => setIsExecutiveBriefingOpen(true)}
        onResetToSamples={handleResetToSamples}
        onExportCsv={() => exportTriagedDataToCsv(records)}
        onExportExcel={() => exportTriagedDataToExcel(records)}
        recordsCount={records.length}
        triagedCount={records.filter((r) => r.triaged).length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Operational Banner explaining role and protocol */}
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-teal-500/20 text-teal-300">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </span>
              <h2 className="font-semibold text-sm sm:text-base text-white">
                Healthcare Grievance & Patient Safety Triage Protocol
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Assists healthcare organizations in triaging patient complaints across 6 clinical steps:
              <span className="text-teal-300 font-medium"> 1. Category</span> &bull;
              <span className="text-teal-300 font-medium"> 2. Severity (Level 1–4)</span> &bull;
              <span className="text-teal-300 font-medium"> 3. Risk Flags</span> &bull;
              <span className="text-teal-300 font-medium"> 4. Routing & Escalation Priority</span> &bull;
              <span className="text-teal-300 font-medium"> 5. Human Review Requirement</span> &bull;
              <span className="text-teal-300 font-medium"> 6. Executive Summary</span>.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs inline-flex items-center"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              Upload Grievance Data
            </button>
            <button
              onClick={() => setIsSingleTriageOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors inline-flex items-center"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
              Triage Single
            </button>
          </div>
        </div>

        {/* Clinical Statistics & Severity Filter Cards */}
        <StatsSummary
          records={records}
          activeFilterSeverity={activeFilterSeverity}
          onSelectSeverityFilter={setActiveFilterSeverity}
          activeHumanReviewFilter={activeHumanReviewFilter}
          onSelectHumanReviewFilter={setActiveHumanReviewFilter}
        />

        {/* Main Grievance Queue Table */}
        <ComplaintTable
          records={records}
          onSelectRecord={(rec) => setSelectedRecord(rec)}
          onTriageSingleRecord={handleTriageSingleRecord}
          onBatchTriage={(ids) => runBatchTriage(ids)}
          onDeleteRecords={handleDeleteRecords}
          onExportCsv={() => exportTriagedDataToCsv(records)}
          onExportExcel={() => exportTriagedDataToExcel(records)}
          isBatchProcessing={isBatchProcessing}
          batchProgress={batchProgress}
          activeFilterSeverity={activeFilterSeverity}
          onSelectSeverityFilter={setActiveFilterSeverity}
          activeHumanReviewFilter={activeHumanReviewFilter}
          onSelectHumanReviewFilter={setActiveHumanReviewFilter}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Healthcare Complaint Triage System &bull; Human-in-the-Loop Clinical Prioritization</span>
          <span className="text-slate-400">Strict Patient Safety, HIPAA & Civil Rights Compliance Architecture</span>
        </div>
      </footer>

      {/* Upload Modal (CSV / Excel) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Single Complaint Interactive Triage Modal */}
      <SingleComplaintModal
        isOpen={isSingleTriageOpen}
        onClose={() => setIsSingleTriageOpen(false)}
        onSaveRecord={(newRec) => {
          setRecords((prev) => [newRec, ...prev]);
          setSelectedRecord(newRec);
        }}
      />

      {/* Detailed Complaint 6-Step View & Human Override Modal */}
      <ComplaintDetailModal
        record={selectedRecord}
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        onUpdateTriage={handleUpdateTriage}
      />

      {/* Executive Briefing Modal */}
      <ExecutiveBriefingModal
        isOpen={isExecutiveBriefingOpen}
        onClose={() => setIsExecutiveBriefingOpen(false)}
        records={records}
      />
    </div>
  );
}
