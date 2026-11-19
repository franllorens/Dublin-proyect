import jwt from "jsonwebtoken";
import { GoogleAuth } from "google-auth-library";
import { env } from "./env";
import { PassView } from "./db";

const API = "https://walletobjects.googleapis.com/walletobjects/v1";

function auth() {
  return new GoogleAuth({
    credentials: { client_email: env.google.clientEmail(), private_key: env.google.privateKey() },
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
}

async function call(method: "GET" | "POST" | "PATCH" | "PUT", url: string, data?: unknown) {
  const client = await auth().getClient();
  return client.request({ method, url, data, validateStatus: () => true });
}

export const classId = (tenantSlug: string) => `${env.google.issuerId()}.${tenantSlug}_club`;
export const objectId = (serial: string) => `${env.google.issuerId()}.${serial.replace(/[^\w.-]/g, "_")}`;

/** One-time setup per tenant: the card design shared by every member. */
export async function upsertLoyaltyClass(tenantSlug: string, tenantName: string, logoUrl: string) {
  const id = classId(tenantSlug);
  const body = {
    id,
    issuerName: tenantName,
    programName: `${tenantName} Club`,
    programLogo: { sourceUri: { uri: logoUrl } },
    hexBackgroundColor: "#141414",
    reviewStatus: "UNDER_REVIEW",
    multipleDevicesAndHoldersAllowedStatus: "ONE_USER_ALL_DEVICES",
  };
  const existing = await call("GET", `${API}/loyaltyClass/${id}`);
  if (existing.status === 200) return call("PUT", `${API}/loyaltyClass/${id}`, body);
  return call("POST", `${API}/loyaltyClass`, body);
}

function objectBody(p: PassView, tenantSlug: string, locations: { lat: number; lng: number }[]) {
  const goal = p.rules.goal;
  return {
    id: objectId(p.serial),
    classId: classId(tenantSlug),
    state: "ACTIVE",
    accountId: p.serial,
    accountName: p.first_name,
    loyaltyPoints: {
      label: "Stamps",
      balance: { string: p.reward_ready ? "FREE" : `${p.stamps}/${goal}` },
    },
    secondaryLoyaltyPoints: {
      label: "Next reward",
      balance: { string: p.reward_ready ? "Free coffee ready" : `${goal - p.stamps} to go` },
    },
    barcode: { type: "QR_CODE", value: p.serial, alternateText: p.serial },
    textModulesData: p.usual ? [{ id: "usual", header: "Your usual", body: p.usual }] : [],
    locations: locations.slice(0, 10).map((l) => ({ latitude: l.lat, longitude: l.lng })),
  };
}

/** "Save to Google Wallet" link. Creating the object inside the JWT means no API call at join time. */
export function saveUrl(p: PassView, tenantSlug: string, locations: { lat: number; lng: number }[]) {
  const token = jwt.sign(
    {
      iss: env.google.clientEmail(),
      aud: "google",
      typ: "savetowallet",
      origins: [env.baseUrl()],
      payload: { loyaltyObjects: [objectBody(p, tenantSlug, locations)] },
    },
    env.google.privateKey(),
    { algorithm: "RS256" },
  );
  return `https://pay.google.com/gp/v/save/${token}`;
}

/** Pushes the new stamp count; Google syncs it to the phone on its own. */
export async function updateGoogleObject(
  p: PassView,
  tenantSlug: string,
  locations: { lat: number; lng: number }[],
) {
  const body = objectBody(p, tenantSlug, locations);
  const res = await call("PATCH", `${API}/loyaltyObject/${body.id}`, {
    loyaltyPoints: body.loyaltyPoints,
    secondaryLoyaltyPoints: body.secondaryLoyaltyPoints,
  });
  // 404 = the member saved the card on iPhone only, or never saved it; nothing to update
  return res.status;
}

/** Lock-screen message. Google limits these to 3 per card per day. */
export async function notifyGoogle(serial: string, header: string, text: string) {
  return call("POST", `${API}/loyaltyObject/${objectId(serial)}/addMessage`, {
    message: {
      id: `msg_${Date.now()}`,
      header,
      body: text,
      messageType: "TEXT_AND_NOTIFY",
    },
  });
}
