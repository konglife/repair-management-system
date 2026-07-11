/**
 * ค่าช่วงวัน canonical — single source ที่เดียว (type + zod schema ทั้งคู่ derive จากนี่)
 * ใช้ร่วมระหว่าง sale / repair / dashboard routers
 *
 * กฎเดียว: "ช่วง X = ย้อนจากตี 0 ของวันนี้ไป X"
 */
export const DATE_RANGE_VALUES = ["today", "7days", "1month"] as const;

export type DateRange = (typeof DATE_RANGE_VALUES)[number];

type PrismaDateFilter = { gte: Date };

/**
 * แปลง enum ช่วงวัน → Prisma date filter fragment `{ gte: Date }`
 *
 * - `range === undefined` → `undefined` (ไม่กรอง = เอาทั้งหมด)
 * - ปกติฐาน = `startOfDay` (ตี 0 ของ `now`) → เวลาในวันไม่มีผล
 * - `now` รับเข้าเพื่อเทสตายตัว (default = เวลาปัจจุบัน)
 *
 * คืนเป็น fragment ไม่ผูกฟิลด์ → caller ใส่ลงใน `createdAt` / `purchaseDate` ฟิลด์ไหนก็ได้
 */
export function parseDateRange(
  range: DateRange | undefined,
  now: Date = new Date()
): PrismaDateFilter | undefined {
  if (range === undefined) {
    return undefined;
  }

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return { gte: startOfDay };
    case "7days": {
      const sevenDaysAgo = new Date(startOfDay);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return { gte: sevenDaysAgo };
    }
    case "1month": {
      const oneMonthAgo = new Date(startOfDay);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return { gte: oneMonthAgo };
    }
  }
}
