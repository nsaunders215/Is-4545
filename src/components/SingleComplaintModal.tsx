import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Stethoscope,
  Send,
  Loader2,
  FileText,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { triageWithGemini } from '../utils/triageEngine';
import { ComplaintRecord, TriageResult } from '../types/triage';

interface SingleComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: ComplaintRecord) => void;
}

const PRESET_SCENARIOS = [
  {
    title: 'Medication Dosing Error',
    source: 'Patient Portal Message',
    dept: 'Cardiology',
    text: 'Doctor sent prescription for 100mg instead of 10mg. Patient experienced dizziness and fell in the bathroom. Called triage line twice with no response.',
  },
  {
    title: 'No Surprises Act Billing Dispute',
    source: 'Grievance Report',
    dept: 'Billing',
    text: 'Received an unexpected $2,800 out-of-network balance bill for an emergency appendix surgery at an in-network hospital. Billing agent refused to discuss the No Surprises Act and threatened collections.',
  },
  {
    title: 'Civil Rights / Language Access',
    source: 'Patient Portal Message',
    dept: 'Radiology',
    text: 'Clinic refused to provide a certified Spanish interpreter for an elderly oncology patient, forcing the minor grandchild to translate cancer biopsy results.',
  },
  {
    title: 'HIPAA Record Breach',
    source: 'Patient Portal Message',
    dept: 'Health Informatics',
    text: 'Another patient’s complete psychiatric treatment notes and full contact information were attached to my patient portal account today.',
  },
  {
    title: 'Routine Wait Time Concern',
    source: 'Survey Comment',
    dept: 'Outpatient Clinic',
    text: 'Waited 45 minutes past my scheduled appointment time in exam room 3 without any check-in or apology from clinical staff.',
  },
];

export const SingleComplaintModal: React.FC<SingleComplaintModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
}) => {
  const [complaintText, setComplaintText] = useState('');
  const [patientId, setPatientId] = useState('');
  const [source, setSource] = useState('Patient Portal Message');
  const [department, setDepartment] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setComplaintText(preset.text);
    setSource(preset.source);
    setDepartment(preset.dept);
    setPatientId(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      setError('Please provide the complaint or grievance text.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const generatedId = patientId ? `CAS-${patientId.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}` : `CAS-${Math.floor(1000 + Math.random() * 9000)}`;

      const triageResult: TriageResult = await triageWithGemini(complaintText, {
        patientId,
        source,
        department,
      });

      const newRecord: ComplaintRecord = {
        id: generatedId,
        patientId: patientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
        source,
        dateReceived: new Date().toISOString().split('T')[0],
        department: department || 'General',
        complaintText,
        triaged: true,
        triage: triageResult,
      };

      onSaveRecord(newRecord);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Triage analysis failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-teal-600/30 text-teal-300">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Triage Single Healthcare Complaint</h3>
              <p className="text-xs text-slate-300">
                Input any patient portal message, grievance report, survey comment, or review
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2.5 text-rose-800 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Quick-load test scenario:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SCENARIOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-slate-200 text-slate-700 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Patient ID / Case Ref #
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. PT-89104"
                className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Channel / Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-xs rounded-md border border-slate-300 bg-white px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
              >
                <option value="Patient Portal Message">Patient Portal Message</option>
                <option value="Grievance Report">Grievance Report</option>
                <option value="Survey Comment">Survey Comment</option>
                <option value="Online Review">Online Review</option>
                <option value="Feedback Submission">Feedback Submission</option>
                <option value="Patient Hotline">Patient Hotline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Department / Unit
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cardiology, Surgery, ER"
                className="w-full text-xs rounded-md border border-slate-300 px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Complaint Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Patient Complaint / Grievance Text <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {complaintText.length} characters
              </span>
            </div>
            <textarea
              rows={5}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Paste patient grievance, survey feedback, portal message, or incident description..."
              className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed font-sans text-slate-800"
              required
            />
          </div>

          {/* AI Clinical Triage Protocol Reminder */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800 flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
              Automated 6-Step Triage Execution:
            </p>
            <p>
              1. Categorization &bull; 2. Severity (L1-L4) &bull; 3. Risk Flagging &bull; 4. Department Routing &bull; 5. Human Review Status &bull; 6. Executive Summary
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !complaintText.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Triaging Incident...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Run AI Triage
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
