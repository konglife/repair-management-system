# ADR-0001: Repair pricing uses a residual margin model (do not split labor vs parts markup)

- **Status:** Accepted
- **Date:** 2026-07-05
- **Decided by:** เจ้าของร้าน (ผู้ใช้) — ยืนยันระหว่าง architecture review (candidate C2)

## Context

`Repair` เก็บเงินเป็น 3 ฟิลด์: `totalCost` (ยอดที่ลูกค้าจ่าย), `partsCost` (ต้นทุนอะไหล่จาก `averageCost`), และ `laborCost = totalCost − partsCost` (คำนวณใน `src/server/api/routers/repair.ts`).

architecture review แรก (candidate C2) ตั้งข้อสังเกตว่า `laborCost` เป็น "ยอดคงเหลือ" (residual) และเสนอให้ทำ pricing เป็น module ที่รับ labor + parts เป็น input แยกจากกัน (เพื่อกันค่าติดลบ + แยก labor จาก markup ของอะไหล่).

## Decision

**คงโมเดล residual ไว้ ไม่เปลี่ยน.** เจ้าของร้านคิดเงินจากลูกค้าแบบ:

```
totalCost  = ยอดที่ลูกค้าจ่าย            (เจ้าของร้านกรอกตัวเลขเดียว)
partsCost  = Σ averageCost × จำนวน       (ระบบคำนวณ)
margin     = totalCost − partsCost        ← เงินที่เก็บเข้ากระเป๋า
```

`margin` นี้ = ค่าแรง + markup อะไหล่ รวมกัน เป็นตัวเลขเดียวที่เจ้าของร้านสน เพราะ:

1. ร้านเดี่ยว งานซ่อมรายเคสเล็ก (~150 ฿/เคส)
2. เจ้าของร้าน **ไม่ต้องการ** รู้ "ค่าแรงแท้" แยกจาก "markup อะไหล่" — สนแค่ว่าเก็บเข้ากระเป๋ากี่บาทต่อเคส

→ การกรอก labor เป็น input แยก (ตามที่ C2 ต้นฉบับเสนอ) จะเพิ่ม friction ในการ entry โดยไม่มีค่าตอบแทน (ขัดกับเป้า "ความเร็ว entry" ที่เป็น quality #1)

## What this means for the field name

ฟิลด์ใน DB (`prisma/schema.prisma`) ยังชื่อ `laborCost` แต่ **semantic จริง = `margin` (กำไรรวม)** ไม่ใช่ค่าแรงล้วน. ทุกโค้ด/รายงาน/analysis ใหม่ ให้ถือว่าค่านี้คือ margin:

- อย่าตีความ `laborCost` ว่าเป็น "รายได้ค่าแรง" ล้วน → จะคำนวณกำไรผิด
- การที่ dashboard (`repairProfit = totalRepairLaborCost`) กับ reports (`repairProfit = repairIncome − repairCost`) เขียนสูตรต่างกันแต่ให้ค่าเท่ากัน มาจากความสับสนชื่อนี้ — ควรนิยาม "profit/margin ของ repair" ไว้ที่เดียว

(rename ฟิลด์ DB เป็น `margin` เป็นเรื่องที่คุยกันใน C2 ตอน grill — ยังไม่ตัดสินใจใน ADR นี้)

## What C2 becomes (narrowed)

candidate C2 ใน architecture review เดิมเป็น "Strong" ที่จะ deep-dive เปลี่ยน model. หลัง decision นี้ C2 เหลือคุณค่าแค่:

- **guard ค่าติดลบ** — module เล็กที่ throw/เตือนเมื่อ `margin < 0` (ป้องกัน fat-finger; เกิด 0 ครั้งใน 530 เคสจริง แต่ไม่ได้ถูกกันไว้)
- **testability** — ดึงการคำนวณออกจาก transaction ตัดสต็อก เทสได้โดยไม่ต้องมี DB
- (optional) **rename/honest naming** ในโค้ดและรายงาน

badge ลดจาก Strong → **Worth exploring** (ดู `docs/architecture-review-20260705[-th].html`)

## Future review: do NOT re-suggest

ห้ามเสนออีกว่า "ทำให้ labor เป็น input แยกจาก markup อะไหล่" — เว้นแต่เจ้าของร้านเปลี่ยนใจ (เช่น ร้านโตจนงานซ่อมรายเคสใหญ่ขึ้นมาก หรืออยากเห็น labor vs markup แยก). ถ้าวันนั้นมา ให้ reopen ADR นี้.
