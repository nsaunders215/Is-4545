import React from 'react';
import {
  ShieldAlert,
  FileSpreadsheet,
  PlusCircle,
  Stethoscope,
  Download,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { generateTemplateCsv } from '../utils/fileHandler';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenSingleTriage: () => void;
  onOpenExecutiveBriefing: () => void;
  onResetToSamples: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  recordsCount: number;
  triagedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onOpenSingleTriage,
  onOpenExecutiveBriefing,
  onResetToSamples,
  onExportCsv,
  onExportExcel,
  recordsCount,
  triagedCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Healthcare Complaint Triage Agent
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-teal-400" />
                  Clinical AI Triage
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Clinical prioritization, risk detection & human-in-the-loop routing
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenSingleTriage}
              className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              title="Test a single patient grievance or portal message"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span className="hidden md:inline">Triage Single</span> Complaint
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              title="Upload CSV or Excel file containing grievances"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-teal-400" />
              Upload CSV / Excel
            </button>

            <div className="hidden lg:flex items-center space-x-1 border-l border-slate-700 pl-3">
              <button
                onClick={onOpenExecutiveBriefing}
                className="px-2.5 py-1.5 text-xs font-medium rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors inline-flex items-center"
                title="View synthesized executive grievance report"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Briefing
              </button>

              <button
                onClick={generateTemplateCsv}
                className="px-2.5 py-1.5 text-xs font-medium rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors inline-flex items-center"
                title="Download CSV template format"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Template
              </button>

              <button
                onClick={onResetToSamples}
                className="px-2.5 py-1.5 text-xs font-medium rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors inline-flex items-center"
                title="Reload clinical test cases"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reload Samples
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
