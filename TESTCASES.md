# 🧪 CivicSaarthi Mock AMC Agent Test Cases & Verification Suite

This document outlines the automated and mock verification test cases for **CivicSaarthi — The Evidence-to-Action Civic Agent**.

All test cases run against the isolated mock AMC store (`data/amc.json`) and the server-side agent orchestrator (`server.ts`).

---

## 🏃 Running the Automated Test Suite

To run all mock test cases locally:

```bash
npm run test:mock
```

Command executes: `tsx test/test-scenarios.ts` targeting `http://localhost:3000`.

---

## 📋 Test Matrix & Acceptance Scenarios

| Test ID | Scenario Description | Tool / Endpoint Under Test | Input Data | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Seeded Complaint Verification | `GET /api/agent/track/AMC-2026-000123` | Tracking ID: `AMC-2026-000123` | Initial status: `Assigned`, Ward: `W12`, Dept: `Roads & Buildings`, 2 timeline events | **PASSED** ✅ |
| **TC-02** | Ward & Department Routing | `POST /api/agent/resolve-routing` | Area: `"Navrangpura"`, Issue: `"garbage"` | Ward: `W12` (West Zone), Dept: `Solid Waste Management`, Ledger audit entries | **PASSED** ✅ |
| **TC-03** | Unsupported Area Protection | `POST /api/agent/resolve-routing` | Area: `"MarsColony"`, Issue: `"pothole"` | `found: false`, No arbitrary ward assigned, Ledger logs tool failure | **PASSED** ✅ |
| **TC-04** | Non-Existent Ticket 404 Integrity | `GET /api/agent/track/AMC-9999-999999` | Tracking ID: `AMC-9999-999999` | HTTP 404, No invented status, Ledger logs failed query | **PASSED** ✅ |
| **TC-05** | Sequential Ticket Creation | `POST /api/agent/create-ticket` | Ward: `W27`, Area: `"Maninagar"`, Issue: `"garbage"` | Returns `AMC-2026-000124` (sequential +1), initial status: `Submitted` | **PASSED** ✅ |
| **TC-06** | Database File Persistence | `GET /api/agent/track/AMC-2026-000124` | Created tracking ID | Successfully retrieved from `data/amc.json` after file write | **PASSED** ✅ |
| **TC-07** | Civic Memory Duplicate Detection | `POST /api/agent/resolve-routing` | Area: `"Navrangpura"`, Issue: `"pothole"` | Detects existing active ticket `AMC-2026-000123` | **PASSED** ✅ |
| **TC-08** | Civic Memory Corroboration | `POST /api/agent/add-evidence` | Ticket: `AMC-2026-000123`, Proof summary | `evidenceCount` increases to 2, Corroboration timeline entry logged | **PASSED** ✅ |
| **TC-09** | Malformed Request Protection | `POST /api/agent/create-ticket` | Incomplete payload `{ issue: "garbage" }` | HTTP 400 Bad Request, Rejected missing fields, Ledger records failure | **PASSED** ✅ |
| **TC-10** | Simulated Demo Status Progression | `POST /api/agent/demo-status-update` | Ticket: `AMC-2026-000124`, `newStatus: "In Progress"` | Status updated to `In Progress`, audit log appended to timeline | **PASSED** ✅ |
| **TC-11** | Civic Pulse Analytics Telemetry | `GET /api/agent/pulse` | None | Accurate aggregated count, breakdown by ward/category, hotspot ranking | **PASSED** ✅ |

---

## 🔍 Detailed Test Descriptions & Assertions

### TC-01: Seeded Starter Complaint Verification
- **Goal:** Verify that the starter record `AMC-2026-000123` is present in the mock database with the exact attributes mandated by the AMC specification.
- **Assertion:**
  - `ticket.status === "Assigned"`
  - `ticket.ward === "W12"`
  - `ticket.department === "Roads & Buildings"`
  - `ticket.timeline.length >= 2`

### TC-02: Ward & Department Routing Matrix
- **Goal:** Verify that `lookup_ward` and `lookup_department` accurately resolve supported AMC administrative boundaries.
- **Input:** Area `"Navrangpura"`, Issue `"garbage"`
- **Assertion:**
  - Ward resolved: `W12` (Navrangpura, West Zone)
  - Department mapped: `Solid Waste Management`
  - Real-time ledger entries recorded for both tool invocations.

### TC-03: Unsupported Area Protection
- **Goal:** Ensure the agent never hallucinates or silently defaults unknown areas to W12 or W27.
- **Input:** Area `"MarsColony"`
- **Assertion:**
  - `ward.found === false`
  - Error message: `"Area 'MarsColony' not found in mock AMC ward database. CivicSaarthi does not invent or arbitrarily assign wards."`
  - Tool execution ledger status logged as `failed`.

### TC-04: Non-Existent Tracking ID Verification
- **Goal:** Confirm the system returns a truthful 404 response rather than fabricating a simulated status.
- **Input:** `AMC-9999-999999`
- **Assertion:**
  - HTTP 404 Not Found
  - Response contains clear error notice.

### TC-05: Sequential Ticket ID Pattern
- **Goal:** Guarantee new complaints receive sequential, non-hardcoded IDs matching `AMC-2026-XXXXXX`.
- **Assertion:**
  - Next tracking ID calculated dynamically from highest recorded number (e.g. `AMC-2026-000123` ➔ `AMC-2026-000124`).
  - Initial status strictly set to `Submitted`.

### TC-06: Database Persistence
- **Goal:** Confirm local JSON persistence across requests.
- **Assertion:**
  - Immediately following ticket creation, a clean `GET /api/agent/track/:id` retrieves the persisted record from disk.

### TC-07 & TC-08: Civic Memory & Corroboration
- **Goal:** Detect existing open complaints in the same ward, area, and category; offer corroboration instead of duplicate filing.
- **Assertion:**
  - Resolving routing for `Navrangpura` + `pothole` flags `AMC-2026-000123`.
  - Calling `add-evidence` updates `evidenceCount` from 1 to 2 and logs a `"Citizen Corroborator (Civic Memory)"` timeline entry.

### TC-09: Failure Recovery & Ledger Truthfulness
- **Goal:** Ensure untrusted/malformed client requests are rejected and truthfully recorded in the Agent Activity Ledger.
- **Assertion:**
  - Missing required fields triggers HTTP 400.
  - Activity ledger logs `status: "failed"` with execution duration.

### TC-10: Demo Mode Status Progression
- **Goal:** Allow simulated dispatch lifecycle transitions without misleading users about real municipal actions.
- **Assertion:**
  - Advance status to `In Progress` updates the JSON store.
  - Adds audit note: `"AMC Zonal Engineering Supervisor (Simulated Demo Action)"`.

---

## 📊 Automated Execution Report

```text
======================================================
🏛️  CIVICSAARTHI — MOCK AMC AGENT VALIDATION TEST SUITE
Target Environment: http://localhost:3000
======================================================

[✓ PASS] Verify Seeded Starter Complaint AMC-2026-000123 (7ms)
[✓ PASS] Lookup Ward & Department for "Navrangpura" (20ms)
[✓ PASS] Reject Unsupported Area "MarsColony" Without Arbitrary Assignment (4ms)
[✓ PASS] Return 404 for Non-Existent Tracking ID (No Invented Status) (6ms)
[✓ PASS] Create New Ticket with Sequential ID Pattern (AMC-2026-000124) (10ms)
[✓ PASS] Verify Ticket Persisted in Mock Database and Queryable by ID (8ms)
[✓ PASS] Detect Existing Complaint Duplicate (Navrangpura + pothole) (5ms)
[✓ PASS] Add Corroborating Evidence to Existing Complaint (7ms)
[✓ PASS] Reject Malformed Ticket Request and Log Failure in Activity Ledger (4ms)
[✓ PASS] Simulate Status Progression (Submitted -> In Progress) (4ms)
[✓ PASS] Verify Civic Pulse Telemetry and Hotspot Clusters (4ms)

======================================================
📊 TEST SUMMARY RESULTS
======================================================
Total Scenarios Executed : 11
Passed                   : 11 ✅
Failed                   : 0 🎉
Pass Rate                : 100.0%
```
