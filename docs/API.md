# API Documentation

**OPT Plus Digital System** — RESTful endpoints for internal and external consumers.

## Base URL

```
https://your-domain.com
```

All routes are behind authentication (`auth:sanctum` in the future) and authorization gates.

---

## Authentication

Currently all routes use Inertia-based session authentication. API token auth is planned.

---

## OPT Sessions

### List Sessions

```http
GET /opt-sessions
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter: `scheduled`, `in_progress`, `completed`, `cancelled` |
| `year` | integer | Filter by year (e.g., `2026`) |
| `page` | integer | Page number for pagination |

**Response:** Inertia page component `opt-sessions/index`

### Create Session

```http
POST /opt-sessions
```

| Field | Type | Required | Description |
|---|---|---|---|
| `barangay_id` | string | ✅ | Barangay UUID |
| `name` | string | ✅ | Session name |
| `session_date` | date | ✅ | Month/year (e.g., `2026-06-15`) |
| `start_date` | date | ❌ | Actual start date |
| `end_date` | date | ❌ | Actual end date |
| `target_children` | integer | ❌ | Auto-calculated if omitted |
| `venue` | string | ❌ | Location |
| `notes` | string | ❌ | Additional notes |

### Get Session

```http
GET /opt-sessions/{id}
```

**Response:** Inertia page with session details, stats, and recent measurements (deferred).

### Start Session

```http
POST /opt-sessions/{id}/start
```
Transitions status from `scheduled` → `in_progress`.

### Complete Session

```http
POST /opt-sessions/{id}/complete
```
Transitions status from `in_progress` → `completed`. Updates statistics.

### Cancel Session

```http
POST /opt-sessions/{id}/cancel
```
Transitions any non-completed session to `cancelled`.

### Duplicate Session

```http
POST /opt-sessions/{id}/duplicate
```
Creates a new session copying: barangay, target_children, venue, notes. Adds "(Copy)" suffix.

### Batch Operations

```http
POST /opt-sessions/batch/start
POST /opt-sessions/batch/complete
POST /opt-sessions/batch/cancel
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ids` | array | ✅ | Array of session UUIDs |

### Quick Measurement (In-Session)

```http
POST /opt-sessions/{id}/measurements/quick
```

| Field | Type | Required | Description |
|---|---|---|---|
| `child_id` | string | ✅ | Child UUID |
| `opt_session_id` | string | ✅ | Session UUID |
| `measurement_date` | date | ✅ | Must be today or earlier |
| `weight_kg` | float | ✅ | 1.0 – 30.0 |
| `height_length_cm` | float | ✅ | 40.0 – 125.0 |
| `muac_cm` | float | ❌ | Mid-upper arm circumference |
| `has_edema` | boolean | ❌ | Edema present |
| `notes` | string | ❌ | 500 char max |

Z-scores and classification are calculated automatically via WHO standards.

### Available Children for Session

```http
GET /opt-sessions/{id}/children-available
```

**Response:** JSON array of children not yet measured in this session.

```json
{
  "children": [
    { "id": "uuid", "full_name": "Juan Dela Cruz", "sex": "male", "date_of_birth": "2023-06-15" }
  ]
}
```

---

## Children

### List Children

```http
GET /children
```

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name, FSN, or QR code |
| `barangay_id` | string | Filter by barangay |
| `is_indigenous_people` | integer | `1` or `0` |
| `page` | integer | Pagination |

### Create Child

```http
POST /children
```

| Field | Type | Required | Description |
|---|---|---|---|
| `family_serial_number` | string | ✅ | Unique identifier |
| `first_name` | string | ✅ | |
| `last_name` | string | ✅ | |
| `middle_name` | string | ❌ | |
| `sex` | string | ✅ | `male` or `female` |
| `date_of_birth` | date | ✅ | Must be before today |
| `address` | string | ✅ | |
| `barangay_id` | string | ✅ | Valid barangay UUID |
| `mother_caregiver_name` | string | ✅ | |
| `father_name` | string | ❌ | |
| `contact_number` | string | ❌ | |
| `is_indigenous_people` | boolean | ❌ | Default: false |
| `purok_sitio` | string | ❌ | |

### Get Child

```http
GET /children/{id}
```

### Update Child

```http
PUT /children/{id}
```

### Delete Child

```http
DELETE /children/{id}
```

### Search Duplicates

```http
POST /children/search-duplicates
```

---

## Measurements

Measurements are nested under children:

```http
GET    /children/{id}/measurements
POST   /children/{id}/measurements
GET    /children/{id}/measurements/{id}
PUT    /children/{id}/measurements/{id}
DELETE /children/{id}/measurements/{id}
```

### Z-Score Calculation

Measurements automatically compute WHO z-scores and classifications:

| Z-Score | Field |
|---|---|
| Weight-for-Age | `weight_for_age_zscore` |
| Height-for-Age | `height_for_age_zscore` |
| Weight-for-Height | `weight_for_height_zscore` |

### Classification

| Value | Meaning |
|---|---|
| `sam` | Severe Acute Malnutrition |
| `mam` | Moderate Acute Malnutrition |
| `normal` | Normal |
| `overweight` | Overweight |
| `obese` | Obese |

### DQC Certification

```http
POST /dqc/measurements/{id}/certify
POST /dqc/measurements/{id}/reject
```

---

## Users

```http
GET    /users
POST   /users
GET    /users/{id}
PUT    /users/{id}
DELETE /users/{id}
POST   /users/{id}/toggle-status
```

---

## Reports

### Available Reports

```http
GET  /reports/opt-summary
GET  /reports/master-list
GET  /reports/target-list
GET  /reports/barangay-comparison
GET  /reports/f1k-list
GET  /reports/monitoring-list/{type}
GET  /reports/nut-status-brgy
GET  /reports/muac-list
GET  /reports/form-1c
```

### Report Exports

```http
GET  /reports/export/opt-summary/pdf
GET  /reports/export/opt-summary/excel
GET  /reports/export/master-list/pdf
GET  /reports/export/master-list/excel
GET  /reports/export/target-list/pdf
GET  /reports/export/target-list/excel
```

### Scheduled Reports

```http
GET  /reports/scheduled
GET  /reports/scheduled/{id}/download
```

---

## Import

```http
GET  /import
POST /import              (multipart Excel upload)
POST /import/validate     (validate before import)
GET  /import/template     (download template)
```

---

## Notifications

```http
GET    /notifications
POST   /notifications/{id}/read
POST   /notifications/mark-all-read
GET    /notifications/{id}/redirect
```

### Notification Preferences

```http
GET  /settings/notifications
PUT  /settings/notification-preferences/{id}
```

---

## Data Quality Control

```http
GET  /dqc
POST /dqc/measurements/{id}/certify
POST /dqc/measurements/{id}/reject
GET  /dqc/export/summary
```

---

## Dashboard & Analytics

```http
GET  /dashboard
GET  /analytics/barangay/{id}
```

---

## Mass Mail

```http
GET  /mass-mail
GET  /mass-mail/create
POST /mass-mail/preview-recipients
POST /mass-mail
GET  /mass-mail/{id}
```

---

## Audit Logs

```http
GET  /audit-logs
GET  /audit-logs/{id}
```

---

## Offline Sync

```http
POST /api/measurements/sync
```

Syncs offline-captured measurements from the IndexedDB buffer on the client.

---

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 302 | Redirect (with flash message in session) |
| 403 | Forbidden — insufficient permissions |
| 404 | Not found |
| 422 | Validation error |

---

## Authentication & Authorization

All endpoints require:
1. Authenticated session (Laravel Sanctum/Fortify)
2. Appropriate permission via Spatie permission system

| Permission | Access |
|---|---|
| `view children` | List and view children |
| `create children` | Create, edit, delete children |
| `view measurements` | View measurements |
| `create measurements` | Record measurements |
| `view reports` | View report pages |
| `export reports` | Download PDF/Excel exports |
| `view analytics` | View dashboard |
| `manage users` | User CRUD and role management |
| `view audit logs` | View audit trails |
| `send mass mail` | Send bulk email |
