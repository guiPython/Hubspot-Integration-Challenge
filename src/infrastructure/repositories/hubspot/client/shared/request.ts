interface HubSpotRequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  pathParameters?: Record<string, string>;
}

interface HubSpotRequestOptionsWithAuthentication
  extends HubSpotRequestOptions {
  hapiKey: string;
}

export { HubSpotRequestOptions, HubSpotRequestOptionsWithAuthentication };
