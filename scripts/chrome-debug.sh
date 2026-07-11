#!/usr/bin/env bash
# chrome-debug.sh — เปิด Chrome (profile debug แยก) ด้วย remote-debugging-port สำหรับ chrome-devtools MCP
#
# ทำไมต้องสคริปต์นี้?
#   - Chrome ห้าม debug port บน default profile → ต้องใช้ user-data-dir อื่น
#   - แต่ profile เปล่าจะโดน Google บล็อก OAuth → เลย copy ไฟล์ session จาก profile จริงมา
#   - copy แล้ว exit_type=Crashed → เด้ง popup "Restore pages?" ทุกครั้ง → patch Preferences แก้
#
# ผล: Chrome ที่ login Google/Clerk ได้ พร้อม debug port 9222 ให้ MCP แนบเข้า
# ดูรายละเอียด: docs/agents/chrome-cdp-mcp.md
set -euo pipefail

PORT="${CHROME_DEBUG_PORT:-9222}"
SRC_PROFILE="${LOCALAPPDATA}/Google/Chrome/User Data"
DST_PROFILE="${USERPROFILE}/.cache/chrome-debug"
CHROME="${PROGRAMFILES}/Google/Chrome/Application/chrome.exe"
[ -f "$CHROME" ] || CHROME="${PROGRAMFILES(X86)}/Google/Chrome/Application/chrome.exe"
[ -f "$CHROME" ] || { echo "ไม่เจอ chrome.exe"; exit 1; }

# 0. idempotent: ถ้า debug Chrome เปิดอยู่แล้ว → ห้ามเปิดซ้ำ (ไม่งั้นสะสมแท็บ)
if curl -s -m 2 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
  echo "✅ debug Chrome กำลังเปิดอยู่แล้ว (port :$PORT) — ข้ามการเปิดใหม่"
  echo "   (ถ้าจะเปิดใหม่จริงๆ → ปิด Chrome หน้าต่าง debug ก่อน แล้วรันสคริปต์นี้อีกครั้ง)"
  exit 0
fi

# 1. ปิด Chrome ที่ใช้ debug profile อยู่ก่อน (เฉพาะตัว ไม่แตะ profile จริง)
echo "→ ปิด Chrome debug profile (ถ้าเปิดอยู่)..."
powershell.exe -NoProfile -Command \
  "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -like '*chrome-debug*' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" 2>/dev/null || true

# 1b. รอจนกว่า chrome-debug ตายสนิท (ไม่งั้นเปิดใหม่จะแอดเป็นแท็บในหน้าต่างเดิม → เด้งแท็บซ้อน)
for i in $(seq 1 10); do
  remaining=$(powershell.exe -NoProfile -Command \
    "(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -like '*chrome-debug*' }).Count" 2>/dev/null | tr -d '\r')
  [ -z "$remaining" ] && remaining=0
  if [ "$remaining" = "0" ]; then echo "→ chrome-debug ปิดสนิทแล้ว"; break; fi
  sleep 1
done

# 2. ถ้า debug profile ยังไม่มี → copy ไฟล์ session จาก profile จริง (ครั้งแรกเท่านั้น)
if [ ! -f "$DST_PROFILE/Default/Network/Cookies" ]; then
  echo "→ สร้าง debug profile ใหม่ ที่ $DST_PROFILE (copy session จาก profile จริง)..."
  mkdir -p "$DST_PROFILE/Default/Network"
  cp "$SRC_PROFILE/Local State"                       "$DST_PROFILE/Local State"
  cp "$SRC_PROFILE/Default/Login Data"                "$DST_PROFILE/Default/Login Data"
  cp "$SRC_PROFILE/Default/Login Data For Account"    "$DST_PROFILE/Default/Login Data For Account"
  cp "$SRC_PROFILE/Default/Web Data"                  "$DST_PROFILE/Default/Web Data"
  cp "$SRC_PROFILE/Default/Preferences"               "$DST_PROFILE/Default/Preferences"
  cp "$SRC_PROFILE/Default/Network/Cookies"           "$DST_PROFILE/Default/Network/Cookies"
else
  echo "→ debug profile มีอยู่แล้ว (ข้ามการ copy)"
fi

# 3. patch Preferences ปิด popup ทั้งหมด (สำคัญ: exit_type Crashed → Normal)
echo "→ patch Preferences (ปิด popup restore/welcome/default-browser)..."
node -e '
const fs=require("fs");
const p=process.argv[1];
const j=JSON.parse(fs.readFileSync(p,"utf8"));
j.profile=j.profile||{}; j.profile.exit_type="Normal"; j.profile.exited_cleanly=true;
j.browser=j.browser||{}; j.browser.has_seen_welcome_page=true; j.browser.check_default_browser=false;
// 5 = เปิด New Tab Page ไม่ restore เซสชันเก่า (คู่กับการลบ Sessions/ ด้านล่าง → ไม่ติดแท็บเก่า)
j.session=j.session||{}; j.session.restore_on_startup=5;
fs.writeFileSync(p,JSON.stringify(j));
' "$DST_PROFILE/Default/Preferences"

# 3b. ลบ session/tab state ที่ค้าง → Chrome ไม่มีอะไรจะ restore (ปลอดภัย: auth อยู่ใน Cookies/Login Data ไม่โดน)
echo "→ ลบ Sessions/ + tab state ค้าง (กันแท็บเก่าติดมา)..."
rm -rf "$DST_PROFILE/Default/Sessions" 2>/dev/null || true
rm -f "$DST_PROFILE/Default/Last Tabs" \
      "$DST_PROFILE/Default/Current Tabs" \
      "$DST_PROFILE/Default/Current Session" 2>/dev/null || true

# 4. เปิด Chrome ด้วย debug port + flag ปิด popup
URL="${1:-http://localhost:3000}"
echo "→ เปิด Chrome → $URL (debug port :$PORT)"
"$CHROME" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$DST_PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-session-crashed-bubble \
  --restore-last-session=false \
  --hide-crash-restore-bubble \
  "$URL" &

sleep 4
echo "→ ตรวจ debug port..."
curl -s -m 3 "http://127.0.0.1:$PORT/json/version" >/dev/null && \
  echo "✅ debug port :$PORT พร้อม — MCP config: --browserUrl http://localhost:$PORT" || \
  echo "⚠️ debug port ยังไม่ขึ้น ลองอีกครั้ง"
