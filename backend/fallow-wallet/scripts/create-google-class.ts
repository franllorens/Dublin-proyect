// One-time: creates (or updates) the Fallow Club card design in Google Wallet.
// Usage: npx tsx scripts/create-google-class.ts https://your-host/fallow-logo.png
import { upsertLoyaltyClass } from "../src/lib/google";

const logo = process.argv[2];
if (!logo) {
  console.error("Pass a public HTTPS URL of the logo (square PNG, 660x660 recommended).");
  process.exit(1);
}
upsertLoyaltyClass("fallow", "Fallow Speciality Coffee", logo).then((r) => {
  console.log(r.status, JSON.stringify(r.data, null, 2));
});
