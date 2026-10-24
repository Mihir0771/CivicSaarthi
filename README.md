# CivicSaarthi — The Evidence-to-Action Civic Agent
> **Tagline:** One photo. One ticket. A clear trail.  
> **Hackathon Prototype:** Ahmedabad Municipal Corporation (AMC) Garbathon Edition

---

### Important Notice
**HACKATHON DEMO — MOCK AMC DATA — NO REAL COMPLAINT IS SUBMITTED.**  
This application interacts exclusively with a local mock AMC registry (`data/amc.json`). It does not transmit real civic complaints, post automatically to public social media, or invoke live municipal dispatch APIs.

---

## 🏛️ Architecture Overview

CivicSaarthi operates on an autonomous evidence-to-action agent loop:

1. **Multimodal Evidence Assessment (`analyze_civic_image`)**:
   - Inspects citizen-captured photographs using **Gemini 3.8 Flash** with structured schema output (`responseMimeType: "application/json"`).
   - Classifies issues into: `pothole`, `garbage`, `streetlight`, `waterlogging`, `other`, or `uncertain`.
   - Computes estimated confidence score (0.0 to 1.0) and severity level (`low`, `medium`, `high`).
   - Enforces a **confidence gating threshold (0.70)**: if confidence is below 70% or the photo is ambiguous (e.g., an indoor room or blurry image), the agent halts automatic filing and requests user verification.

2. **Administrative Ward & Department Routing (`lookup_ward`, `lookup_department`)**:
   - Queries AMC administrative jurisdictions (Ward W12 Navrangpura / West Zone and Ward W27 Maninagar / South Zone).
   - Maps issue categories directly to municipal divisions:
     - *Pothole* ➔ Roads & Buildings
     - *Garbage* ➔ Solid Waste Management
     - *Streetlight* ➔ Light Department
     - *Waterlogging* ➔ Storm Water Drainage
   - **Interactive Leaflet Map Visualization**:
     - Embedded open-source Leaflet map powered by OpenStreetMap tiles.
     - Automatically animates to selected areas with a custom animated pin and tooltip.
     - Outlines the active Ward administrative boundary circle with zone color-coding (Teal for West Zone W12, Orange for South Zone W27).
     - Allows clicking quick area chips directly on the map interface.
   - Explains routing logic transparently (*"Why this route?"*).
   - Validates area names strictly: never hallucinates or arbitrarily assigns unverified wards.

3. **Distinctive Feature — Civic Memory (`find_duplicate_complaint`, `add_supporting_evidence`)**:
   - Checks the local mock AMC registry for existing active complaints in the same ward, area, and issue category.
   - Prevents duplicate ticket clutter by presenting two explicit citizen choices:
     - **Add Evidence to Existing Complaint**: Corroborates the active ticket, increments the evidence counter, and appends an audit event to its timeline.
     - **This is a Different Incident**: Creates a brand-new complaint.

4. **Verifiable Agent Activity Ledger**:
   - Live audit panel displaying every server-side agent tool call with duration in milliseconds, inputs, outputs, and execution status (`success` / `failed`).

5. **Simulated Lifecycle Controls & Civic Pulse**:
   - **Track Complaint**: Real-time status lookup with detailed action timeline.
   - **Demo Mode Controls**: Advance ticket state (`Submitted` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`) with instant database and timeline updates.
   - **Civic Pulse**: Live telemetry and civic hotspot analytics derived from `data/amc.json`.
   - **Bilingual Support**: Seamless English / ગુજરાતી toggle.

---

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start full-stack server with Vite in dev mode
npm run dev
# Listens on http://0.0.0.0:3000
```

---

## 🎬 Concise Demo Script for Judges

1. **Test 1 — File New Complaint**:
   - Select the **"Waste Pile (Maninagar)"** preset (or upload a custom image).
   - Watch Gemini 3.8 Flash analyze the image and classify it as `garbage` with high confidence.
   - Select area `Maninagar`.
   - Note the automatic routing: Ward **W27 (South Zone)** assigned to **Solid Waste Management**.
   - Click **"Confirm & File Mock AMC Ticket"**.
   - Note the generated sequential tracking ID (e.g. `AMC-2026-000124`).

2. **Test 2 — Civic Memory Corroboration**:
   - Go to "Report Issue", choose the **"Road Pothole"** preset and select area `Navrangpura`.
   - The **Civic Memory Alert** triggers because `AMC-2026-000123` is already active in Ward W12 (Navrangpura).
   - Click **"Add Evidence to Existing Complaint (Recommended)"**.
   - Track `AMC-2026-000123` to verify that evidence count increased to 2 and a new corroboration event was logged on the timeline!

3. **Test 3 — Confidence Gating**:
   - Select the **"Ambiguous Photo"** preset (indoor desk).
   - Gemini classifies it as `uncertain` or below threshold, triggering the warning banner and category override controls.

4. **Test 4 — Bilingual Interface**:
   - Click the language toggle button in the header to switch to **ગુજરાતી**.
   - Observe that all labels, categories, status explanations, and receipts translate smoothly while ticket IDs remain intact.

5. **Test 5 — Track & Simulated Status Progression**:
   - Search for `AMC-2026-000123`.
   - Use the **DEMO MODE CONTROL** panel to transition status to `In Progress` or `Resolved`.
   - Observe the live timeline update and refresh the page to confirm JSON database persistence.
