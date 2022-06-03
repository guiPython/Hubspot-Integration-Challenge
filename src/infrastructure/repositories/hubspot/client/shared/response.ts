interface HubSpotResponse {
  body?: unknown;
  headers?: Record<string, unknown>;
}

interface HubSpotError {
  status: string;
  message: string;
}

export { HubSpotResponse, HubSpotError };
