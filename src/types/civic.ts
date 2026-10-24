export type IssueCategory = 'pothole' | 'garbage' | 'streetlight' | 'waterlogging' | 'other' | 'uncertain';

export type SeverityLevel = 'low' | 'medium' | 'high';

export type ComplaintStatus = 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export type ImageQuality = 'good' | 'blurry' | 'low_light' | 'obscured';

export type Language = 'en' | 'gu';

export interface Ward {
  id: string;
  name: string;
  zone: string;
  areas: string[];
}

export interface DepartmentMapping {
  pothole: string;
  garbage: string;
  streetlight: string;
  waterlogging: string;
  [key: string]: string;
}

export interface TimelineEvent {
  timestamp: string;
  status: ComplaintStatus;
  actor: string;
  note: string;
}

export interface Complaint {
  trackingId: string;
  ward: string;
  issue: IssueCategory;
  status: ComplaintStatus;
  filedAt: string;
  updatedAt?: string;
  area: string;
  department: string;
  description: string;
  severity?: SeverityLevel;
  evidenceSummary?: string;
  evidenceCount?: number;
  evidenceImages?: string[];
  timeline: TimelineEvent[];
  isCorroboration?: boolean;
  linkedComplaintId?: string;
}

export interface GeminiAnalysisResult {
  issue: IssueCategory;
  confidence: number;
  severity: SeverityLevel;
  description: string;
  evidenceSummary: string;
  imageQuality: ImageQuality;
  needsConfirmation: boolean;
}

export interface WardLookupResult {
  found: boolean;
  wardId?: string;
  wardName?: string;
  zone?: string;
  matchedArea?: string;
  message?: string;
}

export interface RoutingResolution {
  ward: WardLookupResult;
  department: string;
  duplicateComplaint: Complaint | null;
}

export interface LedgerEntry {
  id: string;
  toolName: 'analyze_civic_image' | 'lookup_ward' | 'lookup_department' | 'find_duplicate_complaint' | 'create_complaint_ticket' | 'get_complaint_status' | 'add_supporting_evidence';
  inputSummary: string;
  outputSummary: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  durationMs: number;
  details?: Record<string, any>;
}

export interface PulseMetrics {
  totalComplaints: number;
  byIssue: Record<string, number>;
  byWard: Record<string, number>;
  byStatus: Record<string, number>;
  recentComplaints: Complaint[];
  hotspots: { area: string; ward: string; count: number; primaryIssue: string }[];
}
