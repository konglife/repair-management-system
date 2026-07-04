# Domain Docs

วิธีที่ engineering skills ควรบริโภค domain documentation ของ repo นี้เวลาสำรวจโค้ด (สร้างโดย `/setup-matt-pocock-skills`)

## ก่อนสำรวจ ให้อ่านสิ่งเหล่านี้

- **`CONTEXT.md`** ที่ root ของ repo — domain glossary (คำศัพท์โดเมน)
- **`docs/adr/`** — อ่าน ADR ที่เกี่ยวกับพื้นที่ที่จะทำงาน

repo นี้เป็น **single-context** (Next.js app เดียว) → มี `CONTEXT.md` อันเดียวที่ root (ไม่มี `CONTEXT-MAP.md`)

ถ้าไฟล์ใดยังไม่มี → **proceed silently** ห้าม flag ห้ามเสนอสร้างล่วงหน้า — skill `/domain-modeling` (เข้าถึงผ่าน `/grill-with-docs` และ `/improve-codebase-architecture`) จะสร้าง lazily เมื่อมี term/decision จริงถูก resolve

## ใช้คำศัพท์จาก glossary

เวลา output นึงชื่อ domain concept (ใน issue title, refactor proposal, hypothesis, test name) ให้ใช้ term ตามที่ `CONTEXT.md` นิยาม — อย่าไปใช้ synonym ที่ glossary เลี่ยง

ถ้า concept ที่ต้องการยังไม่อยู่ใน glossary → เป็นสัญญาณ: อาจกำลังประดิษฐ์คำที่โปรเจ็กต์ไม่ใช้ (ลองคิดใหม่) หรือเป็น gap จริง (โน้ตไว้ให้ `/domain-modeling`)

## Flag ADR conflict

ถ้า output ขัดกับ ADR ที่มีอยู่ → บอกตรงๆ อย่า override เงียบๆ เช่น:
> _ขัดกับ ADR-0007 — แต่ควรเปิดทบทวนเพราะ..._
