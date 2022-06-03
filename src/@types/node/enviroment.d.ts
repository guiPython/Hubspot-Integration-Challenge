declare global {
  namespace NodeJS {
    interface processEnv {
      HUBSPOT_API_KEY: string;
      HUBSPOT_API_URL: string;
      PORT: number;
    }
  }
}
export {};
