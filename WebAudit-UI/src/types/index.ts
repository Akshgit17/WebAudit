export interface SimpleElement {
  id?: number;
  key: string;
  cssSelector: string;
  name: string;
  tagName: string;
  screenshotUrl: string;
  xlocation: number;
  ylocation: number;
  width: number;
  height: number;
  attributes?: Record<string, string>;
}

export interface SimplePage {
  id?: number;
  key: string;
  url: string;
  fullPageScreenshotUrl?: string;
  screenshotUrl?: string;
  width: number;
  height: number;
}

export interface UXIssueMessage {
  id?: number;
  key: string;
  title: string;
  description: string;
  recommendation: string;
  recommendations?: string[];
  why_it_matters?: string;
  whyItMatters?: string;
  ada_compliance?: string;
  wcagCompliance?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | string;
  type: string;
  category: string;
  contrast?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  goodExample?: { screenshotUrl: string };
  badExample?: { screenshotUrl: string };
  elementKey?: string;
}

export interface Audit {
  id?: number;
  key: string;
  name: string;
  category: string;
  subcategory?: string;
  points: number;
  totalPossiblePoints: number;
  score?: number;
  messages?: UXIssueMessage[];
  status?: string;
}

export interface AuditScore {
  contentScore: number;
  informationArchitectureScore: number;
  aestheticsScore: number;
  interactivityScore: number;
  overallScore: number;
}

export interface AuditStats {
  accessibilityScore: number;
  journeysExplored: number;
  journeysTotal: number;
  textContrastScore: number;
  nonTextContrastScore: number;
  seoScore: number;
  linkScore: number;
  writtenContentScore: number;
  imageryScore: number;
  contentAuditProgress?: number;
  aestheticAuditProgress?: number;
  infoArchitectureAuditProgress?: number;
  dataExtractionProgress?: number;
}

export interface AuditRecord {
  id: number;
  key: string;
  audits?: Audit[];
  simplePage?: SimplePage;
  status: string;
  level: 'PAGE' | 'DOMAIN' | string;
  url: string;
  contentAuditScore: number;
  infoArchScore: number;
  aestheticScore: number;
}

export interface PageAudits {
  id: number;
  key: string;
  url: string;
  audits: Audit[];
}

export interface ObservationElementMapTwoWayBinding {
  elements: SimpleElement[];
  issues: UXIssueMessage[];
  scores: AuditScore;
  issueElementMap: Record<string, string>;
  elementIssues: Record<string, string[]>;
}

export interface Domain {
  id?: number;
  key?: string;
  url: string;
  host?: string;
  account?: string;
}

export interface Priority {
  name: string;
}

export interface RuntimeConfig {
  production: boolean;
  base_url: string;
  api_url: string;
  auth: {
    domain?: string;
    clientId?: string;
    authorizationParams?: {
      audience?: string | null;
      redirect_uri?: string;
    };
    errorPath?: string;
  };
  pusher?: {
    app_id?: string;
    key?: string;
    secret?: string;
    cluster?: string;
  };
  segment_key?: string;
}
