# OPT Plus Digital - Complete System Specification

## Document Information

| Property | Value |
|----------|-------|
| **Document Version** | 2.0 |
| **Created** | January 20, 2026 |
| **Status** | Planning |
| **Source File** | A.BonifacioJan.2026.ver2.xlsx |
| **Tool Version** | e-OPT+ Version 2 (July 2024) |

---

## 1. Executive Summary

This document provides the complete specification for converting the **e-OPT+ (Electronic Operation Timbang Plus)** Excel-based nutrition surveillance tool into a modern web application. The OPT Plus program is a critical Philippine government initiative for monitoring the nutritional status of children aged 0-59 months.

### 1.1 Current State (Excel Tool)

- Manual data entry in Excel spreadsheets
- Complex formulas for WHO z-score calculations using age in **days** for precision
- Multiple interconnected worksheets (22 sheets)
- Manual report generation
- No real-time collaboration
- Risk of data loss and version conflicts
- Sequential location encoding requirement
- Measurement method selection (Weight+Height OR MUAC)

### 1.2 Target State (Web Application)

- Centralized database with real-time access
- Automated nutritional status calculations
- Role-based access control (BNS, MNO, Admin)
- Offline-capable PWA for field workers
- Automated report generation
- Data validation and quality checks
- Multi-barangay/municipal dashboard support

### 1.3 Target Users

| Role | Description | Access Level |
|------|-------------|--------------|
| **BNS** | Barangay Nutrition Scholar - Primary data encoder | Own barangay only |
| **BHW** | Barangay Health Worker - Field support | View own barangay |
| **MNO** | Municipal Nutrition Officer - Consolidation | All barangays in municipality |
| **Admin** | System Administrator | Full access |

---

## 2. Excel Tool Analysis

### 2.1 Workbook Structure

The e-OPT+ Excel tool contains **22 worksheets**, organized by function:

#### Core Data Sheets

| Sheet Name | Type | Purpose | Web Equivalent |
|------------|------|---------|----------------|
| **Nut_StatusTool** | Data Entry | Primary data entry - all child info encoded here | Children CRUD + Measurements module |
| **Instructions** | Reference | User guide, rules, acronyms | Help/Documentation page |

#### Report Sheets

| Sheet Name | Type | Purpose | Web Equivalent |
|------------|------|---------|----------------|
| **OPT Plus Form 1A** | Report | Master list of children eligible for next visit | Printable master list |
| **OPT Plus Form 1B** | Report | Main summary - counts and prevalence rates | Dashboard/Summary reports |
| **OPT Plus Form 1C** | Report | List of affected/at-risk children | Priority intervention list |
| **NutStatusBrgy** | Report | Sex-disaggregated summary tables | Barangay-level presentations |
| **DQC Summary** | QA | Data Quality Check - distribution & digit preference | Validation/DQC module |
| **Graphs** | Visualization | Auto-generated prevalence charts | Dashboard charts |

#### Monitoring & Tracking Sheets

| Sheet Name | Purpose | Target Group |
|------------|---------|--------------|
| **List of 0-23 mos** | First 1000 Days monitoring | Children 0-23 months (F1K) |
| **List_MW(MAM)** | Moderate Acute Malnutrition | Children with MAM |
| **List_SW(SAM)** | Severe Acute Malnutrition | Children with SAM |
| **List_MSt&SSt** | Stunted children monitoring | Moderately & Severely Stunted |
| **List_OW&Ob** | Overnutrition monitoring | Overweight & Obese |
| **List_MUW,SUW,MSt&SSt** | Combined undernutrition | Multiple conditions |
| **List_MSt,SSt,MW&SW** | Combined categories | Stunting + Wasting |
| **List_MSt,SSt,OW&Ob** | Combined categories | Stunting + Overnutrition |
| **List of MUAC** | MUAC measurements | MUAC-based assessment |

#### Export & Reference Sheets

| Sheet Name | Purpose | Web Equivalent |
|------------|---------|----------------|
| **Data-Export** | Formatted rows for municipal consolidation | Export module |
| **Region4B** | Regional reference data | Config/Settings |
| **List** | Dropdown values | Database seeds |
| **Male** | WHO Z-score standards (male) | who_standards table |
| **Female** | WHO Z-score standards (female) | who_standards table |

### 2.2 File Naming Convention

```
[BarangayName][Month].[Year].[Version].xlsx
```

**Example**: `A.BonifacioJan.2026.ver2.xlsx`
- Barangay: A. Bonifacio
- Month: January
- Year: 2026
- Version: 2

---

## 3. Data Fields Specification

### 3.1 Input Fields (User-Encoded)

| Field | Type | Format | Validation | Description |
|-------|------|--------|------------|-------------|
| **Location** | String | Text | Required | Address, Purok, or Block |
| **Caregiver** | String | "SURNAME, First Name" | Required | Name of Mother/Caregiver |
| **Child Name** | String | "SURNAME, First Name" | Required | Full Name of Child |
| **IP Status** | Boolean | YES/NO | Default: NO | Indigenous People Group |
| **Sex** | Enum | M/F | Required | Child's gender |
| **Date of Birth** | Date | MM/DD/YYYY | Required, ≤ today | Birth date |
| **Date Measured** | Date | MM/DD/YYYY | Required, ≥ DOB | Measurement date |
| **Weight** | Decimal | kg (1 decimal) | 0.5 - 50.0 | Measured weight |
| **Height/Length** | Decimal | cm (1 decimal) | 30.0 - 150.0 | Height (standing) or Length (lying) |
| **Edema** | Enum | NONE, +1, +2, +3 | Default: NONE | Bilateral Pitting Edema |
| **Disability** | Boolean | YES/NO | Default: NO | Presence of disability |
| **MUAC** | Decimal | cm (1 decimal) | 5.0 - 30.0 | Mid-Upper Arm Circumference |

### 3.2 Calculated Fields (Auto-Generated)

| Field | Calculation | Description |
|-------|-------------|-------------|
| **Age in Days** | `measurement_date - date_of_birth` | Primary age for WHO lookup |
| **Age in Months** | `FLOOR(age_in_days / 30.4375)` | For reporting/display |
| **WFA Z-Score** | LMS lookup from WHO tables | Weight-for-Age SD |
| **HFA Z-Score** | LMS lookup from WHO tables | Height-for-Age SD |
| **WFH Z-Score** | LMS lookup from WHO tables | Weight-for-Height SD |
| **WFA Status** | Based on WFA Z-score | N, MUW, SUW |
| **HFA Status** | Based on HFA Z-score | N, T, MSt, SSt |
| **WFH Status** | Based on WFH Z-score | N, MW, SW, OW, Ob |
| **MUAC Status** | Based on MUAC value | N, MAM, SAM |

### 3.3 Database Column Mapping

#### Children Table

| Excel Field | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| - | `id` | BigInt | Auto-increment PK |
| - | `barangay_id` | FK | Required |
| Child Name (Surname) | `last_name` | String | Extracted from full name |
| Child Name (First) | `first_name` | String | Extracted from full name |
| - | `full_name` | Virtual | `CONCAT(last_name, ', ', first_name)` |
| Date of Birth | `date_of_birth` | Date | Required |
| Sex | `sex` | Enum(M,F) | Required |
| Caregiver | `guardian_name` | String | Required |
| Location | `address` | String | Optional |
| Location (Purok) | `purok` | String | Optional |
| IP Status | `is_indigenous` | Boolean | Default: false |
| - | `is_active` | Boolean | Default: true |
| - | `notes` | Text | Optional |

#### Measurements Table

| Excel Field | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| - | `id` | BigInt | Auto-increment PK |
| - | `child_id` | FK | Required |
| - | `recorded_by` | FK (users) | Nullable |
| Date Measured | `measurement_date` | Date | Required |
| Weight | `weight` | Decimal(5,2) | kg |
| Height/Length | `height` | Decimal(5,2) | cm |
| - | `measurement_type` | Enum | 'length' or 'height' |
| MUAC | `muac` | Decimal(4,2) | cm, nullable |
| Edema | `has_edema` | Boolean | Default: false |
| Edema Grade | `edema_grade` | Enum(+1,+2,+3) | Nullable |
| Disability | `has_disability` | Boolean | Default: false |
| - | `disability_notes` | Text | Nullable |
| **Calculated** | | | |
| Age in Days | `age_in_days` | Integer | Calculated |
| Age in Months | `age_in_months` | Integer | Calculated |
| WFA Z-Score | `wfa_zscore` | Decimal(5,2) | Nullable |
| HFA Z-Score | `hfa_zscore` | Decimal(5,2) | Nullable |
| WFH Z-Score | `wfh_zscore` | Decimal(5,2) | Nullable |
| WFA Status | `weight_for_age` | Enum(N,MUW,SUW) | Nullable |
| HFA Status | `height_for_age` | Enum(T,N,MSt,SSt) | Nullable |
| WFH Status | `weight_for_height` | Enum(Ob,OW,N,MW,SW) | Nullable |
| MUAC Status | `muac_status` | Enum(N,MAM,SAM) | Nullable |
| - | `is_flagged` | Boolean | Z-score outside ±6 |

---

## 4. Nutritional Status Classifications

### 4.1 Weight-for-Age (WFA)

| Status | Code | Z-Score Range | Description |
|--------|------|---------------|-------------|
| Normal | N | ≥ -2 SD | Adequate weight for age |
| Moderately Underweight | MUW | < -2 SD to ≥ -3 SD | Moderate undernutrition |
| Severely Underweight | SUW | < -3 SD | Severe undernutrition |

### 4.2 Height-for-Age (HFA)

| Status | Code | Z-Score Range | Description |
|--------|------|---------------|-------------|
| Tall | T | > +2 SD | Above normal height |
| Normal | N | -2 SD to +2 SD | Normal height for age |
| Moderately Stunted | MSt | < -2 SD to ≥ -3 SD | Chronic malnutrition |
| Severely Stunted | SSt | < -3 SD | Severe chronic malnutrition |

### 4.3 Weight-for-Length/Height (WFH)

| Status | Code | Z-Score Range | Description |
|--------|------|---------------|-------------|
| Obese | Ob | > +3 SD | Severe overnutrition |
| Overweight | OW | > +2 SD to ≤ +3 SD | Overnutrition |
| Normal | N | -2 SD to +2 SD | Normal weight for height |
| Moderately Wasted (MAM) | MW | < -2 SD to ≥ -3 SD | Moderate Acute Malnutrition |
| Severely Wasted (SAM) | SW | < -3 SD | Severe Acute Malnutrition |

### 4.4 MUAC Classification (6-59 months only)

| Status | Code | Measurement | Description |
|--------|------|-------------|-------------|
| Normal | N | ≥ 12.5 cm | Adequate nutrition |
| Moderate Acute Malnutrition | MAM | 11.5 - 12.4 cm | Moderate wasting |
| Severe Acute Malnutrition | SAM | < 11.5 cm | Severe wasting |

### 4.5 Acronyms Reference

| Acronym | Full Term | Meaning |
|---------|-----------|---------|
| **F1K** | First 1000 Days | Children 0-23 months (critical intervention window) |
| **IP** | Indigenous Peoples | Ethnic minority groups |
| **MUAC** | Mid-Upper Arm Circumference | Alternative acute malnutrition measure |
| **OPT** | Operation Timbang | Annual weighing/measuring activity |
| **BNS** | Barangay Nutrition Scholar | Primary field worker |
| **MNO** | Municipal Nutrition Officer | Municipal coordinator |

---

## 5. Business Logic and Rules

### 5.1 Sequential Location Encoding

Users must fill location fields in order (required for data entry to unlock):

```
1. Region (required first)
       ↓
2. Province (required second)
       ↓
3. Municipality (required third)
       ↓
4. Barangay (required fourth)
       ↓
5. Child data entry (now enabled)
```

### 5.2 Measurement Method Selection

The tool requires users to select ONE measurement method:

| Method | Required Fields | When Used |
|--------|-----------------|-----------|
| **Weight + Length/Height** | Weight, Height | Standard assessment |
| **MUAC Only** | MUAC | Rapid screening, emergencies |

**Business Rule**: When one method is selected, the other fields should be disabled/hidden.

### 5.3 Height vs Length Measurement

| Age Range | Method | Position |
|-----------|--------|----------|
| 0-23 months | Length | Lying down (recumbent) |
| 24-59 months | Height | Standing upright |

**Automatic Adjustment**: If length is measured for child ≥24 months, add 0.7 cm to convert to height equivalent.

### 5.4 Age Eligibility Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Eligible | 0-59 months | Include in all calculations |
| Overaged | ≥ 60 months | Flag as overaged, exclude from totals |
| Invalid | Negative age | Reject record |

### 5.5 Duplicate Detection

Duplicates are detected using concatenation of key fields:

```
Duplicate Key = CONCAT(ChildName, DateOfBirth, BarangayId)
```

**Action on Duplicate**:
- Warn user during data entry
- Highlight duplicate records in lists
- Prevent duplicate submission (optional)

### 5.6 Z-Score Flagging

| Condition | Action |
|-----------|--------|
| Z-score > +6 SD | Flag as outlier, require verification |
| Z-score < -6 SD | Flag as outlier, require verification |
| Missing data | Mark as incomplete |

### 5.7 Data Quality Control (DQC)

#### Terminal Digit Preference Analysis

Check for measurement bias by analyzing the distribution of decimal digits:

| Digit | Expected % | Alert If |
|-------|------------|----------|
| 0 | 10% | > 20% |
| 5 | 10% | > 20% |
| Other | 10% each | Uneven distribution |

**Purpose**: Detect if users are rounding measurements excessively.

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    provinces    │       │  municipalities │       │    barangays    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │───┐   │ id              │───┐   │ id              │
│ name            │   └──>│ province_id     │   └──>│ municipality_id │
│ psgc_code       │       │ name            │       │ name            │
│ region          │       │ psgc_code       │       │ psgc_code       │
└─────────────────┘       └─────────────────┘       │ population      │
                                                    └────────┬────────┘
                                                             │
                          ┌──────────────────────────────────┘
                          │
                          ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    children     │       │  measurements   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │◄──────│ id              │
│ name            │       │ barangay_id     │       │ child_id        │
│ email           │       │ first_name      │       │ measurement_date│
│ role            │       │ last_name       │       │ weight          │
│ barangay_id     │       │ date_of_birth   │       │ height          │
└─────────────────┘       │ sex             │       │ measurement_type│
                          │ guardian_name   │       │ muac            │
                          │ address         │       │ has_edema       │
                          │ purok           │       │ edema_grade     │
                          │ is_indigenous   │       │ has_disability  │
                          │ is_active       │       │ recorded_by     │
                          └─────────────────┘       │ -- Calculated --│
                                                    │ age_in_days     │
                                                    │ age_in_months   │
                                                    │ wfa_zscore      │
                                                    │ hfa_zscore      │
                                                    │ wfh_zscore      │
                                                    │ weight_for_age  │
                                                    │ height_for_age  │
                                                    │ weight_for_height│
                                                    │ muac_status     │
                                                    │ is_flagged      │
                                                    └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  who_standards  │       │   opt_sessions  │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ indicator       │       │ barangay_id     │
│ sex             │       │ session_date    │
│ age_days        │       │ status          │
│ length_cm       │       │ children_count  │
│ l_value         │       │ created_by      │
│ m_value         │       └─────────────────┘
│ s_value         │
└─────────────────┘
```

### 6.2 Migration Files

#### Children Table

```php
Schema::create('children', function (Blueprint $table) {
    $table->id();
    $table->foreignId('barangay_id')->constrained()->cascadeOnDelete();
    $table->string('first_name');
    $table->string('last_name');
    $table->string('full_name')->virtualAs("CONCAT(last_name, ', ', first_name)");
    $table->date('date_of_birth');
    $table->enum('sex', ['M', 'F']);
    $table->string('guardian_name');
    $table->string('address')->nullable();
    $table->string('purok')->nullable();
    $table->boolean('is_indigenous')->default(false);
    $table->boolean('is_active')->default(true);
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->softDeletes();
    
    $table->index(['barangay_id', 'is_active']);
    $table->index('date_of_birth');
    // Duplicate detection index
    $table->unique(['barangay_id', 'first_name', 'last_name', 'date_of_birth'], 'unique_child');
});
```

#### Measurements Table

```php
Schema::create('measurements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('child_id')->constrained()->cascadeOnDelete();
    $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
    $table->date('measurement_date');
    
    // Measurement method
    $table->enum('measurement_method', ['weight_height', 'muac_only'])->default('weight_height');
    
    // Physical measurements
    $table->decimal('weight', 5, 2)->nullable();        // kg: 0.00 - 999.99
    $table->decimal('height', 5, 2)->nullable();        // cm: 0.00 - 999.99
    $table->enum('measurement_type', ['length', 'height'])->nullable(); // lying vs standing
    $table->decimal('muac', 4, 2)->nullable();          // cm: 0.00 - 99.99
    
    // Health indicators
    $table->boolean('has_edema')->default(false);
    $table->enum('edema_grade', ['+1', '+2', '+3'])->nullable();
    $table->boolean('has_disability')->default(false);
    $table->text('disability_notes')->nullable();
    
    // Calculated fields (stored for performance)
    $table->integer('age_in_days');                     // Primary age calculation
    $table->integer('age_in_months');                   // For display/reporting
    
    // Z-scores
    $table->decimal('wfa_zscore', 5, 2)->nullable();
    $table->decimal('hfa_zscore', 5, 2)->nullable();
    $table->decimal('wfh_zscore', 5, 2)->nullable();
    
    // Nutritional status classifications
    $table->enum('weight_for_age', ['N', 'MUW', 'SUW'])->nullable();
    $table->enum('height_for_age', ['T', 'N', 'MSt', 'SSt'])->nullable();
    $table->enum('weight_for_height', ['Ob', 'OW', 'N', 'MW', 'SW'])->nullable();
    $table->enum('muac_status', ['N', 'MAM', 'SAM'])->nullable();
    
    // Data quality flags
    $table->boolean('is_flagged')->default(false);      // Z-score outside ±6
    $table->boolean('is_overaged')->default(false);     // Age ≥ 60 months
    $table->text('flag_reason')->nullable();
    
    $table->timestamps();
    
    $table->index(['child_id', 'measurement_date']);
    $table->index('measurement_date');
    $table->index('is_flagged');
});
```

#### WHO Standards Table

```php
Schema::create('who_standards', function (Blueprint $table) {
    $table->id();
    $table->enum('indicator', ['wfa', 'hfa', 'wfl', 'wfh']); // weight-for-age, height-for-age, etc.
    $table->enum('sex', ['M', 'F']);
    $table->integer('age_days')->nullable();            // For age-based indicators
    $table->decimal('length_cm', 5, 2)->nullable();     // For length/height-based indicators
    $table->decimal('l_value', 10, 8);                  // L (power in Box-Cox)
    $table->decimal('m_value', 10, 8);                  // M (median)
    $table->decimal('s_value', 10, 8);                  // S (coefficient of variation)
    
    $table->index(['indicator', 'sex', 'age_days']);
    $table->index(['indicator', 'sex', 'length_cm']);
});
```

---

## 7. Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA ENTRY                                  │
│  ┌─────────────────┐                                                    │
│  │  Web Form       │  Child demographics + Measurements                 │
│  │  (Nut_StatusTool│                                                    │
│  │   equivalent)   │                                                    │
│  └────────┬────────┘                                                    │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             VALIDATION                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  Required Fields│  │  Duplicates     │  │  Range Checks   │         │
│  │  - Name         │  │  - Name + DOB   │  │  - Age 0-59 mos │         │
│  │  - DOB          │  │  - Same barangay│  │  - Weight range │         │
│  │  - Sex          │  │                 │  │  - Height range │         │
│  │  - Weight/MUAC  │  │                 │  │  - MUAC range   │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             PROCESSING                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  Age Calculation│  │  WHO Z-Score    │  │  Status         │         │
│  │  - Age in days  │  │  - LMS method   │  │  Classification │         │
│  │  - Age in months│  │  - WFA, HFA, WFH│  │  - Underweight  │         │
│  │  - Overaged flag│  │  - Flagging ±6  │  │  - Stunted      │         │
│  └─────────────────┘  └─────────────────┘  │  - Wasted       │         │
│                                            │  - Overweight   │         │
│                                            └─────────────────┘         │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              STORAGE                                     │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │  Children Table │  │  Measurements   │                               │
│  │  - Demographics │  │  - Raw values   │                               │
│  │  - Status: active│ │  - Z-scores     │                               │
│  └─────────────────┘  │  - Status codes │                               │
│                       └─────────────────┘                               │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ├──────────────────────────────────────────────────────────────┐
            │                                                              │
            ▼                                                              ▼
┌───────────────────────────────┐                    ┌───────────────────────────────┐
│         REPORTS               │                    │      MONITORING LISTS         │
│  ┌─────────────────┐          │                    │  ┌─────────────────┐          │
│  │ Form 1A         │          │                    │  │ 0-23 Months     │ F1K      │
│  │ (Master List)   │          │                    │  │ (First 1000 Days│          │
│  └─────────────────┘          │                    │  └─────────────────┘          │
│  ┌─────────────────┐          │                    │  ┌─────────────────┐          │
│  │ Form 1B         │          │                    │  │ MAM Children    │ ⚠️       │
│  │ (Summary Stats) │          │                    │  │ (Moderate Acute)│          │
│  └─────────────────┘          │                    │  └─────────────────┘          │
│  ┌─────────────────┐          │                    │  ┌─────────────────┐          │
│  │ Form 1C         │          │                    │  │ SAM Children    │ 🚨       │
│  │ (Affected List) │          │                    │  │ (Severe Acute)  │          │
│  └─────────────────┘          │                    │  └─────────────────┘          │
│  ┌─────────────────┐          │                    │  ┌─────────────────┐          │
│  │ NutStatusBrgy   │          │                    │  │ Stunted Children│          │
│  │ (Sex-disagg.)   │          │                    │  │ (MSt + SSt)     │          │
│  └─────────────────┘          │                    │  └─────────────────┘          │
└───────────────────────────────┘                    │  ┌─────────────────┐          │
            │                                        │  │ Overweight/Obese│          │
            ▼                                        │  │ (OW + Ob)       │          │
┌───────────────────────────────┐                    │  └─────────────────┘          │
│         EXPORT                │                    └───────────────────────────────┘
│  ┌─────────────────┐          │
│  │ Data-Export     │          │
│  │ (Municipal DB)  │          │
│  └─────────────────┘          │
│  ┌─────────────────┐          │
│  │ Excel/CSV       │          │
│  │ (Analysis)      │          │
│  └─────────────────┘          │
│  ┌─────────────────┐          │
│  │ PDF Reports     │          │
│  │ (Printing)      │          │
│  └─────────────────┘          │
└───────────────────────────────┘
```

---

## 8. Technical Architecture

### 8.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Vue.js 3 + Inertia.js | SPA-like experience, already in project |
| **UI Components** | Tailwind CSS + shadcn/ui | Modern, accessible components |
| **Backend** | Laravel 11 | Robust PHP framework, already in project |
| **Database** | MySQL 8.0 | Production-ready, good Laravel support |
| **Caching** | Redis | Session, cache, queue management |
| **File Storage** | Local / S3 | Excel imports, report exports |
| **PWA** | Workbox | Offline capability |
| **Charts** | Chart.js / ApexCharts | Dashboard visualizations |
| **Excel** | PhpSpreadsheet | Import/Export Excel files |
| **PDF** | DomPDF / Snappy | Report generation |

### 8.2 Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Application                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Vue.js    │  │  Inertia    │  │   Laravel   │             │
│  │  Frontend   │◄─┤   Bridge    ├─►│   Backend   │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
│                                           │                     │
│  ┌────────────────────────────────────────┴────────────────────┐│
│  │                      Service Layer                          ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        ││
│  │  │ NutritionSvc │ │  ImportSvc   │ │  ReportSvc   │        ││
│  │  │              │ │              │ │              │        ││
│  │  │ - Calculate  │ │ - Parse Excel│ │ - Generate   │        ││
│  │  │   z-scores   │ │ - Validate   │ │   Excel      │        ││
│  │  │ - Classify   │ │ - Map fields │ │ - Generate   │        ││
│  │  │   status     │ │ - Batch save │ │   PDF        │        ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘        ││
│  │                                                             ││
│  │  ┌──────────────┐ ┌──────────────┐                         ││
│  │  │   DQCSvc     │ │  DashboardSvc│                         ││
│  │  │              │ │              │                         ││
│  │  │ - Digit pref │ │ - Stats      │                         ││
│  │  │ - Outliers   │ │ - Charts     │                         ││
│  │  │ - Duplicates │ │ - Alerts     │                         ││
│  │  └──────────────┘ └──────────────┘                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Data Layer                              ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        ││
│  │  │    Models    │ │ WHO Tables   │ │   Cache      │        ││
│  │  │              │ │              │ │              │        ││
│  │  │ - Child      │ │ - wfa (days) │ │ - Redis      │        ││
│  │  │ - Measurement│ │ - hfa (days) │ │ - Sessions   │        ││
│  │  │ - Barangay   │ │ - wfl (cm)   │ │ - Dashboard  │        ││
│  │  │ - User       │ │ - wfh (cm)   │ │   stats      │        ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 WHO Z-Score Calculation Service

```php
<?php

namespace App\Services;

use App\Models\WhoStandard;
use Illuminate\Support\Facades\Cache;

class NutritionCalculatorService
{
    /**
     * Calculate z-score using LMS method
     * Z = ((value/M)^L - 1) / (L × S)
     * 
     * When L = 0: Z = ln(value/M) / S
     */
    public function calculateZScore(
        float $value,
        float $L,
        float $M,
        float $S
    ): float {
        if ($L == 0) {
            return log($value / $M) / $S;
        }
        
        return (pow($value / $M, $L) - 1) / ($L * $S);
    }
    
    /**
     * Calculate age in days from dates
     */
    public function calculateAgeInDays(
        \DateTimeInterface $dateOfBirth,
        \DateTimeInterface $measurementDate
    ): int {
        return $dateOfBirth->diff($measurementDate)->days;
    }
    
    /**
     * Calculate age in months from days
     */
    public function calculateAgeInMonths(int $ageInDays): int
    {
        return (int) floor($ageInDays / 30.4375);
    }
    
    /**
     * Check if child is overaged (≥ 60 months)
     */
    public function isOveraged(int $ageInDays): bool
    {
        return $ageInDays >= 1826; // 60 months * 30.4375 days
    }
    
    /**
     * Get LMS values from WHO reference tables
     */
    public function getLMSValues(
        string $indicator,
        int $ageDays,
        string $sex
    ): array {
        $cacheKey = "who_lms_{$indicator}_{$sex}_{$ageDays}";
        
        return Cache::remember($cacheKey, 86400, function () use ($indicator, $ageDays, $sex) {
            $standard = WhoStandard::where('indicator', $indicator)
                ->where('sex', $sex)
                ->where('age_days', $ageDays)
                ->first();
            
            if (!$standard) {
                throw new \Exception("WHO standard not found for {$indicator}, {$sex}, {$ageDays} days");
            }
            
            return [
                'L' => (float) $standard->l_value,
                'M' => (float) $standard->m_value,
                'S' => (float) $standard->s_value,
            ];
        });
    }
    
    /**
     * Get LMS values by height/length (for WFL/WFH)
     */
    public function getLMSValuesByHeight(
        string $indicator,
        float $height,
        string $sex
    ): array {
        // Round to nearest 0.5 cm for lookup
        $roundedHeight = round($height * 2) / 2;
        $cacheKey = "who_lms_{$indicator}_{$sex}_{$roundedHeight}";
        
        return Cache::remember($cacheKey, 86400, function () use ($indicator, $roundedHeight, $sex) {
            $standard = WhoStandard::where('indicator', $indicator)
                ->where('sex', $sex)
                ->where('length_cm', $roundedHeight)
                ->first();
            
            if (!$standard) {
                throw new \Exception("WHO standard not found for {$indicator}, {$sex}, {$roundedHeight} cm");
            }
            
            return [
                'L' => (float) $standard->l_value,
                'M' => (float) $standard->m_value,
                'S' => (float) $standard->s_value,
            ];
        });
    }
    
    /**
     * Get Weight-for-Age status
     */
    public function getWeightForAgeStatus(
        float $weight,
        int $ageDays,
        string $sex
    ): array {
        $lms = $this->getLMSValues('wfa', $ageDays, $sex);
        $zscore = $this->calculateZScore($weight, $lms['L'], $lms['M'], $lms['S']);
        
        $status = match(true) {
            $zscore < -3 => 'SUW',  // Severely Underweight
            $zscore < -2 => 'MUW',  // Moderately Underweight
            default => 'N',         // Normal
        };
        
        return [
            'zscore' => round($zscore, 2),
            'status' => $status,
            'is_flagged' => abs($zscore) > 6,
        ];
    }
    
    /**
     * Get Height-for-Age status
     */
    public function getHeightForAgeStatus(
        float $height,
        int $ageDays,
        string $sex
    ): array {
        $lms = $this->getLMSValues('hfa', $ageDays, $sex);
        $zscore = $this->calculateZScore($height, $lms['L'], $lms['M'], $lms['S']);
        
        $status = match(true) {
            $zscore > 2 => 'T',     // Tall
            $zscore < -3 => 'SSt',  // Severely Stunted
            $zscore < -2 => 'MSt',  // Moderately Stunted
            default => 'N',         // Normal
        };
        
        return [
            'zscore' => round($zscore, 2),
            'status' => $status,
            'is_flagged' => abs($zscore) > 6,
        ];
    }
    
    /**
     * Get Weight-for-Height status
     */
    public function getWeightForHeightStatus(
        float $weight,
        float $height,
        string $sex,
        string $measurementType = 'height'
    ): array {
        // Use length table for < 87cm OR if measured lying down
        // Use height table for >= 87cm OR if measured standing
        $indicator = ($height < 87 || $measurementType === 'length') ? 'wfl' : 'wfh';
        
        $lms = $this->getLMSValuesByHeight($indicator, $height, $sex);
        $zscore = $this->calculateZScore($weight, $lms['L'], $lms['M'], $lms['S']);
        
        $status = match(true) {
            $zscore > 3 => 'Ob',    // Obese
            $zscore > 2 => 'OW',    // Overweight
            $zscore < -3 => 'SW',   // Severely Wasted (SAM)
            $zscore < -2 => 'MW',   // Moderately Wasted (MAM)
            default => 'N',         // Normal
        };
        
        return [
            'zscore' => round($zscore, 2),
            'status' => $status,
            'is_flagged' => abs($zscore) > 6,
        ];
    }
    
    /**
     * Get MUAC status (simplified, no z-score)
     * Only applicable for children 6-59 months
     */
    public function getMUACStatus(float $muac, int $ageInMonths): ?string
    {
        // MUAC only applicable for 6-59 months
        if ($ageInMonths < 6) {
            return null;
        }
        
        return match(true) {
            $muac < 11.5 => 'SAM',  // Severe Acute Malnutrition
            $muac < 12.5 => 'MAM',  // Moderate Acute Malnutrition
            default => 'N',          // Normal
        };
    }
    
    /**
     * Calculate all nutritional indicators for a measurement
     */
    public function calculateAllIndicators(
        float $weight,
        float $height,
        ?float $muac,
        \DateTimeInterface $dateOfBirth,
        \DateTimeInterface $measurementDate,
        string $sex,
        string $measurementType = 'height'
    ): array {
        $ageDays = $this->calculateAgeInDays($dateOfBirth, $measurementDate);
        $ageMonths = $this->calculateAgeInMonths($ageDays);
        
        $wfa = $this->getWeightForAgeStatus($weight, $ageDays, $sex);
        $hfa = $this->getHeightForAgeStatus($height, $ageDays, $sex);
        $wfh = $this->getWeightForHeightStatus($weight, $height, $sex, $measurementType);
        $muacStatus = $muac ? $this->getMUACStatus($muac, $ageMonths) : null;
        
        return [
            'age_in_days' => $ageDays,
            'age_in_months' => $ageMonths,
            'is_overaged' => $this->isOveraged($ageDays),
            
            'wfa_zscore' => $wfa['zscore'],
            'weight_for_age' => $wfa['status'],
            
            'hfa_zscore' => $hfa['zscore'],
            'height_for_age' => $hfa['status'],
            
            'wfh_zscore' => $wfh['zscore'],
            'weight_for_height' => $wfh['status'],
            
            'muac_status' => $muacStatus,
            
            'is_flagged' => $wfa['is_flagged'] || $hfa['is_flagged'] || $wfh['is_flagged'],
        ];
    }
}
```

### 8.4 Data Quality Control Service

```php
<?php

namespace App\Services;

use App\Models\Measurement;
use Illuminate\Support\Collection;

class DataQualityControlService
{
    /**
     * Analyze terminal digit preference for measurements
     * Returns distribution of last digits in weight/height values
     */
    public function analyzeTerminalDigitPreference(Collection $measurements): array
    {
        $weightDigits = array_fill(0, 10, 0);
        $heightDigits = array_fill(0, 10, 0);
        
        foreach ($measurements as $measurement) {
            // Get last digit of weight (after decimal)
            $weightDecimal = ($measurement->weight * 10) % 10;
            $weightDigits[(int)$weightDecimal]++;
            
            // Get last digit of height (after decimal)
            $heightDecimal = ($measurement->height * 10) % 10;
            $heightDigits[(int)$heightDecimal]++;
        }
        
        $total = $measurements->count();
        
        return [
            'weight' => [
                'counts' => $weightDigits,
                'percentages' => array_map(fn($c) => round($c / $total * 100, 1), $weightDigits),
                'has_preference' => $this->hasDigitPreference($weightDigits, $total),
            ],
            'height' => [
                'counts' => $heightDigits,
                'percentages' => array_map(fn($c) => round($c / $total * 100, 1), $heightDigits),
                'has_preference' => $this->hasDigitPreference($heightDigits, $total),
            ],
        ];
    }
    
    /**
     * Check if there's significant digit preference (>20% for any digit)
     */
    private function hasDigitPreference(array $counts, int $total): bool
    {
        foreach ($counts as $count) {
            if (($count / $total) > 0.20) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Find duplicate children records
     */
    public function findDuplicates(int $barangayId): Collection
    {
        return \DB::table('children')
            ->select('first_name', 'last_name', 'date_of_birth', \DB::raw('COUNT(*) as count'))
            ->where('barangay_id', $barangayId)
            ->groupBy('first_name', 'last_name', 'date_of_birth')
            ->having('count', '>', 1)
            ->get();
    }
    
    /**
     * Find flagged measurements (z-scores outside ±6)
     */
    public function findFlaggedMeasurements(int $barangayId): Collection
    {
        return Measurement::whereHas('child', function ($q) use ($barangayId) {
            $q->where('barangay_id', $barangayId);
        })
        ->where('is_flagged', true)
        ->with('child')
        ->get();
    }
    
    /**
     * Find overaged children (≥60 months)
     */
    public function findOveragedChildren(int $barangayId): Collection
    {
        return Measurement::whereHas('child', function ($q) use ($barangayId) {
            $q->where('barangay_id', $barangayId);
        })
        ->where('is_overaged', true)
        ->with('child')
        ->get();
    }
    
    /**
     * Get complete DQC summary for a barangay
     */
    public function getDQCSummary(int $barangayId): array
    {
        $measurements = Measurement::whereHas('child', function ($q) use ($barangayId) {
            $q->where('barangay_id', $barangayId);
        })->get();
        
        return [
            'total_measurements' => $measurements->count(),
            'terminal_digit_analysis' => $this->analyzeTerminalDigitPreference($measurements),
            'duplicates' => $this->findDuplicates($barangayId),
            'flagged_records' => $this->findFlaggedMeasurements($barangayId)->count(),
            'overaged_records' => $this->findOveragedChildren($barangayId)->count(),
        ];
    }
}
```

---

## 9. Excel Import Specification

### 9.1 Parsing Strategy for OPT Plus Form 1A

```php
<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExcelImportService
{
    private const HEADER_ROW = 6;
    private const DATA_START_ROW = 7;
    
    private const COLUMN_MAPPING = [
        'B' => 'sequence_no',
        'C' => 'address',
        'D' => 'guardian_name',
        'E' => 'full_name',
        'F' => 'is_indigenous',
        'G' => 'sex',
        'H' => 'date_of_birth',
        'I' => 'measurement_date',
        // Dynamic columns based on template version
    ];
    
    public function import(string $filePath, int $barangayId): ImportResult
    {
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getSheetByName('OPT Plus Form 1A');
        
        if (!$worksheet) {
            throw new \Exception('Sheet "OPT Plus Form 1A" not found');
        }
        
        // Extract metadata from header rows
        $metadata = $this->extractMetadata($worksheet);
        
        // Parse child records
        $records = [];
        $errors = [];
        
        $row = self::DATA_START_ROW;
        while ($worksheet->getCell("B{$row}")->getValue() !== null) {
            try {
                $record = $this->parseRow($worksheet, $row, $metadata);
                
                // Validate record
                $validationErrors = $this->validateRecord($record);
                if (!empty($validationErrors)) {
                    $errors[] = [
                        'row' => $row,
                        'errors' => $validationErrors,
                        'data' => $record,
                    ];
                } else {
                    $records[] = $record;
                }
            } catch (\Exception $e) {
                $errors[] = [
                    'row' => $row,
                    'errors' => [$e->getMessage()],
                ];
            }
            $row++;
        }
        
        return new ImportResult($records, $errors, $metadata);
    }
    
    private function extractMetadata(Worksheet $worksheet): array
    {
        return [
            'barangay' => $worksheet->getCell('D1')->getValue() ?? '',
            'municipality' => $worksheet->getCell('G1')->getValue() ?? '',
            'province' => $worksheet->getCell('D2')->getValue() ?? '',
            'year' => $worksheet->getCell('L1')->getValue() ?? date('Y'),
            'measurement_date' => $worksheet->getCell('I1')->getValue(),
        ];
    }
    
    private function parseRow(Worksheet $worksheet, int $row, array $metadata): array
    {
        $getValue = fn($col) => $worksheet->getCell("{$col}{$row}")->getValue();
        
        // Parse name (format: "Surname, First Name")
        $fullName = $getValue('E');
        [$lastName, $firstName] = $this->parseName($fullName);
        
        return [
            'sequence_no' => (int) $getValue('B'),
            'address' => trim($getValue('C') ?? ''),
            'guardian_name' => trim($getValue('D') ?? ''),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'is_indigenous' => strtoupper(trim($getValue('F') ?? '')) === 'YES',
            'sex' => strtoupper(trim($getValue('G') ?? '')),
            'date_of_birth' => $this->parseDate($getValue('H')),
            'measurement_date' => $this->parseDate($getValue('I')) ?? $metadata['measurement_date'],
            'weight' => $this->parseNumeric($getValue('weight_col')),
            'height' => $this->parseNumeric($getValue('height_col')),
            'muac' => $this->parseNumeric($getValue('muac_col')),
            'has_edema' => strtoupper(trim($getValue('edema_col') ?? '')) !== 'NONE',
            'edema_grade' => $this->parseEdemaGrade($getValue('edema_col')),
            'has_disability' => strtoupper(trim($getValue('disability_col') ?? '')) === 'YES',
        ];
    }
    
    private function parseName(string $fullName): array
    {
        $parts = explode(',', $fullName, 2);
        $lastName = trim($parts[0] ?? '');
        $firstName = trim($parts[1] ?? '');
        return [$lastName, $firstName];
    }
    
    private function parseDate($value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }
        if (is_numeric($value)) {
            // Excel serial date
            $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
            return $date->format('Y-m-d');
        }
        if (is_string($value) && !empty($value)) {
            return date('Y-m-d', strtotime($value));
        }
        return null;
    }
    
    private function parseNumeric($value): ?float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }
        return null;
    }
    
    private function parseEdemaGrade(?string $value): ?string
    {
        $value = strtoupper(trim($value ?? ''));
        if (in_array($value, ['+1', '+2', '+3'])) {
            return $value;
        }
        return null;
    }
    
    private function validateRecord(array $record): array
    {
        $errors = [];
        
        if (empty($record['first_name']) && empty($record['last_name'])) {
            $errors[] = 'Child name is required';
        }
        if (empty($record['date_of_birth'])) {
            $errors[] = 'Date of birth is required';
        }
        if (!in_array($record['sex'], ['M', 'F'])) {
            $errors[] = 'Sex must be M or F';
        }
        if ($record['weight'] !== null && ($record['weight'] < 0.5 || $record['weight'] > 50)) {
            $errors[] = 'Weight must be between 0.5 and 50 kg';
        }
        if ($record['height'] !== null && ($record['height'] < 30 || $record['height'] > 150)) {
            $errors[] = 'Height must be between 30 and 150 cm';
        }
        
        return $errors;
    }
}

class ImportResult
{
    public array $imported = [];
    public array $updated = [];
    public array $skipped = [];
    public array $errors = [];
    public array $metadata = [];
    
    public function __construct(
        array $records,
        array $errors,
        array $metadata
    ) {
        $this->imported = $records;
        $this->errors = $errors;
        $this->metadata = $metadata;
    }
    
    public function getSummary(): array
    {
        return [
            'total_processed' => count($this->imported) + count($this->errors),
            'imported' => count($this->imported),
            'errors' => count($this->errors),
            'metadata' => $this->metadata,
        ];
    }
}
```

### 9.2 Import Validation Rules

| Field | Validation Rules |
|-------|------------------|
| `full_name` | Required, not empty |
| `date_of_birth` | Required, valid date, child must be 0-59 months |
| `sex` | Required, must be 'M' or 'F' |
| `weight` | Required for weight_height method, 0.5 - 50.0 kg |
| `height` | Required for weight_height method, 30.0 - 150.0 cm |
| `measurement_date` | Required, valid date, ≥ date_of_birth |
| `muac` | Required for muac_only method OR 6+ months, 5.0 - 30.0 cm |

---

## 10. Report Generation

### 10.1 Available Reports

| Report | Excel Equivalent | Description | Format |
|--------|------------------|-------------|--------|
| Master List | Form 1A | All children eligible for next visit | Excel, PDF |
| Summary Statistics | Form 1B | Counts and prevalence rates | Excel, PDF |
| Affected/At-Risk List | Form 1C | Malnourished and at-risk children | Excel, PDF |
| Sex-Disaggregated Summary | NutStatusBrgy | Barangay-level presentation tables | Excel, PDF |
| 0-23 Months List | List of 0-23 mos | First 1000 Days monitoring | Excel, PDF |
| MAM Children | List_MW(MAM) | Moderate Acute Malnutrition | Excel, PDF |
| SAM Children | List_SW(SAM) | Severe Acute Malnutrition | Excel, PDF |
| Stunted Children | List_MSt&SSt | Moderately & Severely Stunted | Excel, PDF |
| Overweight/Obese | List_OW&Ob | Overnutrition cases | Excel, PDF |
| Data Export | Data-Export | Municipal database format | Excel, CSV |
| DQC Report | DQC Summary | Data Quality Check results | Excel, PDF |

### 10.2 Export Data Format (for e-OPT Municipal Tool)

The Data-Export format must be preserved for compatibility:

```php
class DataExportService
{
    public function generateExport(Barangay $barangay, Carbon $asOfDate): array
    {
        $measurements = $this->getLatestMeasurements($barangay, $asOfDate);
        
        return [
            'barangay' => $barangay->name,
            'psgc_code' => $barangay->psgc_code,
            'children_valid_wfa' => $measurements->whereNotNull('weight_for_age')->count(),
            'children_valid_hfa' => $measurements->whereNotNull('height_for_age')->count(),
            'children_valid_wfh' => $measurements->whereNotNull('weight_for_height')->count(),
            'children_valid_muac' => $measurements->whereNotNull('muac_status')->count(),
            'barangay_population' => $barangay->population,
            
            // Age-group breakdown (0-5, 6-11, 12-23, 24-35, 36-47, 48-59 months)
            // Male and Female separate
            // Each status: N, SUW, MUW, SSt, MSt, T, OW, Ob, SW, MW, MAM, SAM
            'age_groups' => $this->calculateAgeGroupBreakdown($measurements),
            
            'totals' => [
                'male_0_59' => $measurements->where('child.sex', 'M')->count(),
                'female_0_59' => $measurements->where('child.sex', 'F')->count(),
                'below_normal_wfh' => $measurements->whereIn('weight_for_height', ['MW', 'SW'])->count(),
                'overweight_obese' => $measurements->whereIn('weight_for_height', ['OW', 'Ob'])->count(),
                'children_0_23' => $measurements->where('age_in_months', '<=', 23)->count(),
                'children_24_59' => $measurements->where('age_in_months', '>=', 24)->count(),
                'with_edema' => $measurements->where('has_edema', true)->count(),
                'with_disability' => $measurements->where('has_disability', true)->count(),
            ],
            
            'data_quality' => [
                'duplicates' => $this->countDuplicates($barangay),
                'missing_height' => $measurements->whereNull('height')->count(),
                'missing_weight' => $measurements->whereNull('weight')->count(),
                'overaged' => $measurements->where('is_overaged', true)->count(),
                'flagged' => $measurements->where('is_flagged', true)->count(),
            ],
        ];
    }
}
```

---

## 11. User Interface Design

### 11.1 Navigation Structure

```
├── Dashboard
│   ├── Barangay Summary
│   ├── Quick Stats Cards (Total, MAM, SAM, Stunted, Overweight)
│   ├── Status Distribution Charts
│   └── Children Needing Attention
│
├── Children
│   ├── All Children
│   ├── Add New Child
│   ├── Search/Filter
│   └── [Child Detail]
│       ├── Profile
│       ├── Measurements History
│       └── Add Measurement
│
├── Monitoring Lists
│   ├── 0-23 Months (F1K)
│   ├── MAM Children
│   ├── SAM Children
│   ├── Stunted Children (MSt + SSt)
│   ├── Overweight/Obese
│   └── Combined Conditions
│
├── Reports
│   ├── Form 1A (Master List)
│   ├── Form 1B (Summary)
│   ├── Form 1C (Affected/At-Risk)
│   ├── Sex-Disaggregated (NutStatusBrgy)
│   └── Export Center
│
├── Data Quality
│   ├── DQC Summary
│   ├── Flagged Records
│   ├── Duplicates
│   └── Terminal Digit Analysis
│
├── OPT Sessions
│   ├── Upcoming Sessions
│   ├── Session History
│   └── New Session
│
├── Import/Export
│   ├── Import Excel
│   ├── Export Data
│   └── Import History
│
└── Settings
    ├── Profile
    ├── Barangay Info
    └── User Management (Admin)
```

### 11.2 Dashboard Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  OPT Plus Digital                              [User] [Logout]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Barangay: ANDRES BONIFACIO, Gloria, Oriental Mindoro           │
│  Last OPT: October 15, 2025 | Next OPT: October 2026            │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   98    │ │    6    │ │    0    │ │   34    │ │    2    │   │
│  │ Total   │ │  MAM    │ │  SAM    │ │ Stunted │ │ Overwt  │   │
│  │Children │ │(Wasted) │ │(Severe) │ │         │ │         │   │
│  │         │ │   ⚠️    │ │   🚨    │ │         │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ Weight-for-Age (WFA)        │ │ Height-for-Age (HFA)        ││
│  │ ████████████████████ 79% N  │ │ ████████████████ 65% N      ││
│  │ ████ 21% MUW                │ │ ██████ 29% MSt              ││
│  │ 0% SUW                      │ │ ██ 6% SSt                   ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ Weight-for-Height (WFH)     │ │ Age Distribution            ││
│  │ ██████████████████ 92% N    │ │ ██ 0-5 mos:   7             ││
│  │ █ 6% MW (MAM)               │ │ ███ 6-11 mos: 5             ││
│  │ 0% SW (SAM)                 │ │ ██████ 12-23: 22            ││
│  │ █ 2% OW                     │ │ ████ 24-35:   15            ││
│  │ 0% Ob                       │ │ ████████ 36-47: 25          ││
│  └─────────────────────────────┘ │ ██████ 48-59: 24            ││
│                                  └─────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Children Needing Attention                    [View All]    ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ 🟠 Geroy, Atarah Cally    | 11 mos | MAM  | Caimito         ││
│  │ 🟠 Seño, Cristine         | 16 mos | MAM  | Centro          ││
│  │ 🟠 Sena, Jade Xyriel      | 12 mos | MAM  | Lansones        ││
│  │ 🟡 Cadiente, Prince T.    | 41 mos | MSt  | Caimito         ││
│  │ 🟡 Francisco, Anessa      | 44 mos | SSt  | Centro          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Data Quality Alerts                                         ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ ⚠️ 0 Flagged records (z-score > ±6)                         ││
│  │ ⚠️ 0 Duplicate records detected                             ││
│  │ ℹ️ Terminal digit preference: None detected                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Measurement Form Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Measurement for: Geroy, Atarah Cally                       │
│  DOB: October 27, 2024 | Age: 450 days (14 months) | Sex: F     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Measurement Method:                                            │
│  ● Weight + Length/Height    ○ MUAC Only                        │
│                                                                 │
│  Measurement Date: [January 20, 2026    ] 📅                    │
│                                                                 │
│  ┌────────────────────┐  ┌────────────────────┐                 │
│  │ Weight (kg)        │  │ Height/Length (cm) │                 │
│  │ [8.5              ]│  │ [78.0             ]│                 │
│  └────────────────────┘  └────────────────────┘                 │
│                                                                 │
│  ┌────────────────────┐  Measurement Type:                      │
│  │ MUAC (cm)          │  ● Length (lying down) - 0-23 mos      │
│  │ [14.0             ]│  ○ Height (standing) - 24+ mos          │
│  └────────────────────┘  (Auto-selected based on age)           │
│                                                                 │
│  ☐ Has Bilateral Pitting Edema    ☐ Has Disability             │
│    Grade: [None ▼]                  Notes: [____________]       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ CALCULATED RESULTS (Live Preview)                           ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │                                                             ││
│  │ Weight-for-Age:    NORMAL         (z-score: -0.8)     ✅   ││
│  │ Height-for-Age:    NORMAL         (z-score: -1.2)     ✅   ││
│  │ Weight-for-Height: MOD. WASTED    (z-score: -2.3)     ⚠️   ││
│  │ MUAC Status:       NORMAL         (≥ 12.5 cm)         ✅   ││
│  │                                                             ││
│  │ ⚠️ This child shows signs of Moderate Acute Malnutrition   ││
│  │    Recommend: Refer for supplementary feeding program       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                              [Cancel]  [Save Measurement]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Feature Specifications

### 12.1 Core Features (MVP - Phase 1)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | Child Registration | Register children with demographics | Must |
| F2 | Measurement Recording | Record weight, height, MUAC | Must |
| F3 | WHO Z-Score Calculation | Automatic LMS calculation (age in days) | Must |
| F4 | Nutritional Status Classification | WFA, HFA, WFH, MUAC status | Must |
| F5 | Dashboard | Summary stats, charts, alerts | Must |
| F6 | Monitoring Lists | MAM, SAM, Stunted, F1K lists | Must |
| F7 | Excel Import | Parse OPT Plus Form 1A | Must |
| F8 | Basic Reports | Form 1A, 1B, 1C generation | Must |
| F9 | Data Quality Control | Flagging, duplicates, DQC | Should |

### 12.2 Extended Features (Phase 2)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F10 | Multi-Barangay Dashboard | Municipal aggregation | Should |
| F11 | Advanced Reports | All Excel sheet equivalents | Should |
| F12 | OPT Session Management | Schedule, track sessions | Should |
| F13 | Follow-up Tracking | Progress monitoring | Should |
| F14 | User Management | Roles, permissions | Should |
| F15 | Audit Logs | Change tracking | Could |

### 12.3 Offline & Mobile Features (Phase 3)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F16 | PWA Offline Mode | Service worker, IndexedDB | Should |
| F17 | Background Sync | Sync when online | Should |
| F18 | Mobile UI | Touch-optimized interface | Should |
| F19 | Conflict Resolution | Handle concurrent edits | Could |

---

## 13. Implementation Phases

### Phase 1: Core MVP (4-6 weeks)

| Week | Deliverables |
|------|--------------|
| 1-2 | Database schema, migrations, WHO standards import |
| 2-3 | Child CRUD, Measurement recording with z-score calculation |
| 3-4 | Dashboard, basic charts, monitoring lists |
| 4-5 | Excel import (Form 1A parsing) |
| 5-6 | Testing, bug fixes, deployment |

### Phase 2: Enhanced Features (4-6 weeks)

| Week | Deliverables |
|------|--------------|
| 1-2 | Multi-barangay support, municipal dashboard |
| 2-3 | All report types (Forms 1A, 1B, 1C, NutStatusBrgy) |
| 3-4 | OPT session management, DQC module |
| 4-5 | Follow-up tracking, notifications |
| 5-6 | User management, audit logs |

### Phase 3: Offline & Mobile (4-6 weeks)

| Week | Deliverables |
|------|--------------|
| 1-2 | PWA setup, service worker |
| 2-3 | Offline data storage (IndexedDB) |
| 3-4 | Background sync, conflict resolution |
| 4-5 | Mobile-optimized UI |
| 5-6 | Testing, deployment |

---

## 14. Sample Data

### 14.1 Children Sample (First 10 Records)

| # | Name | Sex | DOB | Guardian | Address | Weight | Height |
|---|------|-----|-----|----------|---------|--------|--------|
| 1 | Cacaldo, Ena Yui | F | 2022-07-13 | Jennefer | Caimito | 13.5 | 96 |
| 2 | Cadiente, Prince Thyron | M | 2022-05-05 | Mary Joy | Caimito | 11.4 | 91 |
| 3 | Geroy, Atarah Cally | F | 2024-10-27 | Mary Joy | Caimito | 8.1 | 78 |
| 4 | Medenilla, Prince | M | 2022-04-04 | Irene | Caimito | 13.2 | 92 |
| 5 | Monreal, Kazuhiko | M | 2021-03-14 | Axel | Caimito | 12.8 | 89 |
| 6 | Montante, Ken Elias | M | 2021-11-16 | Carmina | Caimito | 15.0 | 104 |
| 7 | Motol, Fernando Jr. | M | 2023-02-10 | Evelyn | Caimito | 13.6 | 96 |
| 8 | Villamor, Jeraldine | F | 2024-12-06 | Dhesery | Caimito | 8.0 | 72 |
| 9 | Zoleta, Axseil | M | 2021-08-21 | Neahlyn | Caimito | 15.2 | 98.5 |
| 10 | Zulueta, Aidan Finley | M | 2023-12-28 | Mariel | Caimito | 10.6 | 81 |

### 14.2 Nutritional Status Summary (Barangay A. Bonifacio)

| Indicator | Status | 0-23 mos | 0-59 mos |
|-----------|--------|----------|----------|
| WFA | Normal | 30 (88%) | 77 (79%) |
| WFA | MUW | 4 (12%) | 21 (21%) |
| WFA | SUW | 0 (0%) | 0 (0%) |
| HFA | Normal | 22 (65%) | 64 (65%) |
| HFA | MSt | 10 (29%) | 28 (29%) |
| HFA | SSt | 2 (6%) | 6 (6%) |
| WFH | Normal | 31 (91%) | 90 (92%) |
| WFH | MW/MAM | 3 (9%) | 6 (6%) |
| WFH | SW/SAM | 0 (0%) | 0 (0%) |
| WFH | OW | 0 (0%) | 2 (2%) |
| WFH | Ob | 0 (0%) | 0 (0%) |

### 14.3 MAM Children (Moderate Acute Malnutrition)

| Name | Age (mos) | Location | Guardian | WFH Z-score |
|------|-----------|----------|----------|-------------|
| Geroy, Atarah Cally | 11 | Caimito | Dela Rosa, Mary Joy | -2.3 |
| Sadiz, Lil Wilfred | 29 | Centro | Cindy | -2.1 |
| Semilla, Zion John | 36 | Centro | Dona Rose | -2.4 |
| Seño, Cristine | 16 | Centro | Analyn | -2.2 |
| Rajel, Rynne Matthew | 22 | Dalandan 1 | Madel | -2.5 |
| Sena, Jade Xyriel | 12 | Lansones | Rose Ann | -2.1 |

---

## 15. References

1. **WHO Child Growth Standards (2006)**
   - https://www.who.int/tools/child-growth-standards
   - LMS tables for WFA, HFA, WFL, WFH

2. **National Nutrition Council - OPT Plus Guidelines**
   - https://www.nnc.gov.ph/
   - Annual weighing/measuring protocols

3. **Philippine Statistics Authority - PSGC Codes**
   - https://psa.gov.ph/classification/psgc
   - Barangay, municipality, province codes

4. **e-OPT+ Tool Version 2 (July 2024)**
   - Source Excel file structure and formulas
   - Business rules and validation logic

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 20, 2026 | GitHub Copilot | Initial OPT-PLUS-EXCEL-TO-WEB.md |
| 1.1 | January 20, 2026 | GitHub Copilot | E-OPT-TOOL-ANALYSIS.md created |
| 2.0 | January 20, 2026 | GitHub Copilot | Merged into complete specification |

---

## Appendix A: Document Consolidation

This specification consolidates and replaces the following documents (now deleted):
- ~~`docs/OPT-PLUS-EXCEL-TO-WEB.md`~~ (v1.0) - Deleted January 20, 2026
- ~~`docs/E-OPT-TOOL-ANALYSIS.md`~~ (v1.0) - Deleted January 20, 2026
