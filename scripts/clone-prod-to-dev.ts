/**
 * clone-prod-to-dev.ts — โคลนข้อมูลจริงจาก prod → dev DB (read-only จาก prod)
 *
 * 🛡️ หลักปลอดภัย (กันทำลาย prod):
 *   1. prod client ถูกใช้แค่ `findMany` / `count` (READ) — ไม่มี create/update/delete ใดๆ ในไฟล์นี้
 *   2. abort ถ้า PROD URL == DEV URL (กันตั้งค่าผิดเขียนทับ prod)
 *   3. confirm prompt ก่อนลบ dev (โชว์ row count ทุกตาราง)
 *   4. clone ทั้งหมดใน dev.$transaction → ถ้าพัง dev กลับเป็นข้อมูลเดิม (prod ไม่กระทบแน่นอน)
 *
 * แหล่ง URL:
 *   - DEV  (เขียน): DIRECT_URL จาก `.env.local`
 *   - PROD (อ่าน):  PROD_DIRECT_URL จาก `.env.prod-readonly.local` (gitignored — read-only)
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// ─── tiny env loader (ไม่พึ่งพา dotenv) ───────────────────────────────
function loadEnv(file: string): Record<string, string> {
  const p = resolve(process.cwd(), file);
  if (!existsSync(p)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2];
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function die(msg: string): never {
  console.error(`\n❌ ABORT: ${msg}\n`);
  process.exit(1);
}

const devEnv = loadEnv(".env.local");
const prodEnv = loadEnv(".env.prod-readonly.local");

const DEV_DIRECT_URL = devEnv.DIRECT_URL;
const PROD_DIRECT_URL = prodEnv.PROD_DIRECT_URL;

// ─── guards ───────────────────────────────────────────────────────────
if (!DEV_DIRECT_URL) die("ไม่พบ DIRECT_URL ใน .env.local (ต้องชี้ dev DB)");
if (!PROD_DIRECT_URL) {
  die(
    "ไม่พบ PROD_DIRECT_URL ใน .env.prod-readonly.local — กรอกก่อนรัน (ดู .env.prod-readonly.example)"
  );
}

// Prisma Postgres ใช้ host เดียวกัน (db.prisma.io) ทุก instance → แยก DB ด้วย username (token ยาว)
// เลยต้องเช็ค username ไม่ใช่ host
const userOf = (u: string): string => {
  const m = u.match(/^postgres(?:\+[^:]*)?:\/\/([^:]+):/);
  return m ? m[1] : u;
};

if (PROD_DIRECT_URL === DEV_DIRECT_URL) {
  die("PROD URL เท่ากับ DEV URL แบบเป๊ะ — เสี่ยงเขียนทับ prod → abort");
}
if (userOf(PROD_DIRECT_URL) === userOf(DEV_DIRECT_URL)) {
  die(
    "prod กับ dev ใช้ DB instance/username เดียวกัน (จาก connection string) — เสี่ยงเขียนทับ prod → abort"
  );
}

// ─── clone plan (insert order = parents first; delete = reverse) ──────
const MODELS = [
  "businessProfile",
  "category",
  "unit",
  "product",
  "customer",
  "purchaseRecord",
  "sale",
  "saleItem",
  "repair",
  "usedPart",
] as const;
type ModelName = (typeof MODELS)[number];

const READ_BATCH = 1000;
const WRITE_BATCH = 500;

type AnyClient = PrismaClient | Prisma.TransactionClient;

async function readAll(
  client: AnyClient,
  model: ModelName
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let skip = 0;
  // paginate กันโหลดทั้งตารางขึ้น RAM
  for (;;) {
    const batch = (await (
      client as unknown as Record<
        ModelName,
        {
          findMany: (a: unknown) => Promise<Record<string, unknown>[]>;
        }
      >
    )[model].findMany({
      skip,
      take: READ_BATCH,
      orderBy: { id: "asc" },
    })) as Record<string, unknown>[];
    rows.push(...batch);
    if (batch.length < READ_BATCH) break;
    skip += READ_BATCH;
  }
  return rows;
}

async function writeBatched(
  client: AnyClient,
  model: ModelName,
  rows: Record<string, unknown>[]
): Promise<void> {
  const accessor = (
    client as unknown as Record<
      ModelName,
      {
        createMany: (a: { data: unknown[] }) => Promise<unknown>;
      }
    >
  )[model];
  for (let i = 0; i < rows.length; i += WRITE_BATCH) {
    await accessor.createMany({ data: rows.slice(i, i + WRITE_BATCH) });
  }
}

async function main(): Promise<void> {
  // ⚠️ READ-ONLY: prod client ใช้ findMany/count เท่านั้นตลอดทั้งไฟล์
  const prod = new PrismaClient({ datasourceUrl: PROD_DIRECT_URL });
  const dev = new PrismaClient({ datasourceUrl: DEV_DIRECT_URL });

  try {
    console.log("\n🔍 นับ row ใน prod (read-only)...\n");
    const counts: { model: ModelName; rows: number }[] = [];
    for (const model of MODELS) {
      const n = await (
        prod as unknown as Record<ModelName, { count: () => Promise<number> }>
      )[model].count();
      counts.push({ model, rows: n });
    }
    const total = counts.reduce((s, c) => s + c.rows, 0);

    console.log("ตาราง prod → จำนวน row:");
    for (const c of counts) console.log(`  ${c.model.padEnd(18)} ${c.rows}`);
    console.log(`  ${"รวม".padEnd(18)} ${total}`);

    console.log(
      "\n⚠️  กำลังจะ ⚡ลบข้อมูล dev ทั้งหมด แล้วเขียนทับด้วยข้อมูล prod (ภายใน transaction)"
    );
    console.log("    prod จะไม่ถูกแตะ (อ่านอย่างเดียว)\n");
    const rl = createInterface({ input, output });
    const ans = await rl.question("พิมพ์ YES เพื่อยืนยัน: ");
    rl.close();
    if (ans.trim() !== "YES") {
      console.log("ยกเลิก — ไม่มีอะไรเปลี่ยนแปลง");
      return;
    }

    await dev.$transaction(async (tx) => {
      // 1) ลบ dev (ย้อยกลับลูก→พ่อ)
      console.log("\n🧹 ลบข้อมูล dev เดิม...");
      for (const model of [...MODELS].reverse()) {
        const r = await (
          tx as unknown as Record<
            ModelName,
            {
              deleteMany: () => Promise<{ count: number }>;
            }
          >
        )[model].deleteMany();
        console.log(`  ลบ ${model}: ${r.count}`);
      }

      // 2) โคลน prod → dev (พ่อ→ลูก)
      console.log("\n📥 โคลน prod → dev...");
      for (const model of MODELS) {
        const rows = await readAll(prod, model); // ← prod แค่อ่าน
        if (rows.length === 0) {
          console.log(`  ${model.padEnd(18)} ว่าง — ข้าม`);
          continue;
        }
        await writeBatched(tx, model, rows);
        console.log(`  ${model.padEnd(18)} ${rows.length} row ✓`);
      }
    });

    console.log("\n✅ clone เสร็จ — dev DB = ข้อมูล prod แล้ว");
  } finally {
    await prod.$disconnect();
    await dev.$disconnect();
  }
}

main().catch((err) => {
  console.error(
    "\n💥 clone พัง — dev ถูก rollback เป็นข้อมูลเดิม (prod ไม่กระทบ):",
    err
  );
  process.exit(1);
});
