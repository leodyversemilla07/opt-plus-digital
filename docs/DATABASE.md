# Database Schema Documentation

## Overview

The OPT Plus Digital System database schema is designed to support the Philippines' Operation Timbang Plus (OPT Plus) program for child nutrition monitoring. The schema follows Laravel conventions and implements best practices for data integrity, relationships, and performance.

## Database Design Principles

1. **UUID Primary Keys** - All models use UUIDs for better offline sync capabilities
2. **Soft Deletes** - Critical models (Child, Measurement) use soft deletes for audit trail
3. **Normalized Structure** - Follows 3NF to minimize data redundancy
4. **WHO Compliance** - Measurement tables align with WHO Child Growth Standards
5. **Philippine Context** - Uses PSGC (Philippine Standard Geographic Code) for location data

## Core Models

### 1. Barangays

Stores Philippine barangay (village) information using official PSGC codes.

**Table:** `barangays`

| Column                           | Type        | Description                                  |
| -------------------------------- | ----------- | -------------------------------------------- |
| id                               | uuid        | Primary key (UUID)                           |
| name                             | string(255) | Barangay name                                |
| municipality_city                | string(255) | Municipality or city                         |
| province                         | string(255) | Province name                                |
| region                           | string(100) | Region (e.g., NCR, Region VII)               |
| psgc_code                        | string(20)  | Philippine Standard Geographic Code (unique) |
| estimated_population_0_59_months | integer     | Estimated target population                  |
| geographic_coordinates           | json        | Optional GPS coordinates                     |
| created_at                       | timestamp   | Record creation timestamp                    |
| updated_at                       | timestamp   | Record update timestamp                      |

**Indexes:**

- Primary key on `id`
- Unique index on `psgc_code`
- Index on `region` for filtering by region

**Relationships:**

- Has many `children`

**Model:** `App\Models\Barangay`

**Factory:** `Database\Factories\BarangayFactory`

---

### 2. Children

Stores child registration information for children 0-59 months (OPT Plus target age group).

**Table:** `children`

| Column                     | Type        | Description                       |
| -------------------------- | ----------- | --------------------------------- |
| id                         | uuid        | Primary key (UUID)                |
| family_serial_number       | string(50)  | Unique FSN identifier             |
| first_name                 | string(100) | Child's first name                |
| middle_name                | string(100) | Child's middle name (nullable)    |
| last_name                  | string(100) | Child's last name                 |
| sex                        | enum        | 'male' or 'female'                |
| date_of_birth              | date        | Child's date of birth             |
| address                    | string(255) | House/street address              |
| purok_sitio                | string(100) | Purok or Sitio name (nullable)    |
| barangay_id                | uuid        | Foreign key to barangays          |
| mother_caregiver_name      | string(150) | Mother/primary caregiver name     |
| father_name                | string(150) | Father's name (nullable)          |
| contact_number             | string(20)  | Primary contact number (nullable) |
| alternative_contact_number | string(20)  | Alternative contact (nullable)    |
| is_indigenous_people       | boolean     | IP community member flag          |
| ip_tribe_name              | string(100) | Tribe name if IP (nullable)       |
| photo_url                  | string(500) | Photo storage path (nullable)     |
| qr_code                    | string(255) | Unique QR code for parent access  |
| created_by_user_id         | uuid        | Foreign key to users              |
| created_at                 | timestamp   | Record creation timestamp         |
| updated_at                 | timestamp   | Record update timestamp           |
| deleted_at                 | timestamp   | Soft delete timestamp (nullable)  |

**Indexes:**

- Primary key on `id`
- Unique index on `family_serial_number`
- Index on `barangay_id` (foreign key)
- Index on `date_of_birth` (for age calculations)
- Index on `qr_code` (for parent portal lookups)
- Index on `created_by_user_id` (foreign key)

**Relationships:**

- Belongs to `barangay`
- Has many `measurements`
- Belongs to `user` (created_by)

**Computed Attributes:**

- `full_name` - Concatenated first, middle, last name
- `age_in_months` - Calculated from date_of_birth
- `age_in_years` - Age in years

**Model:** `App\Models\Child`

**Factory:** `Database\Factories\ChildFactory`

---

### 3. Measurements

Stores anthropometric measurements and WHO growth standard calculations.

**Table:** `measurements`

| Column                   | Type         | Description                               |
| ------------------------ | ------------ | ----------------------------------------- |
| id                       | uuid         | Primary key (UUID)                        |
| child_id                 | uuid         | Foreign key to children                   |
| measurement_date         | date         | Date measurement was taken                |
| age_in_months            | integer      | Child's age at measurement                |
| weight_kg                | decimal(5,2) | Weight in kilograms                       |
| height_length_cm         | decimal(5,2) | Height/length in centimeters              |
| measurement_type         | enum         | 'recumbent' (<24mo) or 'standing' (≥24mo) |
| weight_for_age_zscore    | decimal(5,2) | WFA z-score (nullable)                    |
| height_for_age_zscore    | decimal(5,2) | HFA z-score (nullable)                    |
| weight_for_height_zscore | decimal(5,2) | WFH z-score (nullable)                    |
| weight_for_age_status    | string(50)   | WFA classification (nullable)             |
| height_for_age_status    | string(50)   | HFA classification (nullable)             |
| weight_for_height_status | string(50)   | WFH classification (nullable)             |
| opt_classification       | string(50)   | Overall OPT classification                |
| muac_cm                  | decimal(4,2) | Mid-upper arm circumference (nullable)    |
| notes                    | text         | Additional notes (nullable)               |
| measured_by_user_id      | uuid         | Foreign key to users                      |
| synced_at                | timestamp    | Cloud sync timestamp (nullable)           |
| created_at               | timestamp    | Record creation timestamp                 |
| updated_at               | timestamp    | Record update timestamp                   |
| deleted_at               | timestamp    | Soft delete timestamp (nullable)          |

**Indexes:**

- Primary key on `id`
- Index on `child_id` (foreign key)
- Index on `measurement_date` (for chronological queries)
- Index on `opt_classification` (for filtering malnourished)
- Index on `measured_by_user_id` (foreign key)
- Composite index on (`child_id`, `measurement_date`) for latest measurement queries

**Relationships:**

- Belongs to `child`
- Belongs to `user` (measured_by)

**Model:** `App\Models\Measurement`

**Factory:** `Database\Factories\MeasurementFactory`

---

### 4. Users

Laravel's built-in users table with 2FA support (Laravel Fortify).

**Table:** `users`

| Column                    | Type        | Description                              |
| ------------------------- | ----------- | ---------------------------------------- |
| id                        | uuid        | Primary key (UUID)                       |
| name                      | string(255) | Full name                                |
| email                     | string(255) | Email address (unique)                   |
| email_verified_at         | timestamp   | Email verification timestamp (nullable)  |
| password                  | string(255) | Hashed password                          |
| two_factor_secret         | text        | 2FA secret (nullable, encrypted)         |
| two_factor_recovery_codes | text        | 2FA recovery codes (nullable, encrypted) |
| two_factor_confirmed_at   | timestamp   | 2FA confirmation timestamp (nullable)    |
| remember_token            | string(100) | Remember me token (nullable)             |
| created_at                | timestamp   | Record creation timestamp                |
| updated_at                | timestamp   | Record update timestamp                  |

**Relationships:**

- Has many `children` (as creator)
- Has many `measurements` (as measurer)

---

## WHO Growth Standards

### Z-Score Calculations

The system calculates three key WHO indicators:

1. **Weight-for-Age (WFA)**
    - Identifies underweight and overweight
    - Used for children 0-120 months

2. **Height-for-Age (HFA)**
    - Identifies stunting (chronic malnutrition)
    - Used for children 0-228 months

3. **Weight-for-Height (WFH)**
    - Identifies wasting and obesity (acute malnutrition)
    - Used for children 45-110 cm

### Classification Ranges

**Weight-for-Age Status:**

- `severely_underweight`: z-score < -3
- `underweight`: z-score -3 to -2
- `normal`: z-score -2 to +2
- `overweight`: z-score > +2

**Height-for-Age Status:**

- `severely_stunted`: z-score < -3
- `stunted`: z-score -3 to -2
- `normal`: z-score -2 to +2
- `tall`: z-score > +2

**Weight-for-Height Status:**

- `severely_wasted`: z-score < -3
- `wasted`: z-score -3 to -2
- `normal`: z-score -2 to +2
- `overweight`: z-score +2 to +3
- `obese`: z-score > +3

**OPT Classification (Combined):**

- `severely_malnourished`: Any z-score < -3
- `moderately_malnourished`: Any z-score -3 to -2
- `normal`: All z-scores -2 to +2
- `overweight`: WFH z-score +2 to +3
- `obese`: WFH z-score > +3

---

## Seeders

### BarangaySeeder

Seeds barangays:

- Real barangays with realistic data
- Uses official PSGC codes

**Usage:**

```bash
php artisan db:seed --class=BarangaySeeder
```

### ChildSeeder

Seeds children with measurements:

- 15-30 children per barangay
- 1-3 measurements per child (90 days apart)
- Nutritional status distribution:
    - 70% normal
    - 20% moderately malnourished
    - 10% severely malnourished
- Creates test users (BHW, BNS)

**Usage:**

```bash
php artisan db:seed --class=ChildSeeder
```

### DatabaseSeeder

Orchestrates all seeders:

```bash
php artisan db:seed
# or
php artisan migrate:fresh --seed
```

---

## Factories

### BarangayFactory

Generates realistic Philippine barangay data:

- Random barangay names
- Local city and province
- Valid region
- PSGC codes (10-digit format)
- Population estimates (50-500 children 0-59 months)

### ChildFactory

Generates realistic Filipino child data:

- Filipino names (first, middle, last)
- Sex (male/female)
- Age 0-59 months
- Philippine contact numbers (09## format)
- Indigenous people (~12% of population)
- IP tribes (Aeta, Igorot, Lumad, etc.)
- Family serial numbers (FSN-####-####)
- QR codes for parent access

**States:**

- `male()` - Male child
- `female()` - Female child
- `indigenousPeople()` - IP community member
- `ageInMonths(int $months)` - Specific age

### MeasurementFactory

Generates WHO-compliant measurement data:

- Realistic weight/height by age
- Accurate z-score calculations
- Proper measurement type (recumbent vs standing)
- Nutritional status classifications
- MUAC measurements
- Sync timestamps for offline testing

**States:**

- `normal()` - Normal nutritional status
- `malnourished()` - Moderately malnourished
- `severelyMalnourished()` - Severely malnourished

---

## Data Integrity

### Foreign Key Constraints

All foreign keys have `ON DELETE RESTRICT` to prevent orphaned records:

- `children.barangay_id` → `barangays.id`
- `children.created_by_user_id` → `users.id`
- `measurements.child_id` → `children.id`
- `measurements.measured_by_user_id` → `users.id`

### Validation Rules

Implement in form requests:

- **Family Serial Number**: Required, unique, format: FSN-####-####
- **Date of Birth**: Required, date, not in future, max 59 months ago
- **Sex**: Required, enum (male/female)
- **Weight**: Required, decimal, min 1.0, max 30.0 kg
- **Height**: Required, decimal, min 40.0, max 120.0 cm
- **Contact Numbers**: Optional, Philippine format (09##-###-####)

---

## Performance Considerations

### Indexing Strategy

1. **Frequently Queried Columns**
    - `barangays.psgc_code` (unique lookups)
    - `children.family_serial_number` (unique lookups)
    - `children.qr_code` (parent portal access)
    - `measurements.opt_classification` (dashboard filters)

2. **Foreign Keys**
    - All foreign keys are indexed for join performance

3. **Composite Indexes**
    - `(child_id, measurement_date)` for latest measurement queries

### Query Optimization

1. **Eager Loading**

    ```php
    Child::with('barangay', 'latestMeasurement')->get();
    ```

2. **Scopes for Common Queries**

    ```php
    Child::eligibleForOpt()->byBarangay($id)->get();
    ```

3. **Caching**
    - Cache barangay lists (rarely changes)
    - Cache WHO reference tables
    - Cache dashboard statistics (5-minute TTL)

---

## Migration Order

Migrations must run in this order:

1. `create_users_table`
2. `create_barangays_table`
3. `create_children_table`
4. `create_measurements_table`

**Run all migrations:**

```bash
php artisan migrate
```

**Reset database with fresh data:**

```bash
php artisan migrate:fresh --seed
```

---

## Testing

### Unit Tests

Test model behavior without database:

- Fillable attributes
- Casts and accessors
- Relationships
- Helper methods

**Run tests:**

```bash
php artisan test --testsuite=Unit
```

### Feature Tests (Coming Soon)

Test database interactions:

- CRUD operations
- Relationships
- Query scopes
- Factory data generation

---

## Next Steps (Sprint 2)

1. **WHO Reference Tables**
    - Import WHO growth standards data
    - Create z-score calculation service
    - Implement WHO algorithm

2. **Additional Models**
    - Roles and permissions
    - Audit logs
    - SMS notifications queue

3. **Performance Optimization**
    - Add database indexes based on query patterns
    - Implement caching layer
    - Optimize N+1 queries

---

## References

- [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards)
- [Philippine Standard Geographic Code (PSGC)](https://psa.gov.ph/classification/psgc)
- [Laravel Eloquent Documentation](https://laravel.com/docs/11.x/eloquent)
- [Data Privacy Act (RA 10173)](https://privacy.gov.ph/data-privacy-act/)

---

**Last Updated:** October 31, 2025  
**Sprint:** Sprint 1 - Database Schema & Core Models  
**Status:** ✅ Complete
