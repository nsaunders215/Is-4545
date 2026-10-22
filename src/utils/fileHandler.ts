import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ComplaintRecord } from '../types/triage';

export interface ParsedFileData {
  filename: string;
  headers: string[];
  rows: Record<string, any>[];
  detectedComplaintColumn: string;
  detectedIdColumn: string;
  detectedDateColumn: string;
  detectedDepartmentColumn: string;
  detectedSourceColumn: string;
}

export function parseFile(file: File): Promise<ParsedFileData> {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv') || fileName.endsWith('.tsv') || fileName.endsWith('.txt')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            reject(new Error('The uploaded CSV file is empty.'));
            return;
          }
          const rows = results.data as Record<string, any>[];
          const headers = results.meta.fields || Object.keys(rows[0] || {});
          const detected = detectColumns(headers);

          resolve({
            filename: file.name,
            headers,
            rows,
            ...detected,
          });
        },
        error: (err) => {
          reject(new Error(`Failed to parse CSV: ${err.message}`));
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            throw new Error('Workbook contains no sheets.');
          }
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            defval: '',
          });

          if (!json || json.length === 0) {
            throw new Error('The uploaded Excel sheet contains no data.');
          }

          const headers = Object.keys(json[0] || {});
          const detected = detectColumns(headers);

          resolve({
            filename: file.name,
            headers,
            rows: json,
            ...detected,
          });
        } catch (err: any) {
          reject(new Error(`Failed to parse Excel file: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.'));
    }
  });
}

function detectColumns(headers: string[]) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  let complaintCol = '';
  let idCol = '';
  let dateCol = '';
  let deptCol = '';
  let sourceCol = '';

  for (const h of headers) {
    const n = norm(h);
    if (!complaintCol && (n.includes('complaint') || n.includes('feedback') || n.includes('message') || n.includes('text') || n.includes('comment') || n.includes('grievance') || n.includes('description') || n.includes('issue') || n.includes('content'))) {
      complaintCol = h;
    }
    if (!idCol && (n.includes('patientid') || n.includes('caseid') || n.includes('grievanceid') || n.includes('recordid') || n === 'id' || n.includes('ref'))) {
      idCol = h;
    }
    if (!dateCol && (n.includes('date') || n.includes('received') || n.includes('time') || n.includes('created'))) {
      dateCol = h;
    }
    if (!deptCol && (n.includes('department') || n.includes('unit') || n.includes('clinic') || n.includes('specialty') || n.includes('location'))) {
      deptCol = h;
    }
    if (!sourceCol && (n.includes('source') || n.includes('channel') || n.includes('origin') || n.includes('type') || n.includes('method'))) {
      sourceCol = h;
    }
  }

  // Fallbacks if not detected
  if (!complaintCol && headers.length > 0) {
    // pick the column with the highest average length if possible, or fallback to index 0/1
    complaintCol = headers.find(h => !idCol && !dateCol) || headers[0];
  }

  return {
    detectedComplaintColumn: complaintCol,
    detectedIdColumn: idCol || (headers[0] !== complaintCol ? headers[0] : ''),
    detectedDateColumn: dateCol,
    detectedDepartmentColumn: deptCol,
    detectedSourceColumn: sourceCol,
  };
}

export function convertRowsToComplaints(
  rows: Record<string, any>[],
  mapping: {
    complaintCol: string;
    idCol?: string;
    dateCol?: string;
    deptCol?: string;
    sourceCol?: string;
  }
): ComplaintRecord[] {
  return rows.map((row, idx) => {
    const rawText = String(row[mapping.complaintCol] || '').trim();
    const idVal = mapping.idCol && row[mapping.idCol] ? String(row[mapping.idCol]) : `REC-${String(idx + 1).padStart(4, '0')}`;
    const dateVal = mapping.dateCol && row[mapping.dateCol] ? String(row[mapping.dateCol]) : new Date().toISOString().split('T')[0];
    const deptVal = mapping.deptCol && row[mapping.deptCol] ? String(row[mapping.deptCol]) : 'General';
    const sourceVal = mapping.sourceCol && row[mapping.sourceCol] ? String(row[mapping.sourceCol]) : 'Uploaded File';

    return {
      id: idVal,
      patientId: idVal,
      source: sourceVal,
      dateReceived: dateVal,
      department: deptVal,
      complaintText: rawText || '(Empty message text)',
      triaged: false,
    };
  });
}

export function exportTriagedDataToCsv(records: ComplaintRecord[], filename = 'triaged_healthcare_complaints.csv') {
  const exportRows = records.map((r) => {
    const t = r.triage;
    return {
      'Complaint ID': r.id,
      'Patient ID': r.patientId || '',
      'Date Received': r.dateReceived,
      'Department / Unit': r.department || '',
      'Source / Channel': r.source,
      'Original Complaint Text': r.complaintText,
      'Triaged Status': r.triaged ? 'Triaged' : 'Untriaged',
      'Step 1 - Primary Category': t?.primaryCategory || '',
      'Step 1 - Secondary Categories': t?.secondaryCategories?.join('; ') || '',
      'Step 2 - Severity Level': t?.severityLevel || '',
      'Step 2 - Severity Number': t?.severityLevelNumber || '',
      'Step 2 - Severity Justification': t?.severityJustification || '',
      'Step 3 - Risk Flags': t?.riskFlags?.map((f) => `${f.riskType}: ${f.explanation}`).join(' | ') || '',
      'Step 4 - Recommended Department': t?.recommendedDepartment || '',
      'Step 4 - Escalation Priority': t?.escalationPriority || '',
      'Step 5 - Human Review Status': t?.humanReviewStatus || '',
      'Step 5 - Human Review Reason': t?.humanReviewReason || '',
      'Step 6 - Executive Summary': t?.executiveSummary || '',
      'Auditor Status': t?.humanAuditStatus || 'Pending',
      'Auditor Notes': t?.humanAuditorNotes || '',
      'Triaged At': t?.triagedAt || '',
    };
  });

  const csv = Papa.unparse(exportRows);
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportTriagedDataToExcel(records: ComplaintRecord[], filename = 'triaged_healthcare_complaints.xlsx') {
  const exportRows = records.map((r) => {
    const t = r.triage;
    return {
      'Complaint ID': r.id,
      'Patient ID': r.patientId || '',
      'Date Received': r.dateReceived,
      'Department': r.department || '',
      'Source': r.source,
      'Original Complaint Text': r.complaintText,
      'Primary Category': t?.primaryCategory || '',
      'Secondary Categories': t?.secondaryCategories?.join('; ') || '',
      'Severity Level': t?.severityLevel || '',
      'Severity Justification': t?.severityJustification || '',
      'Risk Flags': t?.riskFlags?.map((f) => `[${f.riskType}] ${f.explanation}`).join(' \n') || '',
      'Recommended Department': t?.recommendedDepartment || '',
      'Escalation Priority': t?.escalationPriority || '',
      'Human Review Status': t?.humanReviewStatus || '',
      'Executive Summary': t?.executiveSummary || '',
      'Auditor Status': t?.humanAuditStatus || 'Pending',
      'Reviewed By': t?.reviewedBy || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Triage Results');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateTemplateCsv(): void {
  const templateData = [
    {
      Case_ID: 'CAS-1001',
      Patient_ID: 'PT-20491',
      Date: '2026-10-21',
      Department: 'Emergency Department',
      Source: 'Patient Portal',
      Complaint_Text:
        'Patient given adult dosage of pediatric antibiotic; experienced skin hives and facial swelling. Pharmacy called and verified dispensing error.',
    },
    {
      Case_ID: 'CAS-1002',
      Patient_ID: 'PT-89410',
      Date: '2026-10-21',
      Department: 'Billing & Patient Accounts',
      Source: 'Grievance Form',
      Complaint_Text:
        'Received an unexpected $1,800 anesthesia bill for an in-network knee arthroscopy with no advance disclosure.',
    },
    {
      Case_ID: 'CAS-1003',
      Patient_ID: 'PT-33019',
      Date: '2026-10-20',
      Department: 'Outpatient Clinic',
      Source: 'Survey Comment',
      Complaint_Text:
        'Waited 50 minutes in the sub-waiting area past my scheduled appointment time without any communication or water.',
    },
    {
      Case_ID: 'CAS-1004',
      Patient_ID: 'PT-77122',
      Date: '2026-10-20',
      Department: 'Medical Records',
      Source: 'Email Grievance',
      Complaint_Text:
        'Medical assistant verbally refused sign language interpreter for a deaf patient during pre-op consult, insisting family member translate.',
    },
  ];

  const csv = Papa.unparse(templateData);
  downloadBlob(csv, 'healthcare_complaint_template.csv', 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
