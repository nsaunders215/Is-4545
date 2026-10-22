import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Table,
  ArrowRight,
  Download,
  FolderOpen,
} from 'lucide-react';
import {
  parseFile,
  convertRowsToComplaints,
  generateTemplateCsv,
  ParsedFileData,
} from '../utils/fileHandler';
import { ComplaintRecord } from '../types/triage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: ComplaintRecord[], shouldAutoTriage: boolean) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Column mappings
  const [complaintCol, setComplaintCol] = useState('');
  const [idCol, setIdCol] = useState('');
  const [dateCol, setDateCol] = useState('');
  const [deptCol, setDeptCol] = useState('');
  const [sourceCol, setSourceCol] = useState('');

  const [autoTriageAfterLoad, setAutoTriageAfterLoad] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setIsParsing(true);

    try {
      const data = await parseFile(selectedFile);
      setParsedData(data);
      setComplaintCol(data.detectedComplaintColumn);
      setIdCol(data.detectedIdColumn);
      setDateCol(data.detectedDateColumn);
      setDeptCol(data.detectedDepartmentColumn);
      setSourceCol(data.detectedSourceColumn);
    } catch (err: any) {
      setError(err.message || 'Failed to read file.');
      setParsedData(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (!parsedData || !complaintCol) {
      setError('Please select which column contains the complaint or grievance text.');
      return;
    }

    const records = convertRowsToComplaints(parsedData.rows, {
      complaintCol,
      idCol,
      dateCol,
      deptCol,
      sourceCol,
    });

    onDataLoaded(records, autoTriageAfterLoad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-teal-600/30 text-teal-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Upload Complaint Data Source</h3>
              <p className="text-xs text-slate-300">
                Import CSV or Excel (.xlsx, .xls) patient grievances and survey feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          {!parsedData && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-8 text-center bg-slate-50 hover:bg-teal-50/30 transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .tsv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click or drag & drop CSV or Excel file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports .csv, .xlsx, and .xls files from patient portals, grievances, or surveys
              </p>

              <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-center space-x-4 text-xs text-slate-600">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    generateTemplateCsv();
                  }}
                  className="text-teal-700 hover:text-teal-800 font-medium inline-flex items-center hover:underline"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download sample CSV template
                </button>
              </div>
            </div>
          )}

          {/* Parsed File Preview & Column Mapping */}
          {parsedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs font-semibold text-teal-900">
                      {parsedData.filename}
                    </p>
                    <p className="text-[11px] text-teal-700">
                      Successfully loaded {parsedData.rows.length} rows and {parsedData.headers.length} columns
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setParsedData(null);
                    setFile(null);
                  }}
                  className="text-xs text-teal-800 hover:text-teal-950 font-medium underline"
                >
                  Change file
                </button>
              </div>

              {/* Column Mapping Section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center">
                  <Table className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                  Map File Columns
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Complaint / Grievance Text <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={complaintCol}
                      onChange={(e) => setComplaintCol(e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">-- Select Complaint Column --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Case / Patient ID (Optional)
                    </label>
                    <select
                      value={idCol}
                      onChange={(e) => setIdCol(e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">-- Auto-generate ID --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department / Clinic (Optional)
                    </label>
                    <select
                      value={deptCol}
                      onChange={(e) => setDeptCol(e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">-- Default to General --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Source / Channel (Optional)
                    </label>
                    <select
                      value={sourceCol}
                      onChange={(e) => setSourceCol(e.target.value)}
                      className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">-- Default to Uploaded File --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-slate-500 mb-1.5">
                    Preview of first 2 rows:
                  </p>
                  <div className="border border-slate-200 rounded bg-white max-h-36 overflow-auto text-[11px]">
                    <table className="w-full divide-y divide-slate-200">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          {parsedData.headers.slice(0, 5).map((h) => (
                            <th key={h} className="px-2 py-1 text-left font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedData.rows.slice(0, 2).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            {parsedData.headers.slice(0, 5).map((h) => (
                              <td key={h} className="px-2 py-1 truncate max-w-xs text-slate-700">
                                {String(r[h] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Auto Triage toggle */}
                <div className="pt-2 flex items-center space-x-2">
                  <input
                    id="autoTriage"
                    type="checkbox"
                    checked={autoTriageAfterLoad}
                    onChange={(e) => setAutoTriageAfterLoad(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="autoTriage" className="text-xs text-slate-700 cursor-pointer">
                    Automatically run AI Triage on all imported records
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          {parsedData && (
            <button
              onClick={handleConfirm}
              disabled={!complaintCol || isParsing}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center shadow-sm"
            >
              <span>{autoTriageAfterLoad ? 'Import & Run Triage' : 'Import Records'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
