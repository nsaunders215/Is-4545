import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_PROMPT = `You are a Healthcare Complaint Triage Assistant.
Your purpose is to help healthcare organizations review, prioritize, and route patient complaints efficiently while maintaining patient safety, fairness, compliance, and appropriate human oversight.
You receive patient complaints, patient portal messages, survey comments, grievance reports, online reviews, or feedback submissions.

Your role is NOT to resolve complaints.
Your role is to triage complaints and determine:
1. What happened
2. How serious it is
3. Who should review it
4. How quickly it should be addressed
5. Whether human intervention is required

For every complaint, complete these 6 steps strictly:

STEP 1: Complaint Category
Classify into ONE primary category from this exact list:
- Communication
- Scheduling
- Wait Time
- Technology / Patient Portal
- Billing
- Clinical Care
- Discharge and Follow-Up
- Accessibility and Equity
- Patient Safety
- Privacy or Security
- Staff Conduct
- Other
If multiple categories are present, identify the primary category and list any secondary categories (from the same list).

STEP 2: Severity Assessment
Assign a severity level:
- LEVEL 1 - Low (Minor inconvenience, routine dissatisfaction, general suggestion)
- LEVEL 2 - Moderate (Repeated service failures, significant frustration, communication breakdown)
- LEVEL 3 - High (Potential patient harm, medication-related concern, serious accessibility issue, escalated complaint)
- LEVEL 4 - Critical (Immediate patient safety risk, potential legal exposure, serious privacy violation, discrimination allegation)
Provide explicit clinical or operational reasoning for the assigned severity.

STEP 3: Risk Detection
Identify applicable risks from:
- Patient Safety Risk
- Clinical Risk
- Compliance Risk
- Privacy Risk
- Accessibility Risk
- Equity Risk
- Reputational Risk
- Operational Risk
For each flagged risk, explain WHY it was flagged based on facts in the text.

STEP 4: Escalation Recommendation
ROUTE TO one primary department from:
- Patient Experience Team
- Nursing Leadership
- Physician Leadership
- Quality Improvement Team
- Compliance Office
- Information Technology
- Revenue Cycle / Billing
- Accessibility Coordinator
- Risk Management
- Executive Review

Indicate Escalation Priority:
- Routine
- Priority
- Immediate

STEP 5: Human Review Requirement
Determine status:
- AI Review Only
- Human Review Recommended
- Human Review Required

*Human Review Required* MUST be selected whenever:
- Patient safety concerns exist
- Discrimination is alleged
- Privacy concerns exist
- Legal or compliance risks are present
- The complaint is ambiguous and requires investigation

STEP 6: Executive Summary
Create a concise 2-3 sentence executive summary containing:
- Complaint category
- Severity level
- Major risk
- Recommended action

Always return accurate structured data adhering to schema.`;

const triageSchema = {
  type: Type.OBJECT,
  properties: {
    primaryCategory: {
      type: Type.STRING,
      description: "Primary category from the defined list",
    },
    secondaryCategories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any secondary categories",
    },
    severityLevel: {
      type: Type.STRING,
      description: "Must be: LEVEL 1 - Low, LEVEL 2 - Moderate, LEVEL 3 - High, or LEVEL 4 - Critical",
    },
    severityLevelNumber: {
      type: Type.INTEGER,
      description: "1, 2, 3, or 4",
    },
    severityJustification: {
      type: Type.STRING,
      description: "Reasoning for the assigned severity level",
    },
    riskFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          riskType: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["riskType", "explanation"],
      },
      description: "Flagged risks with explicit reasons",
    },
    recommendedDepartment: {
      type: Type.STRING,
      description: "Department from the defined list",
    },
    escalationPriority: {
      type: Type.STRING,
      description: "Must be Routine, Priority, or Immediate",
    },
    humanReviewStatus: {
      type: Type.STRING,
      description: "Must be 'AI Review Only', 'Human Review Recommended', or 'Human Review Required'",
    },
    humanReviewReason: {
      type: Type.STRING,
      description: "Why this review status was chosen",
    },
    executiveSummary: {
      type: Type.STRING,
      description: "Concise executive summary covering category, severity, major risk, and recommended action",
    },
    keyIncidentPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 bullet points summarizing what happened",
    },
  },
  required: [
    "primaryCategory",
    "secondaryCategories",
    "severityLevel",
    "severityLevelNumber",
    "severityJustification",
    "riskFlags",
    "recommendedDepartment",
    "escalationPriority",
    "humanReviewStatus",
    "executiveSummary",
  ],
};

app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({ status: 'ok', hasApiKey: hasKey });
});

// Single Complaint Triage
app.post('/api/triage/single', async (req: Request, res: Response): Promise<void> => {
  try {
    const { complaintText, source, patientId, department } = req.body;

    if (!complaintText || typeof complaintText !== 'string' || !complaintText.trim()) {
      res.status(400).json({ error: 'Complaint text is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please verify your environment or secrets configuration.',
      });
      return;
    }

    const prompt = `Please triage the following healthcare complaint submission:
Patient ID / Ref: ${patientId || 'Unspecified'}
Channel / Source: ${source || 'General Grievance'}
Original Unit / Department: ${department || 'Not specified'}

Complaint Content:
"""
${complaintText.trim()}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: triageSchema,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    res.json({
      success: true,
      result: parsed,
    });
  } catch (error: any) {
    console.error('Triage error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while evaluating the complaint.',
    });
  }
});

// Batch Complaint Triage (Up to 15 items per batch for reliability and speed)
app.post('/api/triage/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { complaints } = req.body;

    if (!Array.isArray(complaints) || complaints.length === 0) {
      res.status(400).json({ error: 'Array of complaints is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured.',
      });
      return;
    }

    // Limit batch size to 15 items max per request
    const batch = complaints.slice(0, 15);

    const batchSchema = {
      type: Type.OBJECT,
      properties: {
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              primaryCategory: { type: Type.STRING },
              secondaryCategories: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              severityLevel: { type: Type.STRING },
              severityLevelNumber: { type: Type.INTEGER },
              severityJustification: { type: Type.STRING },
              riskFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    riskType: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["riskType", "explanation"],
                },
              },
              recommendedDepartment: { type: Type.STRING },
              escalationPriority: { type: Type.STRING },
              humanReviewStatus: { type: Type.STRING },
              humanReviewReason: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              keyIncidentPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "id",
              "primaryCategory",
              "severityLevel",
              "severityLevelNumber",
              "severityJustification",
              "riskFlags",
              "recommendedDepartment",
              "escalationPriority",
              "humanReviewStatus",
              "executiveSummary",
            ],
          },
        },
      },
      required: ["results"],
    };

    const promptItems = batch.map((item, index) => {
      return `[Item ID: "${item.id || String(index + 1)}"]
Source/Channel: ${item.source || 'General'}
Department: ${item.department || 'General'}
Complaint: "${item.text.replace(/"/g, "'")}"`;
    }).join('\n\n');

    const prompt = `Please triage the following batch of ${batch.length} healthcare complaints according to all 6 clinical triage steps. Match the "id" field strictly to each Item ID provided:

${promptItems}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: batchSchema,
      },
    });

    const parsed = JSON.parse(response.text || '{"results": []}');
    res.json({
      success: true,
      results: parsed.results || [],
    });
  } catch (error: any) {
    console.error('Batch triage error:', error);
    res.status(500).json({
      error: error.message || 'Batch evaluation error occurred.',
    });
  }
});

// Setup dev server with Vite middlewares, or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Healthcare Complaint Triage Agent running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
