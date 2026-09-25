export interface EventDefinition {
  name: string;
  trigger: string;
  parameters: string[];
  implemented: boolean;
  reachable: boolean;
  intendedGA4: boolean;
  intendedGoogleAds: boolean;
  privacyConstraints: string;
}

export declare const FORBIDDEN_KEYS: Set<string>;
export declare const EVENT_REGISTRY: EventDefinition[];
export declare const ALLOWED_EVENT_NAMES: Set<string>;
export declare function sanitizeEventPayload(
  event: string,
  payload?: Record<string, unknown>
): Record<string, unknown> | null;
