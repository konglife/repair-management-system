import { describe, it, expect } from "@jest/globals";

import { parseDateRange, type DateRange } from "./dates";

/**
 * parseDateRange — แปลง enum ช่วงวัน → Prisma date filter fragment
 * ปกติฐาน = startOfDay (ตี 0 ของวันปัจจุบันจาก `now`)
 *
 * ใช้ `now` ตัวยึดเพื่อให้คำตอบตายตัว → เทสไม่ต้อง mock `new Date()`
 */

describe("parseDateRange", () => {
  // now = 15 ม.ค. 2025 เวลา 10:30 (เวลาในวันไม่ควรมีผล → startOfDay = ตี 0)
  const now = new Date(2025, 0, 15, 10, 30, 0);
  const startOfDay = new Date(2025, 0, 15);

  it("undefined → undefined (ไม่กรอง = เอาทั้งหมด)", () => {
    expect(parseDateRange(undefined, now)).toBeUndefined();
  });

  it("'today' → { gte: startOfDay }", () => {
    expect(parseDateRange("today", now)).toEqual({ gte: startOfDay });
  });

  it("'7days' → { gte: startOfDay ย้อนไป 7 วัน }", () => {
    const sevenDaysAgo = new Date(2025, 0, 8); // 15 - 7 = 8 ม.ค. ตี 0
    expect(parseDateRange("7days", now)).toEqual({ gte: sevenDaysAgo });
  });

  it("'1month' → { gte: startOfDay ย้อนไป 1 เดือน (rolling) }", () => {
    const oneMonthAgo = new Date(2024, 11, 15); // เดือน 0 - 1 → ธ.ค. 2024 ตี 0
    expect(parseDateRange("1month", now)).toEqual({ gte: oneMonthAgo });
  });

  it("เวลาในวันไม่มีผล — เที่ยงคืน vs สี่โมงเย็นให้ startOfDay เท่ากัน", () => {
    const noon = new Date(2025, 0, 15, 12, 0, 0);
    const evening = new Date(2025, 0, 15, 16, 0, 0);

    expect(parseDateRange("today", noon)).toEqual(
      parseDateRange("today", evening)
    );
  });

  it("ไม่ส่ง `now` → ใช้ค่า default (เวลาปัจจุบัน) ไม่ throw", () => {
    const r: ReturnType<typeof parseDateRange> = parseDateRange("today");
    expect(r).toEqual({ gte: expect.any(Date) });
  });

  it("ตัวอย่าง rolling ข้ามปี: '1month' เดือน ม.ค. → ธ.ค.ปีก่อน", () => {
    const janNow = new Date(2025, 0, 10, 9, 0, 0);
    expect(parseDateRange("1month", janNow)).toEqual({
      gte: new Date(2024, 11, 10),
    });
  });
});

describe("parseDateRange — type coverage", () => {
  // ยืนยันว่า DateRange เป็น union 3 ค่า (ป้องกัน enum drift กลับมา)
  it("DateRange ครอบ today / 7days / 1month", () => {
    const values: DateRange[] = ["today", "7days", "1month"];
    expect(values).toHaveLength(3);
    for (const v of values) {
      expect(parseDateRange(v, new Date(2025, 0, 1))).toEqual({
        gte: expect.any(Date),
      });
    }
  });
});
