/**
 * بررسی اطلاعات نیازمند تأیید (بدون نیاز به بیلد)
 * استفاده: npm run verify:config [-- --strict]
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const file = path.join(process.cwd(), "src", "config", "verification.json");
const strict = process.argv.includes("--strict");

const items = JSON.parse(await readFile(file, "utf8"));

if (items.length === 0) {
  console.log("✓ همهٔ اطلاعات سایت تأیید شده‌اند.");
  process.exit(0);
}

console.log(`\n${items.length} مورد نیازمند تأیید مدیر سایت:\n`);
for (const [index, item] of items.entries()) {
  console.log(`${String(index + 1).padStart(2, "0")}. ${item.label}  [${item.key}]`);
  console.log(`    ${item.detail}\n`);
}

console.log("پس از تأیید هر مورد، آن را از src/config/verification.json حذف کنید.\n");

if (strict) {
  console.error("✗ موارد تأییدنشده باقی مانده‌اند (حالت strict).");
  process.exit(1);
}
