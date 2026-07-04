# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker (GitHub Issues on `konglife/repair-management-system`).

We use the **default** vocabulary — each role's label string equals its name.

## Triage state labels

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

## Category labels

In addition to the triage state, every issue gets one **category** label:

- `bug` — something is broken or behaves incorrectly
- `enhancement` — new feature or improvement to existing functionality

## Bootstrapping labels in the repo

If a label doesn't exist yet, create it once:

```bash
gh label create needs-triage --color BFD4F2
gh label create needs-info --color FBCA04
gh label create ready-for-agent --color 0E8A16
gh label create ready-for-human --color 5319E7
gh label create wontfix --color FFFFFF
# bug / enhancement are GitHub defaults and usually already exist
```

Edit the right-hand column above to match whatever vocabulary you actually use.
