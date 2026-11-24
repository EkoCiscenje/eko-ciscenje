/*
 * DEPLOY CHANGE CHECK - LOCAL OFFERINGS / PRICING DISABLED
 *
 * This script hashes only src/data/offerings.json. Google Sheets is not used
 * to load or refresh catalog data, and price fields are not validated.
 *
 * A future Sheets integration would need a separate loader and deployment
 * workflow; no Sheets credentials or scheduled checks are used here.
 * Re-enable pricing only in a separate change with CMS and UI field restoration.
 */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hashFilePath = resolve(rootDir, "last-build-hash.txt");
const fallbackMenuPath = resolve(rootDir, "src/data/offerings.json");

async function main() {
  const menuData = JSON.parse(readFileSync(fallbackMenuPath, "utf8"));
  const newHash = createHash("md5")
    .update(JSON.stringify(menuData))
    .digest("hex");
  const previousHash = existsSync(hashFilePath)
    ? readFileSync(hashFilePath, "utf8").trim()
    : "";
  const changed = newHash !== previousHash;

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `hash=${newHash}\n`);
  }

  if (!changed) {
    console.log("No local offerings changes detected. Skipping deploy.");
    return;
  }

  writeFileSync(hashFilePath, `${newHash}\n`);
  console.log("Local offerings changes detected. Build and deploy should run.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
