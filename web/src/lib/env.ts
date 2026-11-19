function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}. See .env.example.`);
  return v;
}

/** PEM values pasted into env vars often arrive with literal "\n". */
export const pem = (name: string) => req(name).replace(/\\n/g, "\n");

export const env = {
  baseUrl: () => req("APP_BASE_URL").replace(/\/$/, ""),
  supabaseUrl: () => req("SUPABASE_URL"),
  supabaseKey: () => req("SUPABASE_SERVICE_ROLE_KEY"),
  apple: {
    passTypeId: () => req("APPLE_PASS_TYPE_ID"),
    teamId: () => req("APPLE_TEAM_ID"),
    wwdr: () => pem("APPLE_WWDR_PEM"),
    signerCert: () => pem("APPLE_SIGNER_CERT_PEM"),
    signerKey: () => pem("APPLE_SIGNER_KEY_PEM"),
    passphrase: () => process.env.APPLE_SIGNER_KEY_PASSPHRASE || undefined,
  },
  google: {
    issuerId: () => req("GOOGLE_WALLET_ISSUER_ID"),
    clientEmail: () => req("GOOGLE_SA_CLIENT_EMAIL"),
    privateKey: () => pem("GOOGLE_SA_PRIVATE_KEY"),
  },
};
