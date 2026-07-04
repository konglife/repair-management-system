# Triage Labels

skill ต่างๆ พูดในแง่ของ **5 canonical triage roles** ไฟล์นี้ map role เหล่านั้นเป็น label string จริงที่ใช้ใน GitHub Issues ของ repo นี้ (สร้างโดย `/setup-matt-pocock-skills`)

| Role ใน mattpocock/skills | Label ใน tracker เรา | ความหมาย |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | maintainer ต้องประเมิน issue นี้ |
| `needs-info` | `needs-info` | รอผู้แจ้งเพิ่มข้อมูล |
| `ready-for-agent` | `ready-for-agent` | สเปกครบ พร้อมให้ AFK agent หยิบทำ |
| `ready-for-human` | `ready-for-human` | ต้องคนทำ (judgment / ทำมือ) |
| `wontfix` | `wontfix` | จะไม่ดำเนินการ |

เมื่อ skill พูดถึง role (เช่น "apply the AFK-ready triage label") ให้ใช้ label string จากคอลัมน์ขวา

> repo นี้ใช้ค่า default (label = ชื่อ role) ถ้าภายหลังอยากเปลี่ยนคำศัพท์ (เช่น `bug:triage`) ให้แก้คอลัมน์ขวา แล้วสร้าง label จริงบน GitHub ให้ตรง

## Category labels (เสริม)

skill ยังใช้ category role 2 ตัว ปัจจุบันไม่ได้ map เป็น label แยก — แนะนำให้ใช้ GitHub label มาตรฐาน `bug` และ `enhancement` ควบคู่กับ state label ด้านบน (issue หนึ่งควรมี category + state อย่างละตัว)
