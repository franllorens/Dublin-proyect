import path from "node:path";
import http2 from "node:http2";
import { PKPass } from "passkit-generator";
import { env } from "./env";
import { db, PassView } from "./db";

const MODEL_DIR = path.join(process.cwd(), "models", "fallow.pass");

type Loc = { lat: number; lng: number; name: string };

/** Builds the signed .pkpass for one card, with the stamp count as it is now. */
export async function buildApplePass(p: PassView, locations: Loc[]): Promise<Buffer> {
  const goal = p.rules.goal;
  const pass = await PKPass.from(
    {
      model: MODEL_DIR,
      certificates: {
        wwdr: env.apple.wwdr(),
        signerCert: env.apple.signerCert(),
        signerKey: env.apple.signerKey(),
        signerKeyPassphrase: env.apple.passphrase(),
      },
    },
    {
      passTypeIdentifier: env.apple.passTypeId(),
      teamIdentifier: env.apple.teamId(),
      serialNumber: p.serial,
      authenticationToken: p.auth_token,
      // Apple appends /v1/... to this URL
      webServiceURL: `${env.baseUrl()}/api/apple`,
      organizationName: p.tenant_name,
      description: `${p.tenant_name} stamp card`,
    },
  );

  pass.headerFields.push({
    key: "stamps",
    label: "STAMPS",
    value: p.reward_ready ? "FREE" : `${p.stamps}/${goal}`,
    changeMessage: "Your Fallow card: %@",
  });
  pass.primaryFields.push({
    key: "reward",
    label: "NEXT REWARD",
    value: p.reward_ready ? "Free coffee ready" : `${goal - p.stamps} to a free coffee`,
    changeMessage: "%@",
  });
  pass.secondaryFields.push({ key: "member", label: "MEMBER", value: p.first_name });
  pass.auxiliaryFields.push({ key: "where", label: "VALID AT", value: "All Fallow locations" });
  pass.backFields.push(
    {
      key: "rules",
      label: "How it works",
      value: `One stamp per coffee, at any location. ${goal} stamps = a free coffee. One stamp a week for tagging us in your Instagram story.`,
    },
    { key: "serial", label: "Card", value: p.serial },
  );

  pass.setBarcodes({
    message: p.serial,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
    altText: p.serial,
  });

  // Shows the card on the lock screen near a trailer (Apple allows up to 10)
  pass.setLocations(
    ...locations.slice(0, 10).map((l) => ({
      latitude: l.lat,
      longitude: l.lng,
      relevantText: `Fallow ${l.name} is right here`,
    })),
  );

  return pass.getAsBuffer();
}

/**
 * Tells every iPhone holding this card to fetch the new version.
 * Wallet pass updates go through the production APNs gateway, with the
 * pass type certificate as the client certificate and an empty payload.
 */
export async function pushAppleUpdate(serial: string): Promise<number> {
  const { data, error } = await db()
    .from("apple_registrations")
    .select("push_token")
    .eq("serial", serial);
  if (error) throw error;
  const tokens = [...new Set((data ?? []).map((r: { push_token: string }) => r.push_token))];
  if (!tokens.length) return 0;

  const session = http2.connect("https://api.push.apple.com", {
    cert: env.apple.signerCert(),
    key: env.apple.signerKey(),
    passphrase: env.apple.passphrase(),
  });
  try {
    const results = await Promise.all(
      tokens.map(
        (token) =>
          new Promise<number>((resolve, reject) => {
            const req = session.request({
              ":method": "POST",
              ":path": `/3/device/${token}`,
              "apns-topic": env.apple.passTypeId(),
              "content-type": "application/json",
            });
            req.on("response", (headers) => resolve(Number(headers[":status"])));
            req.on("error", reject);
            req.end("{}");
          }),
      ),
    );
    return results.filter((s) => s === 200).length;
  } finally {
    session.close();
  }
}

/** Constant-time-ish check of the "ApplePass <token>" header Apple sends. */
export function appleAuthOk(header: string | null, expected: string): boolean {
  if (!header?.startsWith("ApplePass ")) return false;
  const got = header.slice("ApplePass ".length);
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
