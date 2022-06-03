export interface HubSpotContactResponse {
  vid: number;
  properties: {
    firstname: { value: string };
    lastname: { value: string };
  };
  "identity-profiles": [
    {
      identities: [
        {
          type: "EMAIL";
          value: string;
        }
      ];
    }
  ];
}
