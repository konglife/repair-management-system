# Chrome + CDP + MCP — ระบบขับเบราว์เซอร์สำหรับ verify UI

> Claude เข้าควบคุม Chrome (login แล้ว) เพื่อ verify งาน UI หนักหลัง implement — โดยไม่ให้ Google บล็อก OAuth
> ใช้คู่กับ `chrome-devtools` MCP (ลง user scope). ดูวิธีลง MCP เพิ่มใน `docs/HANDOFF.md`

## ทำไมต้องมีระบบนี้

เวลา implement งาน UI (เช่น C1 EntityPicker) Claude ต้องเปิดเบราว์เซอร์ คลิก/กรอก แล้วดูผลจริงเพื่อยืนยันว่าใช้งานได้. มี ปัญหา 2 ข้อที่ต้องแก้ก่อน:

1. **Google บล็อก OAuth บน Chrome อัตโนมัติ** — `chrome-devtools` MCP ปกติเปิด Chrome ด้วย flag `--enable-automation` → ตั้ง `navigator.webdriver = true` → Google OAuth เห็นแล้วบล็อกทันที ("This browser or app may not be secure") แม้จะ login ถูกต้อง
2. **Chrome ห้าม debug port บน default profile** — กันมัลแวร์ hijack session จริง. คือ flag `--remote-debugging-port` จะถูกปฏิเสธถ้า `--user-data-dir` ชี้ profile จริง (error: `DevTools remote debugging requires a non-default data directory`)

สองข้อนี้ขัดกัน: profile จริงเท่านั้นที่ login Google ได้ → แต่ profile จริงห้ามมี debug port → แต่ไม่มี debug port ก็ควบคุมไม่ได้

## ทางออก: profile debug สำเนา + แนบ MCP ภายหลัง

แก้ด้วย 3 ขั้นที่ทำให้ทั้งสองข้อ "พอใช้ได้":

```
profile จริง (login Google ได้)
        │  copy ไฟล์ session ไม่กี่ไฟล์ (Cookies/Login Data/Web Data/Local State)
        ▼
profile debug (non-default dir) ← Chrome ยอมเปิด debug port ✓
        │  + ไม่มี flag --enable-automation → Google ไม่บล็อก ✓
        ▼
MCP แนบเข้าผ่าน --browserUrl http://localhost:9222 (ไม่ spawn เอง → ไม่ฉีด webdriver)
```

**ไฟล์ที่ copy (รวม ~350KB เท่านั้น):**

| ไฟล์ (ใน profile)                               | หน้าที่                                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Local State` (root)                            | เก็บ `os_crypt.encrypted_key` — key เข้ารหัส cookie (DPAPI bound กับ Windows user — เครื่อง+user เดียวกัน เลยถอดได้) |
| `Default/Network/Cookies`                       | session Google/Clerk จริง                                                                                            |
| `Default/Login Data` + `Login Data For Account` | รหัสที่จำไว้                                                                                                         |
| `Default/Web Data`                              | ข้อมูล autocomplete                                                                                                  |
| `Default/Preferences`                           | ตั้งค่า profile                                                                                                      |

> 903MB ที่เหลือใน profile จริงคือแคช ไม่จำเป็น → copy เฉพาะไฟล์ session เลยเบา

## ตำแหน่งไฟล์ (เครื่องนี้)

|                                | path                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| profile จริง                   | `C:\Users\Admin\AppData\Local\Google\Chrome\User Data\Default`                                                                   |
| **profile debug (ที่ใช้จริง)** | `C:\Users\Admin\.cache\chrome-debug\Default`                                                                                     |
| launcher                       | `scripts/chrome-debug.sh`                                                                                                        |
| config MCP                     | `~/.claude.json` → `mcpServers.chrome-devtools.args` = `["chrome-devtools-mcp@latest", "--browserUrl", "http://localhost:9222"]` |

## วิธีรัน

```bash
# รันครั้งแรกหลังเปิดเครื่อง (หรือตอนที่ Chrome debug ปิดอยู่)
bash scripts/chrome-debug.sh                 # เปิดที่ http://localhost:3000
bash scripts/chrome-debug.sh http://localhost:3000/sales   # เปิดหน้าเฉพาะ
```

สคริปต์ทำขั้นอัตโนมัติ: 0. **idempotent**: ถ้า debug Chrome เปิดอยู่แล้ว → **หยุดทันที ไม่เปิดซ้ำ** (กันสะสมแท็บ)

1. ปิด Chrome debug profile ที่เปิดอยู่ก่อน + **รอจนกว่าจะตายสนิท** (กันแท็บซ้อน)
2. ถ้า debug profile ยังไม่มี → copy ไฟล์ session จาก profile จริง (ครั้งแรกเท่านั้น)
3. **patch `Preferences`**: `exit_type` Crashed → Normal + ปิด popup welcome/default-browser (ไม่งั้นเด้ง "Restore pages?" ทุกครั้ง)
4. เปิด Chrome ด้วย `--remote-debugging-port=9222` + flag ปิด popup

> ⚠️ **กฎสำคัญ: เปิดครั้งเดียว ใช้ยาว** — debug Chrome เปิดค้างไว้ตลอด session. จะ verify หลายครั้งก็ไม่ต้องรันสคริปต์ซ้ำ (MCP นำทางแท็บเดิมได้). รันสคริปต์ใหม่ก็ต่อเมื่อ **ปิด Chrome debug ไปแล้ว** เท่านั้น — ไม่งั้นจะสะสมแท็บ

### ถ้าแท็บสะสม (รันสคริปต์ซ้ำโดยไม่ได้ตั้งใจ)

ปิดแท็บซ้อนผ่าน debug port โดยไม่ต้องเปิด Chrome ใหม่:

```bash
ids=$(curl -s http://127.0.0.1:9222/json/list | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); d.filter(t=>t.type==="page").slice(1).forEach(t=>console.log(t.id))')
for id in $ids; do curl -s "http://127.0.0.1:9222/json/close/$id" >/dev/null; done
```

(เก็บแท็บแรกไว้ ปิดที่เหลือ) หรือกด `Ctrl+W` ปิดเองใน Chrome ก็ได้

> ⚠️ **ต้อง restart Claude Code** หลังตั้ง `--browserUrl` ใน `~/.claude.json` ครั้งแรก (MCP โหลด config ตอนเริ่ม session เท่านั้น)

## หลักการสำคัญที่ต้องจำ

- **ห้ามปิด Chrome หน้าต่าง debug** ขณะ Claude session ทำงาน — MCP แนบอยู่กับ process นั้น. ถ้าปิด → รัน launcher ใหม่ + login ใหม่ถ้า cookie หมดอายุ
- **profile debug เป็นสำเนา ณ ขณะ copy** — cookie Google จะหมดอายุตามจริง. ถ้าวันหลัง login หลุด → ลบ `C:\Users\Admin\.cache\chrome-debug` ทิ้งแล้วรัน launcher ใหม่ (จะ copy session ใหม่จาก profile จริง)
- **launcher แก้ popup ได้ทุกชนิด**: "Restore pages?" (exit_type patch), "Welcome" (--no-first-run), "Set as default" (--no-default-browser-check + check_default_browser=false)
- **error `Failed to decrypt token for service AccountId-...`** ตอนเปิด = เป็น token ของ Chrome built-in sign-in (avatar มุมขวา) — **ไม่มีผลกับ cookie เว็บ** login OAuth ใช้ได้ปกติ ปล่อยผ่านได้

## เมื่อไหร่ใช้ / ไม่ใช้

- ✅ **ใช้**: หลัง implement งาน UI หนัก (form, picker, autocomplete, tab) ที่ต้องคลิก/กรอกจริงเพื่อยืนยัน
- ❌ **ไม่ใช้**: ตอน grill/design (เดิน design tree ไม่ต้องเปิดเบราว์เซอร์), ตอนแก้ logic/backend (verify ด้วย test + tRPC call พอ)

## debug เว็บอื่น — ต้องแก้ config Claude ไหม?

**ไม่ต้องแก้ config เลย.** `--browserUrl http://localhost:9222` เป็น generic — มันแค่บอก MCP ว่า "แนบเข้า Chrome ตัวที่เปิด debug port อยู่" ไม่ได้ผูกกับเว็บใดเว็บหนึ่ง

เว็บที่จะ debug กำหนด 2 ที่ (ไม่ใช่ config):

1. **URL ที่เปิด** — ส่งเป็น argument ให้ launcher (`bash scripts/chrome-debug.sh http://เว็บอื่น.com`) หรือให้ MCP นำทางไปเลยก็ได้
2. **login state** — อยู่ใน cookie ของ debug profile (`C:\Users\Admin\.cache\chrome-debug`). ถ้าเว็บอื่นต้อง login และยังไม่เคย login ใน debug profile → login เองครั้งเดียวในหน้าต่าง debug Chrome (cookie เก็บถาวรใน profile)

สรุป: **config ตั้งครั้งเดียว** (ตอนลง MCP). ใช้ debug เว็บไหนก็แค่ navigate ไป — ไม่ต้องแตะ `~/.claude.json` อีก

> ข้อยกเว้น: ถ้าอยาก debug พร้อมกันหลายเว็บที่ **login ชนกัน** (เช่น 2 บัญชี GitHub) → ต้องใช้คนละ debug profile ไม่ใช่แก้ config MCP แต่เป็นการรัน launcher ด้วย `DST_PROFILE` คนละ path (สคริปต์รองรับ เพราะใช้ `$USERPROFILE/.cache/chrome-debug` เป็น default ทับได้)
