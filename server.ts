import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_PATH = path.resolve(process.cwd(), 'data/amc.json');

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed data template
const SEED_DATA = {
  wards: [
    {
      id: 'W12',
      name: 'Navrangpura',
      zone: 'West',
      areas: ['Navrangpura', 'Stadium', 'CG Road'],
    },
    {
      id: 'W27',
      name: 'Maninagar',
      zone: 'South',
      areas: ['Maninagar', 'Kankaria', 'Jawahar Chowk'],
    },
  ],
  departments: {
    pothole: 'Roads & Buildings',
    garbage: 'Solid Waste Management',
    streetlight: 'Light Department',
    waterlogging: 'Storm Water Drainage',
  },
  complaints: [
    {
      trackingId: 'AMC-2026-000123',
      ward: 'W12',
      issue: 'pothole',
      status: 'Assigned',
      filedAt: '2026-10-24T17:20:00+05:30',
      updatedAt: '2026-10-24T17:25:00+05:30',
      area: 'Navrangpura',
      department: 'Roads & Buildings',
      description: 'Seeded demo complaint',
      severity: 'medium',
      evidenceSummary: 'Depression on road surface approximately 2 feet wide near Commerce Six Roads junction.',
      evidenceCount: 1,
      timeline: [
        {
          timestamp: '2026-10-24T17:20:00+05:30',
          status: 'Submitted',
          actor: 'Citizen (Mobile App)',
          note: 'Initial evidence submitted with photo and GPS location.',
        },
        {
          timestamp: '2026-10-24T17:25:00+05:30',
          status: 'Assigned',
          actor: 'AMC Automated Triage Engine',
          note: 'Assigned to Roads & Buildings Division (West Zone - W12).',
        },
      ],
    },
  ],
};

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
      return SEED_DATA;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading mock AMC DB:', err);
    return SEED_DATA;
  }
}

function writeDb(data: any) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing mock AMC DB:', err);
    throw new Error('Failed to persist to mock AMC database');
  }
}

// Ensure DB is seeded at startup
readDb();

// ----------------------------------------------------
// Agent Tool A: analyze_civic_image(image)
// ----------------------------------------------------
async function analyzeCivicImage(imageBase64: string, mimeType: string = 'image/jpeg') {
  const startTime = Date.now();
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Server Gemini API key is missing. Please configure GEMINI_API_KEY in server environment.');
  }

  // Remove potential data URL prefix
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  const prompt = `You are CivicSaarthi's visual civic assessment agent for the Ahmedabad Municipal Corporation (AMC).
Analyze this uploaded photograph of a municipal infrastructure problem.

Required outputs:
1. issue: Classify strictly into one of: 'pothole', 'garbage', 'streetlight', 'waterlogging', 'other', or 'uncertain'.
   - 'pothole': potholes, broken road pavement, asphalt craters.
   - 'garbage': open garbage dumps, overflowing waste bins, litter piles on street.
   - 'streetlight': dark or damaged lamp posts, hanging streetlights, non-functional light fixtures.
   - 'waterlogging': standing rain water, submerged roads, choked open gutter/storm drains.
   - 'other': other valid public civic issues (e.g., fallen tree, broken divider, open manhole).
   - 'uncertain': if the photo does not clearly show an outdoor civic problem (e.g. an indoor room, pet, food, selfie, blur, or unrelated object).
2. confidence: Number between 0.0 and 1.0 representing classification confidence.
3. severity: 'low', 'medium', or 'high'.
4. description: A concise 1-2 sentence factual description of the observed scene.
5. evidenceSummary: Concrete visible details (e.g. "Approximately 1.5m pothole in asphalt surface", "Uncollected plastic waste bags beside road boundary").
6. imageQuality: 'good', 'blurry', 'low_light', or 'obscured'.
7. needsConfirmation: Set to true if confidence < 0.70, or issue is 'other', 'uncertain', or image is blurry/low_light.

Never state that visual assessment proves internal pipe bursts or electrical failure causes. Keep it strictly descriptive.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          issue: {
            type: Type.STRING,
            description: "Must be one of: pothole, garbage, streetlight, waterlogging, other, uncertain",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0.0 and 1.0",
          },
          severity: {
            type: Type.STRING,
            description: "Must be one of: low, medium, high",
          },
          description: {
            type: Type.STRING,
            description: "Concise objective description of the visual scene",
          },
          evidenceSummary: {
            type: Type.STRING,
            description: "Observable evidence summary",
          },
          imageQuality: {
            type: Type.STRING,
            description: "Must be one of: good, blurry, low_light, obscured",
          },
          needsConfirmation: {
            type: Type.BOOLEAN,
            description: "Whether confirmation is required (confidence < 0.70 or ambiguous)",
          },
        },
        required: [
          'issue',
          'confidence',
          'severity',
          'description',
          'evidenceSummary',
          'imageQuality',
          'needsConfirmation',
        ],
      },
    },
  });

  const durationMs = Date.now() - startTime;
  const rawText = response.text || '{}';
  const parsed = JSON.parse(rawText);

  // Validate allowed categories
  const validIssues = ['pothole', 'garbage', 'streetlight', 'waterlogging', 'other', 'uncertain'];
  if (!validIssues.includes(parsed.issue)) {
    parsed.issue = 'uncertain';
    parsed.needsConfirmation = true;
  }

  // Enforce threshold
  if (parsed.confidence < 0.70 || parsed.issue === 'uncertain' || parsed.issue === 'other') {
    parsed.needsConfirmation = true;
  }

  return {
    result: parsed,
    durationMs,
  };
}

// ----------------------------------------------------
// Agent Tool B: lookup_ward(areaName)
// ----------------------------------------------------
function lookupWard(areaName: string) {
  const db = readDb();
  if (!areaName || typeof areaName !== 'string') {
    return {
      found: false,
      message: 'Area name is empty or invalid.',
    };
  }

  const normalized = areaName.trim().toLowerCase();

  for (const ward of db.wards) {
    // Check ward name
    if (ward.name.toLowerCase() === normalized || ward.id.toLowerCase() === normalized) {
      return {
        found: true,
        wardId: ward.id,
        wardName: ward.name,
        zone: ward.zone,
        matchedArea: ward.name,
      };
    }
    // Check areas in ward
    for (const a of ward.areas) {
      if (a.toLowerCase() === normalized || normalized.includes(a.toLowerCase()) || a.toLowerCase().includes(normalized)) {
        return {
          found: true,
          wardId: ward.id,
          wardName: ward.name,
          zone: ward.zone,
          matchedArea: a,
        };
      }
    }
  }

  return {
    found: false,
    message: `Area "${areaName}" not found in mock AMC ward database. CivicSaarthi does not invent or arbitrarily assign wards.`,
  };
}

// ----------------------------------------------------
// Agent Tool C: lookup_department(issue)
// ----------------------------------------------------
function lookupDepartment(issue: string): string {
  const db = readDb();
  const normalized = (issue || '').trim().toLowerCase();
  if (db.departments && db.departments[normalized]) {
    return db.departments[normalized];
  }
  return 'Citizen Grievance Cell (Manual Triage)';
}

// ----------------------------------------------------
// Agent Tool D: find_duplicate_complaint(issue, wardId, areaName)
// ----------------------------------------------------
function findDuplicateComplaint(issue: string, wardId: string, areaName: string) {
  const db = readDb();
  const normIssue = (issue || '').trim().toLowerCase();
  const normWard = (wardId || '').trim().toUpperCase();
  const normArea = (areaName || '').trim().toLowerCase();

  const openComplaints = (db.complaints || []).filter((c: any) => {
    const isClosed = c.status === 'Resolved' || c.status === 'Closed';
    if (isClosed) return false;
    const sameWard = (c.ward || '').toUpperCase() === normWard;
    const sameIssue = (c.issue || '').toLowerCase() === normIssue;
    const sameArea = (c.area || '').toLowerCase() === normArea;
    return sameWard && sameIssue && sameArea;
  });

  if (openComplaints.length > 0) {
    // Return the latest one
    return openComplaints[openComplaints.length - 1];
  }
  return null;
}

// ----------------------------------------------------
// Agent Tool E: create_complaint_ticket(validatedComplaint)
// ----------------------------------------------------
function createComplaintTicket(data: any) {
  const db = readDb();

  // Determine next sequential ID: pattern AMC-2026-000123
  let maxSeq = 123;
  for (const c of db.complaints || []) {
    const match = (c.trackingId || '').match(/AMC-2026-(\d+)/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const trackingId = `AMC-2026-${String(nextSeq).padStart(6, '0')}`;
  const nowIso = new Date().toISOString();

  const newTicket = {
    trackingId,
    ward: data.wardId,
    issue: data.issue,
    status: 'Submitted',
    filedAt: nowIso,
    updatedAt: nowIso,
    area: data.area,
    department: data.department,
    description: data.description || 'Citizen filed civic issue.',
    severity: data.severity || 'medium',
    evidenceSummary: data.evidenceSummary || 'Photographic evidence captured.',
    evidenceCount: 1,
    evidenceImages: data.imageData ? [data.imageData] : [],
    timeline: [
      {
        timestamp: nowIso,
        status: 'Submitted',
        actor: 'Citizen (CivicSaarthi Agent)',
        note: `Initial evidence verified and complaint submitted to ${data.department}.`,
      },
    ],
    isCorroboration: false,
  };

  db.complaints.push(newTicket);
  writeDb(db);

  return newTicket;
}

// ----------------------------------------------------
// Agent Tool F: get_complaint_status(trackingId)
// ----------------------------------------------------
function getComplaintStatus(trackingId: string) {
  const db = readDb();
  const normId = (trackingId || '').trim().toUpperCase();
  const ticket = (db.complaints || []).find((c: any) => (c.trackingId || '').toUpperCase() === normId);
  return ticket || null;
}

// ----------------------------------------------------
// Agent Tool G: add_supporting_evidence(existingTrackingId, evidence)
// ----------------------------------------------------
function addSupportingEvidence(trackingId: string, evidence: any) {
  const db = readDb();
  const normId = (trackingId || '').trim().toUpperCase();
  const index = (db.complaints || []).findIndex((c: any) => (c.trackingId || '').toUpperCase() === normId);

  if (index === -1) {
    throw new Error(`Cannot add evidence: Complaint ${trackingId} not found in database.`);
  }

  const complaint = db.complaints[index];
  const nowIso = new Date().toISOString();

  complaint.evidenceCount = (complaint.evidenceCount || 1) + 1;
  complaint.updatedAt = nowIso;
  if (evidence.imageData) {
    complaint.evidenceImages = complaint.evidenceImages || [];
    complaint.evidenceImages.push(evidence.imageData);
  }

  complaint.timeline.push({
    timestamp: nowIso,
    status: complaint.status,
    actor: 'Citizen Corroborator (Civic Memory)',
    note: `Corroborating photographic evidence added by citizen (${evidence.evidenceSummary || 'Visual verification'}). Total evidence count increased to ${complaint.evidenceCount}.`,
  });

  db.complaints[index] = complaint;
  writeDb(db);

  return complaint;
}

// ====================================================
// API Endpoints
// ====================================================

// 1. Analyze civic image
app.post('/api/agent/analyze-image', async (req, res) => {
  const callStart = Date.now();
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({
      error: 'Missing imageBase64 payload',
      ledgerEntry: {
        id: `tool-${Date.now()}`,
        toolName: 'analyze_civic_image',
        inputSummary: 'No image provided',
        outputSummary: 'Validation error: Missing image data',
        status: 'failed',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - callStart,
      },
    });
  }

  try {
    const { result, durationMs } = await analyzeCivicImage(imageBase64, mimeType || 'image/jpeg');

    const ledgerEntry = {
      id: `tool-${Date.now()}`,
      toolName: 'analyze_civic_image',
      inputSummary: `Image payload (${Math.round(imageBase64.length / 1024)} KB, ${mimeType || 'image/jpeg'})`,
      outputSummary: `Classified as "${result.issue}" (Confidence: ${(result.confidence * 100).toFixed(1)}%, Severity: ${result.severity}, Needs Confirmation: ${result.needsConfirmation})`,
      status: 'success',
      timestamp: new Date().toISOString(),
      durationMs,
      details: result,
    };

    return res.json({
      analysis: result,
      ledgerEntry,
    });
  } catch (error: any) {
    console.error('Gemini analysis error:', error);
    const durationMs = Date.now() - callStart;
    return res.status(500).json({
      error: error.message || 'Image analysis failed with Gemini AI',
      ledgerEntry: {
        id: `tool-${Date.now()}`,
        toolName: 'analyze_civic_image',
        inputSummary: `Image payload analysis attempt`,
        outputSummary: `Execution failed: ${error.message || 'Model API error'}`,
        status: 'failed',
        timestamp: new Date().toISOString(),
        durationMs,
      },
    });
  }
});

// 2. Resolve ward, department, and check Civic Memory duplicates
app.post('/api/agent/resolve-routing', (req, res) => {
  const callStart = Date.now();
  const { areaName, issue } = req.body;

  const ledgerEntries: any[] = [];

  // Step 1: lookup_ward
  const t1 = Date.now();
  const wardResult = lookupWard(areaName);
  ledgerEntries.push({
    id: `tool-${Date.now()}-1`,
    toolName: 'lookup_ward',
    inputSummary: `Area: "${areaName}"`,
    outputSummary: wardResult.found
      ? `Matched Ward ${wardResult.wardId} (${wardResult.wardName}, Zone: ${wardResult.zone})`
      : `Ward lookup failed: ${wardResult.message}`,
    status: wardResult.found ? 'success' : 'failed',
    timestamp: new Date().toISOString(),
    durationMs: Math.max(1, Date.now() - t1),
    details: wardResult,
  });

  // Step 2: lookup_department
  const t2 = Date.now();
  const department = lookupDepartment(issue);
  ledgerEntries.push({
    id: `tool-${Date.now()}-2`,
    toolName: 'lookup_department',
    inputSummary: `Issue: "${issue}"`,
    outputSummary: `Mapped to department: "${department}"`,
    status: 'success',
    timestamp: new Date().toISOString(),
    durationMs: Math.max(1, Date.now() - t2),
    details: { issue, department },
  });

  // Step 3: find_duplicate_complaint (Civic Memory)
  let duplicateComplaint = null;
  if (wardResult.found && wardResult.wardId && areaName) {
    const t3 = Date.now();
    duplicateComplaint = findDuplicateComplaint(issue, wardResult.wardId, areaName);
    ledgerEntries.push({
      id: `tool-${Date.now()}-3`,
      toolName: 'find_duplicate_complaint',
      inputSummary: `Issue: "${issue}", Ward: "${wardResult.wardId}", Area: "${areaName}"`,
      outputSummary: duplicateComplaint
        ? `Potential duplicate found: ${duplicateComplaint.trackingId} (${duplicateComplaint.status})`
        : 'No existing active duplicate complaints found in this ward & area',
      status: 'success',
      timestamp: new Date().toISOString(),
      durationMs: Math.max(1, Date.now() - t3),
      details: duplicateComplaint ? { matchedId: duplicateComplaint.trackingId } : null,
    });
  }

  return res.json({
    ward: wardResult,
    department,
    duplicateComplaint,
    ledgerEntries,
  });
});

// 3. Create ticket
app.post('/api/agent/create-ticket', (req, res) => {
  const callStart = Date.now();
  const { wardId, issue, area, department, description, severity, evidenceSummary, imageData } = req.body;

  // Validation
  if (!wardId || !issue || !area || !department) {
    return res.status(400).json({
      error: 'Missing required ticket fields (wardId, issue, area, department)',
      ledgerEntry: {
        id: `tool-${Date.now()}`,
        toolName: 'create_complaint_ticket',
        inputSummary: `Incomplete parameters`,
        outputSummary: 'Validation error: Rejected missing fields',
        status: 'failed',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - callStart,
      },
    });
  }

  try {
    const ticket = createComplaintTicket({
      wardId,
      issue,
      area,
      department,
      description,
      severity,
      evidenceSummary,
      imageData,
    });

    const ledgerEntry = {
      id: `tool-${Date.now()}`,
      toolName: 'create_complaint_ticket',
      inputSummary: `Issue: ${issue}, Ward: ${wardId}, Area: ${area}, Dept: ${department}`,
      outputSummary: `Ticket generated successfully: ${ticket.trackingId} (Initial Status: Submitted)`,
      status: 'success',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - callStart,
      details: { trackingId: ticket.trackingId },
    };

    return res.json({
      ticket,
      ledgerEntry,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Failed to create ticket',
      ledgerEntry: {
        id: `tool-${Date.now()}`,
        toolName: 'create_complaint_ticket',
        inputSummary: `Attempted ticket creation`,
        outputSummary: `Database write failure: ${err.message}`,
        status: 'failed',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - callStart,
      },
    });
  }
});

// 4. Corroborate existing ticket (Civic Memory action)
app.post('/api/agent/add-evidence', (req, res) => {
  const callStart = Date.now();
  const { trackingId, evidenceSummary, imageData } = req.body;

  if (!trackingId) {
    return res.status(400).json({ error: 'Missing trackingId' });
  }

  try {
    const updated = addSupportingEvidence(trackingId, { evidenceSummary, imageData });

    const ledgerEntry = {
      id: `tool-${Date.now()}`,
      toolName: 'add_supporting_evidence',
      inputSummary: `Tracking ID: ${trackingId}, Corroboration proof attached`,
      outputSummary: `Updated complaint ${trackingId}. Evidence count is now ${updated.evidenceCount}.`,
      status: 'success',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - callStart,
      details: { trackingId, newEvidenceCount: updated.evidenceCount },
    };

    return res.json({
      ticket: updated,
      ledgerEntry,
    });
  } catch (err: any) {
    return res.status(404).json({
      error: err.message,
      ledgerEntry: {
        id: `tool-${Date.now()}`,
        toolName: 'add_supporting_evidence',
        inputSummary: `Tracking ID: ${trackingId}`,
        outputSummary: `Error: ${err.message}`,
        status: 'failed',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - callStart,
      },
    });
  }
});

// 5. Track complaint status
app.get('/api/agent/track/:trackingId', (req, res) => {
  const callStart = Date.now();
  const trackingId = req.params.trackingId;

  const ticket = getComplaintStatus(trackingId);

  const ledgerEntry = {
    id: `tool-${Date.now()}`,
    toolName: 'get_complaint_status',
    inputSummary: `Query trackingId: "${trackingId}"`,
    outputSummary: ticket
      ? `Record located: Status is "${ticket.status}", Ward: ${ticket.ward}, Dept: ${ticket.department}`
      : `No ticket found matching ID "${trackingId}" in mock AMC registry`,
    status: ticket ? 'success' : 'failed',
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - callStart,
    details: ticket ? { status: ticket.status, ward: ticket.ward } : null,
  };

  if (!ticket) {
    return res.status(404).json({
      error: `Complaint with tracking ID "${trackingId}" was not found.`,
      ledgerEntry,
    });
  }

  return res.json({
    ticket,
    ledgerEntry,
  });
});

// 6. Civic Pulse analytics
app.get('/api/agent/pulse', (req, res) => {
  const db = readDb();
  const complaints = db.complaints || [];

  const byIssue: Record<string, number> = {
    pothole: 0,
    garbage: 0,
    streetlight: 0,
    waterlogging: 0,
    other: 0,
  };

  const byWard: Record<string, number> = {};
  const byStatus: Record<string, number> = {
    Submitted: 0,
    Assigned: 0,
    'In Progress': 0,
    Resolved: 0,
    Closed: 0,
  };

  const areaCounts: Record<string, { count: number; ward: string; issues: Record<string, number> }> = {};

  for (const c of complaints) {
    // By issue
    const iss = (c.issue || 'other').toLowerCase();
    byIssue[iss] = (byIssue[iss] || 0) + 1;

    // By ward
    const w = c.ward || 'Unknown';
    byWard[w] = (byWard[w] || 0) + 1;

    // By status
    const st = c.status || 'Submitted';
    byStatus[st] = (byStatus[st] || 0) + 1;

    // Area hotspots
    const ar = c.area || 'Unknown';
    if (!areaCounts[ar]) {
      areaCounts[ar] = { count: 0, ward: w, issues: {} };
    }
    areaCounts[ar].count += 1 + (c.evidenceCount ? c.evidenceCount - 1 : 0);
    areaCounts[ar].issues[iss] = (areaCounts[ar].issues[iss] || 0) + 1;
  }

  const hotspots = Object.keys(areaCounts).map((area) => {
    const item = areaCounts[area];
    let topIssue = 'civic defect';
    let maxIssCount = 0;
    for (const [k, v] of Object.entries(item.issues)) {
      if (v > maxIssCount) {
        maxIssCount = v;
        topIssue = k;
      }
    }
    return {
      area,
      ward: item.ward,
      count: item.count,
      primaryIssue: topIssue,
    };
  }).sort((a, b) => b.count - a.count);

  return res.json({
    totalComplaints: complaints.length,
    byIssue,
    byWard,
    byStatus,
    recentComplaints: complaints.slice(-6).reverse(),
    hotspots: hotspots.slice(0, 5),
  });
});

// 7. DEMO MODE: Update complaint status
app.post('/api/agent/demo-status-update', (req, res) => {
  const { trackingId, newStatus } = req.body;
  const db = readDb();
  const normId = (trackingId || '').trim().toUpperCase();
  const index = (db.complaints || []).findIndex((c: any) => (c.trackingId || '').toUpperCase() === normId);

  if (index === -1) {
    return res.status(404).json({ error: `Complaint ${trackingId} not found.` });
  }

  const complaint = db.complaints[index];
  const nowIso = new Date().toISOString();
  complaint.status = newStatus;
  complaint.updatedAt = nowIso;
  complaint.timeline.push({
    timestamp: nowIso,
    status: newStatus,
    actor: 'AMC Zonal Engineering Supervisor (Simulated Demo Action)',
    note: `Work order transitioned to "${newStatus}" in AMC municipal work tracker.`,
  });

  db.complaints[index] = complaint;
  writeDb(db);

  return res.json({
    ticket: complaint,
    message: `Status successfully updated to "${newStatus}" in mock AMC database.`,
  });
});

// 8. Reset mock database to clean seed state
app.post('/api/agent/reset-seed', (req, res) => {
  writeDb(SEED_DATA);
  return res.json({ message: 'Mock AMC database reset to initial seeded records.' });
});

// ----------------------------------------------------
// Setup Vite in Dev or Static files in Production
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicSaarthi server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
