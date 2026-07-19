export interface PresentationEvidence {
  routes: Record<string, unknown>;
  profiles: Record<string, unknown>;
  artifact: Record<string, unknown>;
}

export function loadPresentationEvidence(): Promise<PresentationEvidence>;
export function validatePresentationEvidence(
  evidence: PresentationEvidence,
): void;
export function renderEvidenceMap(evidence: PresentationEvidence): string;
export function checkEvidenceMap(): Promise<boolean>;
export function writeEvidenceMap(): Promise<void>;
