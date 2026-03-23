
export enum ForgeryType {
  AUTHENTIC = 'Authentic',
  FORGED = 'Forged (Edited)',
  AI_GENERATED = 'AI-Generated'
}

export enum TrustLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video'
}

export interface ForensicMetrics {
  colorConsistency: number;
  edgeContinuity: number;
  noiseUniformity: number;
  compressionPatterns: number;
  temporalStability?: number;
}

export interface Hotspot {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: number;
  description: string;
  frameIndex?: number;
}

export interface EvidenceMetadata {
  sourceDevice?: string;
  softwareUsed?: string;
  colorSpace?: string;
  resolutionEstimate?: string;
}

export interface AnalysisResult {
  id: string;
  classification: ForgeryType;
  confidence: number;
  aiGeneratedScore: number;
  trustScore: TrustLevel;
  explanation: string;
  metrics: ForensicMetrics;
  hotspots: Hotspot[];
  timestamp: string;
  mediaType: MediaType;
  previewThumbnail?: string;
  tags: string[]; // e.g. ["SCREENSHOT", "CGI", "RECURSIVE_AUDIT"]
  metadata: EvidenceMetadata;
}
