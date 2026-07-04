# Issue tracker: GitHub

Issues และ PRD ของ repo นี้เก็บเป็น **GitHub issues** บน `github.com/konglife/repair-management-system` ใช้ `gh` CLI ในทุก operation (สร้าง / setup โดย `/setup-matt-pocock-skills`)

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."` ใช้ heredoc สำหรับ body หลายบรรทัด
- **Read an issue**: `gh issue view <number> --comments` (filter comment ด้วย `jq` + ดึง labels)
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` พร้อม `--label` / `--state` ที่เหมาะสม
- **Comment**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

`gh` อนุมาน repo จาก `git remote` อัตโนมัติเมื่อรันใน clone

## Pull requests as a triage surface

**PRs as a request surface: no.** — repo นี้เป็น single-user app (ร้านซ่อม), ไม่รับ feature request ผ่าน external PR

ถ้าเปลี่ยนใจเป็น `yes` ภายหลัง → `/triage` จะดึง external PR เข้าคิวเดียวกับ issue ผ่าน `gh pr` equivalents และใช้ number space ร่วมกัน (`#42` อาจเป็น issue หรือ PR ก็ได้ → resolve ด้วย `gh pr view 42` แล้ว fallback `gh issue view 42`)

## เมื่อ skill บอก "publish to the issue tracker"

สร้าง GitHub issue (`gh issue create`)

## เมื่อ skill บอก "fetch the relevant ticket"

รัน `gh issue view <number> --comments`

## หมายเหตุเฉพาะ repo นี้

- repo link กับ Vercel project 2 ตัว (`main`=prod, `develop`=dev) — แต่ GitHub Issues ใช้ชุดเดียวกันของ repo
- กฎเหล็ก: ห้าม push/merge ไป `main` — issue/PR flow ทำบน `develop` หรือ feature branch เท่านั้น
