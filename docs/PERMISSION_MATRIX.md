# Permission Matrix — ISME Mentoring Platform

## Roles

| Role | Description |
|---|---|
| `admin` | Full access to everything |
| `program_manager` | Manages programs, matches, similar to admin |
| `facilitator` | Supports mentorship groups, scoped to assigned programs |
| `mentor` | Manages their mentees, scoped to own matches |
| `mentee` | Self-management, scoped to own data |
| `manager` | View-only reports and analytics |

## Permission Matrix

### Identity & Access

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Create user | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit any user | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Program Management

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Create program cycle | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit program cycle | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View program cycles | ✅ | ✅ | ✅ | own scope | ❌ | ❌ |
| Assign facilitator | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Mentorship / Match

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Create mentorship | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View mentorship list | ✅ all | ✅ all | ✅ all | own scope | own match | own match |
| View mentorship detail | ✅ | ✅ | ✅ | own scope | own match | own match |
| Change match status | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Goals

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View goals | ✅ | ✅ | ✅ | own scope | own match | own match |
| Create goal | ✅ | ✅ | ❌ | ❌ | own match | own match |
| Update progress | ✅ | ✅ | ❌ | ❌ | own match | own match |
| Confirm goal | ✅ | ✅ | ❌ | ❌ | own match only | ❌ |
| Delete goal | ✅ | ✅ | ❌ | ❌ | own match | own (unconfirmed) |

### Tasks (TodoItem)

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View own tasks | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ own |
| Create task | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ own |
| Update task | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ own |
| Delete task | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ own |

### Meetings

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Create meeting | ✅ | ✅ | ❌ | own scope | own match | ❌ |
| View meetings | ✅ | ✅ | ✅ | own scope | own match | own match |
| Update meeting | ✅ | ✅ | ❌ | ❌ | own match (creator) | ❌ |
| Check-in | ✅ | ✅ | ❌ | ❌ | own match | own match |

### Feedback

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Submit feedback | ✅ | ✅ | ❌ | ❌ | own match | own match |
| View received feedback | ✅ all | ❌ | ❌ | ❌ | ✅ own | ✅ own |
| View given feedback | ✅ all | ❌ | ❌ | ❌ | ✅ own | ✅ own |

### Evaluation

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Create eval form | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Submit response | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| View responses | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| List mentees for eval | ✅ all | ✅ all | ✅ all | own scope | own mentees | ❌ |

### Reports

| Action | admin | program_manager | manager | facilitator | mentor | mentee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View own stats | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View other's stats | ✅ | ✅ | ✅ | own scope | ❌ | ❌ |
| View program progress | ✅ | ✅ | ✅ | own scope | ❌ | ✅ own |
| Export data | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

## Scope Definitions

| Scope | Meaning |
|---|---|
| `all` | Access to all records |
| `own` | Only user's own data |
| `own match` | Only data within user's mentorship(s) |
| `own scope` | Only data within assigned programs/mentorships |
| `own (unconfirmed)` | Only own unconfirmed records |
