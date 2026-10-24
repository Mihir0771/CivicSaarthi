import { Language, IssueCategory, ComplaintStatus } from '../types/civic';

export interface Translations {
  appName: string;
  tagline: string;
  headline: string;
  subheadline: string;
  mockBadge: string;
  mockDisclaimer: string;
  navReport: string;
  navTrack: string;
  navPulse: string;
  navLedger: string;
  
  // Issue Categories
  issues: Record<IssueCategory, string>;
  issueDescriptions: Record<IssueCategory, string>;
  
  // Statuses
  statuses: Record<ComplaintStatus, string>;
  statusExplanations: Record<ComplaintStatus, string>;
  
  // Severity
  severities: {
    low: string;
    medium: string;
    high: string;
  };
  
  // Steps
  stepUpload: string;
  stepAnalyze: string;
  stepLocation: string;
  stepReview: string;
  stepReceipt: string;
  
  // Upload Card
  uploadTitle: string;
  uploadSubtitle: string;
  dropPhoto: string;
  browsePhoto: string;
  presetTitle: string;
  presetHint: string;
  samplePothole: string;
  sampleGarbage: string;
  sampleLight: string;
  sampleWater: string;
  sampleAmbiguous: string;
  
  // Analysis
  analyzingTitle: string;
  analyzingSub: string;
  geminiPowered: string;
  confidenceLabel: string;
  severityLabel: string;
  evidenceLabel: string;
  confirmationNotice: string;
  confirmIssuePrompt: string;
  overrideIssue: string;
  
  // Location & Ward
  locationTitle: string;
  locationSub: string;
  areaLabel: string;
  areaPlaceholder: string;
  supportedAreasHint: string;
  detectGps: string;
  detectingGps: string;
  gpsFound: string;
  gpsDisclaimer: string;
  wardMatched: string;
  zoneLabel: string;
  deptAssigned: string;
  whyRoute: string;
  routeExplanation: string;
  unknownAreaError: string;
  unknownAreaHelp: string;
  
  // Civic Memory (Duplicates)
  civicMemoryTitle: string;
  civicMemoryAlert: string;
  duplicateFound: string;
  duplicateExplanation: string;
  btnCorroborate: string;
  btnDifferentIncident: string;
  corroboratingNotice: string;
  evidenceCountBadge: string;
  
  // Confirmation & Receipt
  btnConfirmAndFile: string;
  filingTitle: string;
  receiptTitle: string;
  receiptSubtitle: string;
  trackingIdLabel: string;
  copyId: string;
  copied: string;
  btnTrackNow: string;
  btnFileAnother: string;
  timelineTitle: string;
  
  // Public Update Generator
  publicUpdateTitle: string;
  publicUpdateTagline: string;
  copyPost: string;
  copyTags: string;
  draftOnlyNotice: string;
  
  // Tracker
  trackTitle: string;
  trackSubtitle: string;
  trackInputPlaceholder: string;
  btnSearch: string;
  quickSampleId: string;
  complaintNotFound: string;
  complaintNotFoundSub: string;
  filedOn: string;
  lastUpdated: string;
  currentStatusLabel: string;
  wardDepartmentSummary: string;
  demoProgressionTitle: string;
  demoProgressionSub: string;
  btnUpdateStatus: string;
  
  // Civic Pulse
  pulseTitle: string;
  pulseSubtitle: string;
  totalComplaints: string;
  statByIssue: string;
  statByWard: string;
  statByStatus: string;
  recentActivity: string;
  hotspotsTitle: string;
  hotspotsSub: string;
  pulseDisclaimer: string;
  btnResetSeed: string;
  
  // Activity Ledger
  ledgerTitle: string;
  ledgerSub: string;
  ledgerEmpty: string;
  durationLabel: string;
  statusLabel: string;
  inputLabel: string;
  outputLabel: string;
  closeLedger: string;
  viewLedger: string;
  
  // Common
  loading: string;
  retry: string;
  cancel: string;
  back: string;
  next: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "CivicSaarthi",
    tagline: "One photo. One ticket. A clear trail.",
    headline: "Make your neighbourhood's problems count.",
    subheadline: "Share a photo. We'll help identify the issue, find the correct mock ward, and create a trackable civic complaint.",
    mockBadge: "MOCK AMC ENVIRONMENT",
    mockDisclaimer: "HACKATHON DEMO — MOCK AMC DATA — NO REAL COMPLAINT IS SUBMITTED.",
    navReport: "Report Issue",
    navTrack: "Track Complaint",
    navPulse: "Civic Pulse",
    navLedger: "Agent Ledger",
    
    issues: {
      pothole: "Pothole / Road Damage",
      garbage: "Garbage Accumulation",
      streetlight: "Broken Streetlight",
      waterlogging: "Waterlogging / Drainage",
      other: "Other Civic Problem",
      uncertain: "Uncertain / Unclear Image"
    },
    issueDescriptions: {
      pothole: "Crater or structural road surface crater posing danger to traffic.",
      garbage: "Accumulated municipal waste, plastic refuse, or uncollected garbage bins.",
      streetlight: "Non-functional, damaged, or unlit streetlight pole.",
      waterlogging: "Standing rainwater or blocked stormwater drain on roadway.",
      other: "Civic issue outside core 4 categories.",
      uncertain: "Visual evidence is unclear or does not show an obvious civic defect."
    },
    
    statuses: {
      Submitted: "Submitted",
      Assigned: "Assigned",
      "In Progress": "In Progress",
      Resolved: "Resolved",
      Closed: "Closed"
    },
    statusExplanations: {
      Submitted: "Complaint has been securely registered in the AMC mock registry.",
      Assigned: "Routed to the designated zonal engineering department for inspection.",
      "In Progress": "Field crew dispatched and remedial work is underway.",
      Resolved: "Issue rectified by ward maintenance team with photo confirmation.",
      Closed: "Citizen inspection complete and ticket officially closed."
    },
    
    severities: {
      low: "Low Severity",
      medium: "Medium Severity",
      high: "High Severity"
    },
    
    stepUpload: "1. Capture / Upload",
    stepAnalyze: "2. AI Inspection",
    stepLocation: "3. Ward Routing",
    stepReview: "4. Review & Memory",
    stepReceipt: "5. Ticket Receipt",
    
    uploadTitle: "Evidence Upload",
    uploadSubtitle: "Select or capture an image of the civic issue in Ahmedabad",
    dropPhoto: "Drop photo here or click to browse",
    browsePhoto: "Upload Photo",
    presetTitle: "Quick Demo Presets",
    presetHint: "Click any realistic test scenario below to evaluate the agent instantly:",
    samplePothole: "Road Pothole (Navrangpura)",
    sampleGarbage: "Waste Pile (Maninagar)",
    sampleLight: "Dark Streetlight (Stadium)",
    sampleWater: "Waterlogging (Kankaria)",
    sampleAmbiguous: "Ambiguous (Low confidence test)",
    
    analyzingTitle: "Analyzing Evidence with Gemini AI...",
    analyzingSub: "Performing computer vision classification, severity assessment, and evidence validation.",
    geminiPowered: "Powered by Gemini 3.8 Flash Multimodal Agent",
    confidenceLabel: "Estimated Confidence",
    severityLabel: "Estimated Severity",
    evidenceLabel: "Evidence Summary",
    confirmationNotice: "Confidence is below threshold or requires verification. Please verify the classification before routing.",
    confirmIssuePrompt: "Is this classification correct?",
    overrideIssue: "Change Issue Category",
    
    locationTitle: "Location & Ward Resolution",
    locationSub: "Match with Ahmedabad Municipal Corporation mock administrative wards",
    areaLabel: "Area Name / Locality",
    areaPlaceholder: "e.g. Navrangpura, Maninagar, Stadium...",
    supportedAreasHint: "Supported demo areas: Navrangpura, Stadium, CG Road (Ward W12 - West Zone) | Maninagar, Kankaria, Jawahar Chowk (Ward W27 - South Zone)",
    detectGps: "Use Device Location",
    detectingGps: "Detecting GPS...",
    gpsFound: "Device GPS captured",
    gpsDisclaimer: "Coordinates are used solely to suggest supported areas; GPS coordinates alone do not form municipal boundaries.",
    wardMatched: "Ward Verified",
    zoneLabel: "Zone",
    deptAssigned: "Department Routed",
    whyRoute: "Why this route?",
    routeExplanation: "Area matched configured mock ward jurisdiction, and the verified issue category mapped to the responsible municipal department.",
    unknownAreaError: "Area not recognized in mock AMC ward database.",
    unknownAreaHelp: "CivicSaarthi never assigns arbitrary wards. Please select one of the verified supported areas above.",
    
    civicMemoryTitle: "Civic Memory Alert — Potential Duplicate Detected",
    civicMemoryAlert: "A recent matching complaint is already active in this exact area and ward.",
    duplicateFound: "Active Ticket",
    duplicateExplanation: "Rather than filing redundant tickets for the same incident, you can add your photo as corroborating evidence. This boosts urgency without cluttering municipal queues.",
    btnCorroborate: "Add Evidence to Existing Complaint (Recommended)",
    btnDifferentIncident: "This is a Different Incident — File New Ticket",
    corroboratingNotice: "Adding photo as supporting proof to existing complaint.",
    evidenceCountBadge: "citizen corroborations",
    
    btnConfirmAndFile: "Confirm & File Mock AMC Ticket",
    filingTitle: "Transmitting ticket to mock AMC registry...",
    receiptTitle: "Mock Ticket Filed Successfully",
    receiptSubtitle: "Your civic issue has been officially logged with a unique sequential tracking ID.",
    trackingIdLabel: "Official Tracking ID",
    copyId: "Copy ID",
    copied: "Copied!",
    btnTrackNow: "Track Complaint Status",
    btnFileAnother: "File Another Report",
    timelineTitle: "Official AMC Action Timeline",
    
    publicUpdateTitle: "Citizen Public Update (Social Draft)",
    publicUpdateTagline: "Prepare a neutral, transparent public announcement to follow up on your ward ticket.",
    copyPost: "Copy Post Text",
    copyTags: "Copy Hashtags",
    draftOnlyNotice: "Draft only — not published. CivicSaarthi never automatically posts to social media.",
    
    trackTitle: "Track Your Complaint",
    trackSubtitle: "Enter any official tracking ID to view real-time recorded AMC status and action ledger.",
    trackInputPlaceholder: "e.g. AMC-2026-000123",
    btnSearch: "Track Ticket",
    quickSampleId: "Try seeded demo ticket:",
    complaintNotFound: "Complaint Not Found",
    complaintNotFoundSub: "No record exists for tracking ID in the mock AMC database. CivicSaarthi never invents ticket statuses.",
    filedOn: "Filed On",
    lastUpdated: "Last Updated",
    currentStatusLabel: "Current Status",
    wardDepartmentSummary: "Administrative Routing",
    demoProgressionTitle: "DEMO MODE — Simulated Status Controls",
    demoProgressionSub: "Test the complaint lifecycle. Status updates directly modify the mock JSON database and record audit logs.",
    btnUpdateStatus: "Advance Status",
    
    pulseTitle: "Civic Pulse — Ahmedabad Municipal Overview",
    pulseSubtitle: "Aggregated live telemetry and resolution metrics across mock AMC wards.",
    totalComplaints: "Total Mock Complaints",
    statByIssue: "Complaints by Category",
    statByWard: "Complaints by Ward",
    statByStatus: "Status Distribution",
    recentActivity: "Recent Municipal Complaints",
    hotspotsTitle: "Identified Civic Hotspots",
    hotspotsSub: "Areas with multiple citizen complaints or corroborating evidence.",
    pulseDisclaimer: "DEMO DATA ONLY — Derived purely from local mock AMC records. Not official municipal statistics.",
    btnResetSeed: "Reset to Clean Seed Database",
    
    ledgerTitle: "Agent Activity Ledger",
    ledgerSub: "Verifiable, real-time audit trail of backend agent tool calls and execution duration.",
    ledgerEmpty: "No agent tools executed yet. Upload an image or track a complaint to see live tool calls.",
    durationLabel: "Duration",
    statusLabel: "Status",
    inputLabel: "Tool Input",
    outputLabel: "Tool Result",
    closeLedger: "Close Ledger",
    viewLedger: "Live Agent Ledger",
    
    loading: "Loading...",
    retry: "Try Again",
    cancel: "Cancel",
    back: "Back",
    next: "Continue"
  },
  
  gu: {
    appName: "નાગરિક સારથી",
    tagline: "એક ફોટો. એક ફરિયાદ. સ્પષ્ટ પારદર્શિતા.",
    headline: "તમારા વિસ્તારની સમસ્યાઓનો ઉકેલ લાવો.",
    subheadline: "ફોટો અપલોડ કરો. અમે સમસ્યા ઓળખીશું, સાચો મોક વોર્ડ શોધીશું અને ટ્રેક કરી શકાય તેવી ફરિયાદ નોંધીશું.",
    mockBadge: "મોક એએમસી વાતાવરણ",
    mockDisclaimer: "હેકાથોન ડેમો — મોક એએમસી ડેટા — કોઈ વાસ્તવિક ફરિયાદ નોંધાતી નથી.",
    navReport: "ફરિયાદ નોંધાવો",
    navTrack: "ફરિયાદ ટ્રેક કરો",
    navPulse: "નાગરિક પલ્સ",
    navLedger: "એજન્ટ લેજર",
    
    issues: {
      pothole: "રસ્તા પર ખાડા / નુકસાન",
      garbage: "કચરાનો ઢગલો / ગંદકી",
      streetlight: "બંધ સ્ટ્રીટલાઇટ",
      waterlogging: "પાણી ભરાવું / ડ્રેનેજ સમસ્યા",
      other: "અન્ય નાગરિક સમસ્યા",
      uncertain: "અસ્પષ્ટ / અનિશ્ચિત ફોટો"
    },
    issueDescriptions: {
      pothole: "વાહન વ્યવહાર માટે જોખમી રસ્તા પર ખાડા અથવા સપાટીનું નુકસાન.",
      garbage: "રોડ સાઈડ પ્લાસ્ટિક કચરો અથવા ન ઉપડેલા કચરાના ડબ્બાઓ.",
      streetlight: "બંધ અથવા ક્ષતિગ્રસ્ત સ્ટ્રીટલાઇટ થાંભલો.",
      waterlogging: "રસ્તા પર ભરાયેલું વરસાદી પાણી અથવા ચોક થઈ ગયેલ ગટર.",
      other: "મુખ્ય ૪ કેટેગરી સિવાયની નાગરિક સમસ્યા.",
      uncertain: "ફોટોમાંથી સમસ્યા સ્પષ્ટ દેખાતી નથી અથવા ઓળખી શકાતી નથી."
    },
    
    statuses: {
      Submitted: "સબમિટ થયેલ",
      Assigned: "સોંપાયેલ",
      "In Progress": "પ્રગતિ હેઠળ",
      Resolved: "નિરાકરણ થયેલ",
      Closed: "બંધ થયેલ"
    },
    statusExplanations: {
      Submitted: "મોક એએમસી રજિસ્ટ્રીમાં ફરિયાદ સુરક્ષિત રીતે નોંધવામાં આવી છે.",
      Assigned: "તપાસ માટે નિયુક્ત ઝોનલ એન્જિનિયરિંગ વિભાગને સોંપવામાં આવી છે.",
      "In Progress": "ફિલ્ડ ટીમ રવાના થઈ ગઈ છે અને સમારકામ ચાલુ છે.",
      Resolved: "વોર્ડ મેઇન્ટેનન્સ ટીમ દ્વારા સમસ્યાનું સફળતાપૂર્વક નિરાકરણ લાવવામાં આવ્યું છે.",
      Closed: "નાગરિક ચકાસણી પૂર્ણ થઈ છે અને ફરિયાદ સત્તાવાર રીતે બંધ કરવામાં આવી છે."
    },
    
    severities: {
      low: "સામાન્ય ગંભીરતા",
      medium: "મધ્યમ ગંભીરતા",
      high: "ઉચ્ચ ગંભીરતા"
    },
    
    stepUpload: "૧. ફોટો અપલોડ",
    stepAnalyze: "૨. એઆઈ નિરીક્ષણ",
    stepLocation: "૩. વોર્ડ રૂટિંગ",
    stepReview: "૪. પુનરાવર્તન તપાસ",
    stepReceipt: "૫. ફરિયાદ રસીદ",
    
    uploadTitle: "પુરાવા અપલોડ કરો",
    uploadSubtitle: "અમદાવાદમાં નાગરિક સમસ્યાનો ફોટો પસંદ કરો અથવા કેપ્ચર કરો",
    dropPhoto: "અહીં ફોટો મૂકો અથવા પસંદ કરવા ક્લિક કરો",
    browsePhoto: "ફોટો અપલોડ કરો",
    presetTitle: "ડેમો માટે તૈયાર નમૂનાઓ",
    presetHint: "એજન્ટનું ત્વરિત પરીક્ષણ કરવા નીચે આપેલ કોઈપણ વાસ્તવિક ઉદાહરણ પસંદ કરો:",
    samplePothole: "રસ્તા પર ખાડો (નવરંગપુરા)",
    sampleGarbage: "કચરાનો ઢગલો (મણિનગર)",
    sampleLight: "બંધ સ્ટ્રીટલાઇટ (સ્ટેડિયમ)",
    sampleWater: "પાણી ભરાવું (કાંકરિયા)",
    sampleAmbiguous: "અસ્પષ્ટ ફોટો (ઓછો વિશ્વાસ પરીક્ષણ)",
    
    analyzingTitle: "જેમિની એઆઈ દ્વારા પુરાવાની તપાસ...",
    analyzingSub: "કમ્પ્યુટર વિઝન વર્ગીકરણ, ગંભીરતા આકલન અને પુરાવા ચકાસણી ચાલુ છે.",
    geminiPowered: "જેમિની ૩.૮ ફ્લેશ મલ્ટીમોડલ એજન્ટ દ્વારા સંચાલિત",
    confidenceLabel: "અંદાજિત વિશ્વસનીયતા",
    severityLabel: "અંદાજિત ગંભીરતા",
    evidenceLabel: "પુરાવા સારાંશ",
    confirmationNotice: "વિશ્વસનીયતા થ્રેશોલ્ડ કરતાં ઓછી છે અથવા પુષ્ટિ જરૂરી છે. કૃપા કરીને આગળ વધતા પહેલા ચકાસો.",
    confirmIssuePrompt: "શું આ વર્ગીકરણ સાચું છે?",
    overrideIssue: "સમસ્યા કેટેગરી બદલો",
    
    locationTitle: "વિસ્તાર અને વોર્ડ નિર્ધારણ",
    locationSub: "અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન મોક વહીવટી વોર્ડ સાથે જોડાણ",
    areaLabel: "વિસ્તારનું નામ / લોકાલિટી",
    areaPlaceholder: "દા.ત. નવરંગપુરા, મણિનગર, સ્ટેડિયમ...",
    supportedAreasHint: "સહાયક ડેમો વિસ્તારો: નવરંગપુરા, સ્ટેડિયમ, સીજી રોડ (વોર્ડ W12 - પશ્ચિમ ઝોન) | મણિનગર, કાંકરિયા, જવાહર ચોક (વોર્ડ W27 - દક્ષિણ ઝોન)",
    detectGps: "ડિવાઇસ લોકેશન વાપરો",
    detectingGps: "જીપીએસ શોધી રહ્યું છે...",
    gpsFound: "ડિવાઇસ જીપીએસ મળ્યું",
    gpsDisclaimer: "કોઓર્ડિનેટ્સ ફક્ત વિસ્તાર સૂચવવા માટે વપરાય છે; જીપીએસ સ્વતંત્ર રીતે વોર્ડ સીમા નક્કી કરતું નથી.",
    wardMatched: "વોર્ડ ચકાસાયેલ",
    zoneLabel: "ઝોન",
    deptAssigned: "સોંપાયેલ વિભાગ",
    whyRoute: "આ રૂટ શા માટે?",
    routeExplanation: "વિસ્તાર અધિકૃત મોક વોર્ડ સાથે મળ્યો અને સમસ્યા કેટેગરી સંબંધિત મ્યુનિસિપલ વિભાગ સાથે જોડાઈ.",
    unknownAreaError: "મોક એએમસી ડેટાબેઝમાં આ વિસ્તાર મળ્યો નથી.",
    unknownAreaHelp: "નાગરિક સારથી ક્યારેય મનસ્વી વોર્ડ સોંપતું નથી. કૃપા કરીને ઉપર આપેલ સમર્થિત વિસ્તારોમાંથી પસંદ કરો.",
    
    civicMemoryTitle: "નાગરિક મેમરી એલર્ટ — પુનરાવર્તિત ફરિયાદ જણાય છે",
    civicMemoryAlert: "આ જ વિસ્તાર અને વોર્ડમાં આ સમસ્યા માટે અગાઉથી સક્રિય ફરિયાદ નોંધાયેલી છે.",
    duplicateFound: "સક્રિય ટિકિટ",
    duplicateExplanation: "એક જ સમસ્યા માટે વધારાની ટિકિટ બનાવવાને બદલે, તમે તમારા ફોટાને સમર્થન પુરાવા તરીકે જોડી શકો છો. આનાથી સિસ્ટમમાં ભારણ વધ્યા વિના પ્રાથમિકતા વધે છે.",
    btnCorroborate: "હાલની ફરિયાદમાં પુરાવો ઉમેરો (ભલામણ કરેલ)",
    btnDifferentIncident: "આ અલગ ઘટના છે — નવી ટિકિટ બનાવો",
    corroboratingNotice: "હાલની ફરિયાદમાં સમર્થન પુરાવા તરીકે ફોટો ઉમેરાઈ રહ્યો છે.",
    evidenceCountBadge: "નાગરિક સમર્થનો",
    
    btnConfirmAndFile: "પુષ્ટિ કરો અને મોક ટિકિટ નોંધાવો",
    filingTitle: "મોક એએમસી રજિસ્ટ્રીમાં ટિકિટ નોંધાઈ રહી છે...",
    receiptTitle: "મોક ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ",
    receiptSubtitle: "તમારી ફરિયાદ અનન્ય સિક્વન્શિયલ ટ્રેકિંગ આઈડી સાથે નોંધાઈ ગઈ છે.",
    trackingIdLabel: "સત્તાવાર ટ્રેકિંગ આઈડી",
    copyId: "આઈડી કોપી કરો",
    copied: "કોપી થયું!",
    btnTrackNow: "ફરિયાદનું સ્ટેટસ તપાસો",
    btnFileAnother: "અન્ય ફરિયાદ નોંધાવો",
    timelineTitle: "સત્તાવાર એએમસી કાર્યવાહી સમયરેખા",
    
    publicUpdateTitle: "નાગરિક જાહેર અપડેટ (સોશિયલ ડ્રાફ્ટ)",
    publicUpdateTagline: "તમારી ફરિયાદ અંગે ફોલો-અપ માટે પારદર્શક જાહેર પોસ્ટ તૈયાર કરો.",
    copyPost: "પોસ્ટ કોપી કરો",
    copyTags: "હેશટેગ્સ કોપી કરો",
    draftOnlyNotice: "ફક્ત ડ્રાફ્ટ — પ્રકાશિત થતું નથી. નાગરિક સારથી ક્યારેય આપમેળે સોશિયલ મીડિયા પર પોસ્ટ કરતું નથી.",
    
    trackTitle: "તમારી ફરિયાદ ટ્રેક કરો",
    trackSubtitle: "રીઅલ-ટાઇમ મોક એએમસી સ્થિતિ જોવા માટે કોઈપણ સત્તાવાર ટ્રેકિંગ આઈડી દાખલ કરો.",
    trackInputPlaceholder: "દા.ત. AMC-2026-000123",
    btnSearch: "ટિકિટ શોધો",
    quickSampleId: "પહેલેથી દાખલ ડેમો ટિકિટ ચકાસો:",
    complaintNotFound: "ફરિયાદ મળી નથી",
    complaintNotFoundSub: "મોક એએમસી ડેટાબેઝમાં આ ટ્રેકિંગ આઈડીનો કોઈ રેકોર્ડ નથી. નાગરિક સારથી ક્યારેય બનાવટી સ્ટેટસ આપતું નથી.",
    filedOn: "નોંધાયા તારીખ",
    lastUpdated: "છેલ્લું અપડેટ",
    currentStatusLabel: "વર્તમાન સ્થિતિ",
    wardDepartmentSummary: "વહીવટી રૂટિંગ",
    demoProgressionTitle: "ડેમો મોડ — સ્થિતિ પ્રગતિ નિયંત્રણ",
    demoProgressionSub: "ફરિયાદ જીવનચક્રનું પરીક્ષણ કરો. સ્થિતિ અપડેટ સીધા મોક JSON ડેટાબેઝ અને ઓડિટ લોગમાં ફેરફાર કરે છે.",
    btnUpdateStatus: "સ્થિતિ આગળ વધારો",
    
    pulseTitle: "નાગરિક પલ્સ — અમદાવાદ મ્યુનિસિપલ ઓવરવ્યૂ",
    pulseSubtitle: "મોક એએમસી વોર્ડ્સમાં જીવંત વિશ્લેષણ અને નિરાકરણ મેટ્રિક્સ.",
    totalComplaints: "કુલ મોક ફરિયાદો",
    statByIssue: "કેટેગરી મુજબ ફરિયાદો",
    statByWard: "વોર્ડ મુજબ ફરિયાદો",
    statByStatus: "સ્થિતિ વિતરણ",
    recentActivity: "તાજેતરની મ્યુનિસિપલ ફરિયાદો",
    hotspotsTitle: "ઓળખાયેલ નાગરિક હોટસ્પોટ્સ",
    hotspotsSub: "એવા વિસ્તારો જ્યાં બહુવિધ નાગરિક ફરિયાદો અથવા પુરાવા મળ્યા છે.",
    pulseDisclaimer: "માત્ર ડેમો ડેટા — સ્થાનિક મોક એએમસી રેકોર્ડ્સમાંથી લેવામાં આવેલ. સત્તાવાર મ્યુનિસિપલ આંકડા નથી.",
    btnResetSeed: "ડેટાબેઝ ફરીથી મૂળ સ્થિતિમાં સેટ કરો",
    
    ledgerTitle: "એજન્ટ એક્ટિવિટી લેજર",
    ledgerSub: "બેકએન્ડ એજન્ટ ટૂલ કોલ્સ અને એક્ઝિક્યુશન સમયનો પારદર્શક ઓડિટ ટ્રેઇલ.",
    ledgerEmpty: "હજી સુધી કોઈ ટૂલ ચાલ્યું નથી. ટૂલ કૉલ્સ જોવા માટે ફોટો અપલોડ કરો અથવા ફરિયાદ ટ્રેક કરો.",
    durationLabel: "સમયગાળો",
    statusLabel: "સ્થિતિ",
    inputLabel: "ટૂલ ઇનપુટ",
    outputLabel: "ટૂલ પરિણામ",
    closeLedger: "લેજર બંધ કરો",
    viewLedger: "લાઈવ એજન્ટ લેજર",
    
    loading: "લોડ થઈ રહ્યું છે...",
    retry: "ફરી પ્રયાસ કરો",
    cancel: "રદ કરો",
    back: "પાછળ",
    next: "આગળ વધો"
  }
};
