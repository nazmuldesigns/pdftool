/**
 * File Retention & Privacy Policy Rules and Utilities
 */

export interface RetentionPolicyConfig {
  unauthenticatedUploadTTLHours: number; // default: 1 hour
  temporaryOutputTTLHours: number;        // default: 24 hours
  jobMetadataTTLHours: number;            // default: 48 hours
  userSavedMaxCount: number;              // default: 50 documents
  userSavedMaxTotalBytes: number;         // default: 500 MB
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicyConfig = {
  unauthenticatedUploadTTLHours: 1,
  temporaryOutputTTLHours: 24,
  jobMetadataTTLHours: 48,
  userSavedMaxCount: 50,
  userSavedMaxTotalBytes: 500 * 1024 * 1024 // 500 MB
};

export function calculateExpirationTimestamp(ttlHours: number, baseTimeMs = Date.now()): number {
  return baseTimeMs + (ttlHours * 60 * 60 * 1000);
}

export function isExpired(expirationTimestamp: number, currentTimeMs = Date.now()): boolean {
  return currentTimeMs >= expirationTimestamp;
}
