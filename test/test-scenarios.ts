/**
 * CivicSaarthi — Autonomous Civic Agent Test Suite
 * Executes full mock AMC test cases and verifies agent tools, routing, persistence,
 * Civic Memory, and simulated lifecycle transitions.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

const results: TestResult[] = [];

async function runTest(
  category: string,
  name: string,
  testFn: () => Promise<{ passed: boolean; details: string }>
) {
  const start = Date.now();
  try {
    const outcome = await testFn();
    const durationMs = Date.now() - start;
    results.push({
      category,
      name,
      passed: outcome.passed,
      durationMs,
      details: outcome.details,
    });
    const badge = outcome.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${badge}] ${name} (${durationMs}ms) - ${outcome.details}`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({
      category,
      name,
      passed: false,
      durationMs,
      details: `Exception: ${err.message}`,
    });
    console.log(`[✗ FAIL] ${name} (${durationMs}ms) - Exception: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🏛️  CIVICSAARTHI — MOCK AMC AGENT VALIDATION TEST SUITE');
  console.log(`Target Environment: ${BASE_URL}`);
  console.log('======================================================\n');

  // Ensure DB is reset to clean seed before testing
  await fetch(`${BASE_URL}/api/agent/reset-seed`, { method: 'POST' });

  // ----------------------------------------------------
  // TEST 1: Seeded Demo Complaint (AMC-2026-000123)
  // ----------------------------------------------------
  await runTest('P0 - Seeded Records', 'Verify Seeded Starter Complaint AMC-2026-000123', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/track/AMC-2026-000123`);
    if (!res.ok) return { passed: false, details: `HTTP ${res.status}` };
    const data = await res.json();
    const t = data.ticket;

    const isAssigned = t.status === 'Assigned';
    const isW12 = t.ward === 'W12';
    const isRoads = t.department === 'Roads & Buildings';
    const hasTimeline = Array.isArray(t.timeline) && t.timeline.length >= 2;

    const passed = isAssigned && isW12 && isRoads && hasTimeline;
    return {
      passed,
      details: `Status: ${t.status}, Ward: ${t.ward}, Dept: ${t.department}, Timeline Events: ${t.timeline.length}`,
    };
  });

  // ----------------------------------------------------
  // TEST 2: Ward & Department Routing for Supported Area
  // ----------------------------------------------------
  await runTest('P0 - Agent Routing', 'Lookup Ward & Department for "Navrangpura"', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/resolve-routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaName: 'Navrangpura', issue: 'garbage' }),
    });
    const data = await res.json();

    const wardMatch = data.ward.found && data.ward.wardId === 'W12' && data.ward.zone === 'West';
    const deptMatch = data.department === 'Solid Waste Management';
    const hasLedger = Array.isArray(data.ledgerEntries) && data.ledgerEntries.length >= 2;

    return {
      passed: wardMatch && deptMatch && hasLedger,
      details: `Ward: ${data.ward.wardId} (${data.ward.zone} Zone), Dept: ${data.department}, Ledger Entries: ${data.ledgerEntries.length}`,
    };
  });

  // ----------------------------------------------------
  // TEST 3: Unknown Area Protection (No arbitrary assignment)
  // ----------------------------------------------------
  await runTest('P0 - Input Safety', 'Reject Unsupported Area "MarsColony" Without Arbitrary Assignment', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/resolve-routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaName: 'MarsColony', issue: 'pothole' }),
    });
    const data = await res.json();

    const notFound = data.ward.found === false;
    const ledgerLogged = data.ledgerEntries.some(
      (e: any) => e.toolName === 'lookup_ward' && e.status === 'failed'
    );

    return {
      passed: notFound && ledgerLogged,
      details: `Ward found: ${data.ward.found}, Error message: "${data.ward.message}"`,
    };
  });

  // ----------------------------------------------------
  // TEST 4: Unknown Tracking ID 404 Verification
  // ----------------------------------------------------
  await runTest('P0 - Tracker Integrity', 'Return 404 for Non-Existent Tracking ID (No Invented Status)', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/track/AMC-9999-999999`);
    const data = await res.json();

    const is404 = res.status === 404;
    const ledgerLogged = data.ledgerEntry?.status === 'failed';

    return {
      passed: is404 && ledgerLogged,
      details: `HTTP Status: ${res.status}, Ledger Output: "${data.ledgerEntry?.outputSummary}"`,
    };
  });

  // ----------------------------------------------------
  // TEST 5: Create New Complaint & Sequential ID
  // ----------------------------------------------------
  let createdTrackingId = '';
  await runTest('P0 - Ticket Creation', 'Create New Ticket with Sequential ID Pattern (AMC-2026-000124)', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/create-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wardId: 'W27',
        issue: 'garbage',
        area: 'Maninagar',
        department: 'Solid Waste Management',
        description: 'Accumulated street garbage near market square',
        severity: 'high',
        evidenceSummary: 'Overflowing plastic waste containers',
      }),
    });
    const data = await res.json();
    const t = data.ticket;
    createdTrackingId = t?.trackingId || '';

    const isSequential = createdTrackingId === 'AMC-2026-000124';
    const isSubmitted = t?.status === 'Submitted';
    const hasInitialTimeline = t?.timeline?.length === 1;

    return {
      passed: isSequential && isSubmitted && hasInitialTimeline,
      details: `Generated ID: ${createdTrackingId}, Status: ${t?.status}, Ward: ${t?.ward}`,
    };
  });

  // ----------------------------------------------------
  // TEST 6: Database Persistence Check
  // ----------------------------------------------------
  await runTest('P0 - Persistence', 'Verify Ticket Persisted in Mock Database and Queryable by ID', async () => {
    if (!createdTrackingId) return { passed: false, details: 'Previous test did not generate ID' };

    const res = await fetch(`${BASE_URL}/api/agent/track/${createdTrackingId}`);
    const data = await res.json();
    const t = data.ticket;

    const matched = t && t.trackingId === createdTrackingId && t.area === 'Maninagar';
    return {
      passed: !!matched,
      details: `Retrieved ${t?.trackingId} successfully from mock JSON store. Area: ${t?.area}`,
    };
  });

  // ----------------------------------------------------
  // TEST 7: Civic Memory Duplicate Detection
  // ----------------------------------------------------
  await runTest('P1 - Civic Memory', 'Detect Existing Complaint Duplicate (Navrangpura + pothole)', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/resolve-routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaName: 'Navrangpura', issue: 'pothole' }),
    });
    const data = await res.json();
    const dup = data.duplicateComplaint;

    const detected = dup && dup.trackingId === 'AMC-2026-000123';
    return {
      passed: !!detected,
      details: `Duplicate matched: ${dup?.trackingId} (${dup?.status}) in Ward ${dup?.ward}`,
    };
  });

  // ----------------------------------------------------
  // TEST 8: Civic Memory Corroboration Action
  // ----------------------------------------------------
  await runTest('P1 - Civic Memory', 'Add Corroborating Evidence to Existing Complaint Without Redundant Ticket', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/add-evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: 'AMC-2026-000123',
        evidenceSummary: 'Second citizen photo confirming pothole width of 2.5 feet',
      }),
    });
    const data = await res.json();
    const updated = data.ticket;

    const countIncremented = updated.evidenceCount === 2;
    const timelineHasCorroboration = updated.timeline.some((e: any) =>
      e.actor.includes('Corroborat')
    );

    return {
      passed: countIncremented && timelineHasCorroboration,
      details: `Evidence count increased to ${updated.evidenceCount}. Corroboration timeline event logged.`,
    };
  });

  // ----------------------------------------------------
  // TEST 9: Reject Incomplete Payload & Record Failure in Ledger
  // ----------------------------------------------------
  await runTest('P1 - Failure Recovery', 'Reject Malformed Ticket Request and Log Failure in Activity Ledger', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/create-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue: 'garbage' }), // Missing wardId, area, department
    });
    const data = await res.json();

    const is400 = res.status === 400;
    const ledgerLogged = data.ledgerEntry?.status === 'failed';

    return {
      passed: is400 && ledgerLogged,
      details: `HTTP ${res.status}. Ledger failure logged: "${data.ledgerEntry?.outputSummary}"`,
    };
  });

  // ----------------------------------------------------
  // TEST 10: Demo Mode Status Progression Controls
  // ----------------------------------------------------
  await runTest('P2 - Lifecycle Simulation', 'Simulate Status Progression (Submitted -> In Progress)', async () => {
    if (!createdTrackingId) return { passed: false, details: 'No created ticket available' };

    const res = await fetch(`${BASE_URL}/api/agent/demo-status-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: createdTrackingId,
        newStatus: 'In Progress',
      }),
    });
    const data = await res.json();
    const t = data.ticket;

    const isUpdated = t.status === 'In Progress';
    const latestTimeline = t.timeline[t.timeline.length - 1];
    const timelineRecorded = latestTimeline?.status === 'In Progress';

    return {
      passed: isUpdated && timelineRecorded,
      details: `Status transitioned to "${t.status}". Audit log: "${latestTimeline?.note}"`,
    };
  });

  // ----------------------------------------------------
  // TEST 11: Civic Pulse Analytics Aggregation
  // ----------------------------------------------------
  await runTest('P2 - Analytics Dashboard', 'Verify Civic Pulse Telemetry and Hotspot Clusters', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/pulse`);
    const data = await res.json();

    const hasTotal = typeof data.totalComplaints === 'number' && data.totalComplaints >= 2;
    const hasIssues = Object.keys(data.byIssue).length >= 4;
    const hasHotspots = Array.isArray(data.hotspots) && data.hotspots.length >= 1;

    return {
      passed: hasTotal && hasIssues && hasHotspots,
      details: `Total complaints: ${data.totalComplaints}, Issue buckets: ${Object.keys(data.byIssue).length}, Top hotspot: ${data.hotspots[0]?.area} (${data.hotspots[0]?.count} reports)`,
    };
  });

  // ----------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log('📊 TEST SUMMARY RESULTS');
  console.log('======================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total Scenarios Executed : ${total}`);
  console.log(`Passed                   : ${passed} ✅`);
  console.log(`Failed                   : ${failed} ${failed === 0 ? '🎉' : '❌'}`);
  console.log(`Pass Rate                : ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test suite failure:', err);
  process.exit(1);
});
