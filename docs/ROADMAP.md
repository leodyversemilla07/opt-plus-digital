# Development Roadmap

**Project:** OPT Plus Digital System  
**Timeline:** 12 months (January 2026 - December 2026)  
**Current Status:** Sprint 3 Complete (Full-Stack) ✅ | Sprint 4 Next 🎯  
**Last Updated:** October 31, 2025

## Overview

This roadmap breaks down the 12-month implementation plan into actionable sprints with clear deliverables, acceptance criteria, and priority levels.

## Timeline Summary

```
Phase 1: MVP Development          ████████████░░░░░░░░░░░░  (Months 1-4)
Phase 2: Enhanced Features        ░░░░░░░░░░░░████████░░░░  (Months 5-7)
Phase 3: Integration & Security   ░░░░░░░░░░░░░░░░░░██████  (Months 8-10)
Phase 4: Nationwide Deployment    ░░░░░░░░░░░░░░░░░░░░░░██  (Months 11-12)

Progress: ██████░░░░░░░░░░░░░░░░░░ 28% (2/7 MVP sprints complete)
```

---

## Sprint 0: Foundation Setup ✅
**Status:** COMPLETED  
**Duration:** Weeks 1-2 (Oct 29 - Nov 11, 2025)  
**Team:** 1 Full-stack Developer

### Goals
- [x] Initialize project repository
- [x] Set up development environment
- [x] Create project documentation structure
- [x] Configure CI/CD pipeline basics

### Deliverables
- [x] Laravel 12 + React 19 + Inertia.js starter
- [x] Authentication system (Laravel Fortify)
- [x] UI component library (shadcn/ui)
- [x] Development tooling (ESLint, Prettier, Pint)
- [x] README.md and DEVELOPMENT.md
- [x] This ROADMAP.md

### Acceptance Criteria
- [x] `composer dev` starts all development servers
- [x] Hot Module Replacement (HMR) works
- [x] Basic authentication (login/register) functional
- [x] Code formatting and linting configured

---

## 🔥 PHASE 1: MVP Development (Months 1-4)

### Sprint 1: Database Schema & Core Models ✅
**Status:** COMPLETED  
**Duration:** October 31, 2025  
**Team:** 1 Backend Developer  
**Priority:** 🔴 Critical

#### Goals
- [x] Create complete database schema for OPT Plus
- [x] Implement Eloquent models with relationships
- [x] Set up database seeders for development
- [x] Implement UUID primary keys

#### Tasks
- [x] **Database Migrations**
  - [x] `children` table with all required fields
  - [x] `barangays` table with PSGC codes
  - [x] `measurements` table with WHO indicators
  - [ ] `consent_records` table (deferred to later sprint)
  - [ ] `audit_logs` table (deferred to later sprint)
  - [x] Indexes on key fields

- [x] **Eloquent Models**
  - [x] `Child` model with accessors (full_name, age_in_months)
  - [x] `Barangay` model
  - [x] `Measurement` model with z-score storage
  - [ ] `ConsentRecord` model (deferred)
  - [ ] `AuditLog` model (deferred)
  - [x] Define all model relationships

- [x] **Factories & Seeders**
  - [x] ChildFactory for testing
  - [x] BarangaySeeder with real Philippine data
  - [x] UserSeeder for different roles
  - [x] MeasurementFactory

- [x] **Database Indexes**
  - [x] Optimize queries with appropriate indexes
  - [ ] Full-text search (deferred to Sprint 3)

#### Deliverables
```bash
php artisan migrate:fresh --seed
# Populates database with:
# ✅ 50 barangays (12 real + 38 test)
# ✅ 3+ test users (BHW, BNS)
# ✅ 750-1500 sample children
# ✅ 1125-3000 measurements
```

#### Acceptance Criteria
- [x] All migrations run without errors
- [x] Model relationships work correctly
- [x] `Child::with('barangay', 'measurements')->find(1)` loads eagerly
- [x] UUID primary keys generate correctly
- [x] Soft deletes work on Child model
- [x] Database seeders create realistic test data

#### Testing Requirements
- [x] Unit tests for all model relationships (27 tests)
- [x] Factory tests generate valid data
- [x] Model behavior validated

**Report:** See [SPRINT-1-COMPLETE.md](SPRINT-1-COMPLETE.md)

---

### Sprint 2: WHO Growth Standards Engine ✅
**Status:** COMPLETED (Backend)  
**Duration:** October 31, 2025  
**Team:** 1 Backend Developer  
**Priority:** 🔴 Critical

#### Goals
- [x] Implement WHO Child Growth Standards calculation engine
- [x] Load WHO reference tables into database
- [x] Create service for z-score calculations
- [x] Validate against official WHO data
- [x] Create Inertia controllers (frontend pending)

#### Tasks
- [x] **WHO Reference Data**
  - [x] Create migration for `who_standards` table
  - [x] Sample WHO 2006 LMS data (32 data points)
  - [x] WhoStandard model with interpolation
  - [x] WhoStandardSeeder with documentation

- [x] **WHOCalculatorService**
  - [x] Implement LMS z-score calculation algorithm
  - [x] `calculateWeightForAge(sex, ageInDays, weight)`
  - [x] `calculateHeightForAge(sex, ageInDays, height)`
  - [x] `calculateWeightForHeight(sex, height, weight)`
  - [x] Handle edge cases (L=0, null values)
  - [x] Classify nutritional status (WFA, HFA, WFH)
  - [x] Determine OPT classification

- [x] **Measurement Observer**
  - [x] Auto-calculate z-scores when measurement created
  - [x] Auto-calculate on update if weight/height changed
  - [x] Auto-classify nutritional status
  - [x] Registered in AppServiceProvider

- [x] **MeasurementService**
  - [x] createMeasurement() with auto z-scores
  - [x] updateMeasurement() with recalculation
  - [x] validateMeasurement() - biologically plausible ranges
  - [x] isFlagged() - detect significant changes
  - [x] getChildStatistics() - analytics

- [x] **Inertia Controller**
  - [x] MeasurementController with full CRUD
  - [x] Returns Inertia::render() for pages
  - [x] Returns RedirectResponse for forms
  - [x] Routes in web.php with auth middleware

#### Deliverables
```php
$service = new WHOStandardsService();

$result = $service->calculateNutritionalStatus(
    sex: 'male',
    ageInMonths: 24,
    weight: 12.5,
    height: 87.0
);

// Returns:
// [
//   'wfa_zscore' => -0.5,
//   'wfa_classification' => 'normal',
//   'hfa_zscore' => 0.2,
//   'hfa_classification' => 'normal',
//   'wfh_zscore' => -1.1,
//   'wfh_classification' => 'normal'
// ]
```

#### Acceptance Criteria
- [ ] Z-score calculations match WHO igrowup software within 0.1 SD
- [ ] All 3 indicators (WFA, HFA, WFH) calculate correctly
- [ ] Classifications match NNC guidelines
- [ ] Service handles boys and girls correctly
- [ ] Performance: <100ms per calculation
- [ ] Edge cases handled gracefully

#### Testing Requirements
- [ ] Unit tests with WHO sample data
- [ ] Test all age ranges (0-71 months)
- [ ] Test boundary conditions (-3, -2, 0, +2, +3 SD)
- [ ] Performance test with 10,000 calculations

---

### Sprint 3: Child Registration & Measurement Entry UI ✅
**Status:** COMPLETED  
**Duration:** October 31, 2025  
**Team:** 1 Full-stack Developer  
**Priority:** 🔴 Critical

#### Goals
- [x] Build child registration form
- [x] Implement child management (CRUD)
- [x] Create measurement entry UI
- [x] Implement growth charts with Chart.js
- [x] Build duplicate detection UI

#### Tasks Completed
- [x] **Backend (Laravel)**
  - [x] `ChildController` with full CRUD operations (213 lines)
  - [x] Form validation and error handling
  - [x] Search and filter functionality
  - [x] Duplicate detection endpoint
  - [x] Integration with MeasurementController

- [x] **Frontend Pages (React + TypeScript)**
  - [x] `children/index.tsx` - Child list with search & filters (313 lines)
  - [x] `children/create.tsx` - Registration form with validation (525 lines)
  - [x] `children/show.tsx` - Child profile with measurements (505 lines)
  - [x] `children/edit.tsx` - Edit form (pre-filled) (560 lines)
  - [x] `children/duplicates.tsx` - Duplicate detection UI (410 lines)
  - [x] `measurements/create.tsx` - Measurement entry form (289 lines)
  - [x] `measurements/index.tsx` - Measurement history (428 lines)

- [x] **Components Built**
  - [x] `growth-chart.tsx` - Chart.js growth charts (197 lines)
  - [x] `child-card.tsx` - Reusable child card (135 lines)
  - [x] shadcn/ui components (table, textarea, card, chart)

- [x] **Features Implemented**
  - [x] Complete child registration workflow
  - [x] Measurement entry with WHO z-score display
  - [x] Growth charts (Weight, Height, Z-scores)
  - [x] Measurement history with color-coded status
  - [x] Weight change trends (up/down indicators)
  - [x] Duplicate detection with confidence levels
  - [x] Barangay/municipality selection
  - [x] Indigenous people tracking
  - [x] Form validation with error display
  - [x] Responsive design (mobile-first)

#### Deliverables
- ✅ Registration form: `/children/create`
- ✅ Child list: `/children`
- ✅ Child detail: `/children/{id}`
- ✅ Edit form: `/children/{id}/edit`
- ✅ Duplicates: `/children/duplicates`
- ✅ Measurement entry: `/children/{id}/measurements/create`
- ✅ Measurement history: `/children/{id}/measurements`

#### Acceptance Criteria
- [x] Child registration form with full validation
- [x] Duplicate detection UI (6 criteria, confidence levels)
- [x] QR code display in child profile
- [x] Search and filter children by name, barangay, age
- [x] Measurement entry with real-time z-score calculation
- [x] Growth charts with WHO reference lines
- [x] Responsive UI (mobile and desktop)
- [x] TypeScript type safety
- [x] Kebab-case file naming
- [x] shadcn/ui component integration

#### Code Statistics
- Backend: 377 lines (ChildController + MeasurementController)
- Frontend Pages: 3,030 lines (7 pages)
- Components: 830+ lines (growth-chart, child-card, UI components)
- Total: 4,237+ lines of production code
- Files Created: 21 files
- Routes Configured: 15 routes

#### Dependencies Added
- chart.js: ^4.4.6
- react-chartjs-2: ^5.3.0

**Report:** See [SPRINT-3-COMPLETE.md](SPRINT-3-COMPLETE.md)

---

### Sprint 4: Measurement Entry Module
**Duration:** Weeks 9-10 (Dec 24 - Jan 6, 2026)  
**Team:** 1 Full-stack Developer  
**Priority:** 🔴 Critical

#### Goals
- Build measurement entry form
- Implement offline capability (Phase 1: basic)
- Auto-calculate nutritional status
- Create measurement history view

#### Tasks
- [ ] **Backend (Laravel)**
  - [ ] `MeasurementController` CRUD operations
  - [ ] Validation rules (biological plausibility)
  - [ ] MeasurementService for business logic
  - [ ] Batch import API endpoint

- [ ] **Frontend (React)**
  - [ ] Measurement entry form
  - [ ] Numeric keyboard optimization (mobile)
  - [ ] Real-time z-score display
  - [ ] Color-coded status indicators
  - [ ] Measurement history timeline
  - [ ] Offline queue indicator

- [ ] **Offline Support (Basic)**
  - [ ] LocalStorage for pending measurements
  - [ ] Auto-sync when online
  - [ ] Conflict resolution (last-write-wins)

#### Deliverables
- Measurement form: `/children/{id}/measurements/create`
- Measurement history: `/children/{id}/measurements`

#### Acceptance Criteria
- [ ] BHW can enter measurement in <30 seconds
- [ ] Nutritional status calculates instantly
- [ ] Works offline (stores locally, syncs when online)
- [ ] Validates measurements (rejects 100kg weight for 12-month-old)
- [ ] Shows previous measurement for comparison
- [ ] Mobile-optimized keyboard (numeric only for weight/height)

#### Testing Requirements
- [ ] Feature test: Create measurement
- [ ] Test offline storage and sync
- [ ] Test validation rules
- [ ] Test z-score auto-calculation via observer

---

### Sprint 5: Dashboards & Statistics
**Duration:** Weeks 11-12 (Jan 7 - Jan 20, 2026)  
**Team:** 1 Full-stack Developer  
**Priority:** 🟡 High

#### Goals
- Build role-based dashboards
- Create statistics widgets
- Implement data visualization

#### Tasks
- [ ] **BHW Dashboard**
  - [ ] Measurements today counter
  - [ ] Pending children list
  - [ ] Personal target vs actual progress

- [ ] **BNS Dashboard**
  - [ ] Barangay summary statistics
  - [ ] Nutritional status breakdown (pie chart)
  - [ ] Coverage rate progress bar
  - [ ] High-risk children list

- [ ] **Municipal Dashboard**
  - [ ] Municipality-wide statistics
  - [ ] Barangay comparison table
  - [ ] Trend charts (monthly, yearly)
  - [ ] Geographic heat map (basic)

- [ ] **Components**
  - [ ] `StatCard.tsx` - Statistic display card
  - [ ] `PieChart.tsx` - Nutritional status breakdown
  - [ ] `ProgressBar.tsx` - Coverage indicator
  - [ ] `TrendChart.tsx` - Line chart for trends

#### Deliverables
- `/dashboard` - Role-based dashboard
- `/dashboard/statistics` - Detailed statistics page

#### Acceptance Criteria
- [ ] Dashboard loads in <2 seconds
- [ ] Statistics update in real-time (or on page refresh)
- [ ] Charts are interactive and responsive
- [ ] Mobile-friendly layout

#### Testing Requirements
- [ ] Test dashboard for each role
- [ ] Test statistics calculations
- [ ] Performance test with large datasets

---

### Sprint 6: Reporting & Export
**Duration:** Weeks 13-14 (Jan 21 - Feb 3, 2026)  
**Team:** 1 Backend Developer  
**Priority:** 🟡 High

#### Goals
- Generate NNC-compliant OPT Plus reports
- Export to Excel (eOPT format)
- Create master list and target lists
- PDF export for printing

#### Tasks
- [ ] **ReportingService**
  - [ ] OPT Plus Summary Report generator
  - [ ] Master List report
  - [ ] Target Lists (severely malnourished)
  - [ ] Progress Report

- [ ] **Export Functionality**
  - [ ] Excel export (PhpSpreadsheet)
  - [ ] PDF export (DomPDF or wkhtmltopdf)
  - [ ] CSV export for data analysis

- [ ] **Report Templates**
  - [ ] NNC OPT Plus format template
  - [ ] Custom report builder (future)

#### Deliverables
- `/reports` - Reports dashboard
- `/reports/opt-summary` - OPT Plus summary
- `/reports/masterlist` - Complete master list
- `/reports/target-lists` - High-risk children

#### Acceptance Criteria
- [ ] Report generates in <10 seconds for 1000 children
- [ ] Excel export compatible with eOPT Tool format
- [ ] PDF is printable (A4 size)
- [ ] All NNC required fields included

#### Testing Requirements
- [ ] Test report generation with sample data
- [ ] Verify Excel format compatibility
- [ ] Test with large datasets (10,000+ children)

---

### Sprint 7: Alpha Testing & Bug Fixes
**Duration:** Weeks 15-16 (Feb 4 - Feb 17, 2026)  
**Team:** Full Team + 5 Alpha Testers  
**Priority:** 🔴 Critical

#### Goals
- Deploy to staging environment
- Conduct alpha testing with pilot barangay
- Fix critical bugs
- Gather user feedback

#### Tasks
- [ ] **Deployment**
  - [ ] Set up staging server
  - [ ] Deploy application
  - [ ] Import real barangay data

- [ ] **Alpha Testing**
  - [ ] Train 2 BHWs, 1 BNS from pilot barangay
  - [ ] Real-world testing with 100 children
  - [ ] Document all issues and feedback

- [ ] **Bug Fixes**
  - [ ] Fix all critical bugs
  - [ ] Address major usability issues
  - [ ] Optimize slow queries

- [ ] **Documentation**
  - [ ] User manual draft (BHW version)
  - [ ] Video tutorial (measurement entry)
  - [ ] FAQ document

#### Deliverables
- MVP deployed to staging
- Alpha test report
- Bug tracker with prioritized issues
- Initial user documentation

#### Acceptance Criteria
- [ ] Zero critical bugs
- [ ] <5 high-priority bugs
- [ ] User satisfaction >3.5/5
- [ ] All core workflows functional

#### MVP Completion Checklist
- [ ] Child registration ✓
- [ ] Measurement entry ✓
- [ ] WHO z-score calculation ✓
- [ ] Dashboard (BHW, BNS, Municipal) ✓
- [ ] OPT Plus report generation ✓
- [ ] Excel export ✓
- [ ] Audit logging ✓
- [ ] Basic offline support ✓

---

## 🚀 PHASE 2: Enhanced Features (Months 5-7)

### Sprint 8-10: Advanced Reporting & Analytics
**Duration:** Weeks 17-22 (Feb 18 - Apr 6, 2026)  
**Priority:** 🟡 High

#### Features
- [ ] Interactive charts (Chart.js or Recharts)
- [ ] Geographic heat maps (OpenStreetMap)
- [ ] Trend analysis (year-over-year)
- [ ] Custom report builder
- [ ] Scheduled reports (email delivery)

### Sprint 11-12: Parent Portal & QR Access
**Duration:** Weeks 23-26 (Apr 7 - May 5, 2026)  
**Priority:** 🟡 High

#### Features
- [ ] Public child lookup via QR code
- [ ] Growth chart visualization
- [ ] SMS notification when measured
- [ ] Parent consent management
- [ ] Multi-language support (English/Filipino)

### Sprint 13: SMS Integration
**Duration:** Weeks 27-28 (May 6 - May 19, 2026)  
**Priority:** 🟡 High

#### Features
- [ ] Semaphore API integration
- [ ] SMS templates (Filipino)
- [ ] Bulk SMS sending
- [ ] Delivery status tracking
- [ ] Opt-out management

### Sprint 14: Beta Testing
**Duration:** Weeks 29-30 (May 20 - Jun 2, 2026)  
**Priority:** 🔴 Critical

#### Activities
- [ ] Deploy to 3-5 municipalities
- [ ] Train 50+ BHWs and BNS
- [ ] Collect feedback
- [ ] Fix issues
- [ ] Prepare for Phase 3

---

## 🔒 PHASE 3: Integration & Security (Months 8-10)

### Sprint 15-16: System Integrations
**Duration:** Weeks 31-34 (Jun 3 - Jul 1, 2026)  
**Priority:** 🟢 Medium

#### Integrations
- [ ] National Nutrition Information System (NNIS)
- [ ] Community-Based Monitoring System (CBMS)
- [ ] PhilHealth claims system
- [ ] Historical data migration from eOPT Excel

### Sprint 17-18: Security Hardening
**Duration:** Weeks 35-38 (Jul 2 - Jul 29, 2026)  
**Priority:** 🔴 Critical

#### Security Tasks
- [ ] Third-party security audit
- [ ] Penetration testing
- [ ] Data Privacy Act certification
- [ ] SSL/TLS configuration
- [ ] Rate limiting implementation
- [ ] DDoS protection

### Sprint 19-20: Performance Optimization
**Duration:** Weeks 39-42 (Jul 30 - Aug 26, 2026)  
**Priority:** 🟡 High

#### Optimization
- [ ] Database query optimization
- [ ] Redis caching implementation
- [ ] CDN setup for static assets
- [ ] Load testing (10,000 concurrent users)
- [ ] Auto-scaling configuration

---

## 🌍 PHASE 4: Nationwide Deployment (Months 11-12)

### Sprint 21-22: Production Deployment
**Duration:** Weeks 43-46 (Aug 27 - Sep 23, 2026)  
**Priority:** 🔴 Critical

#### Deployment Activities
- [ ] Production server setup (AWS/GCP)
- [ ] Database migration
- [ ] SSL certificates
- [ ] Monitoring setup
- [ ] Backup automation
- [ ] Disaster recovery testing

### Sprint 23-24: Rollout & Support
**Duration:** Weeks 47-52 (Sep 24 - Dec 31, 2026)  
**Priority:** 🔴 Critical

#### Rollout Plan
- [ ] NCR rollout (Week 47-48)
- [ ] Luzon rollout (Week 49)
- [ ] Visayas rollout (Week 50)
- [ ] Mindanao rollout (Week 51-52)
- [ ] 24/7 support during OPT season (Jan-Mar 2027)

---

## Resource Planning

### Team Composition

**Phase 1 (MVP):**
- 1 Full-stack Developer (Laravel + React)
- 1 Backend Developer (API, Services)
- 1 Frontend Developer (React, UI/UX)
- 1 QA Tester (part-time)
- 1 Project Manager (part-time)

**Phase 2-3:**
- Same team + 1 DevOps Engineer

**Phase 4:**
- Full team + Training specialists + Help desk staff

### Technology Requirements

- **Hosting:** AWS or GCP (auto-scaling)
- **Database:** MySQL 8.0 with read replicas
- **Caching:** Redis cluster
- **CDN:** CloudFront or Cloud CDN
- **SMS Gateway:** Semaphore API
- **Monitoring:** New Relic or Datadog

---

## Risk Management

| Risk | Mitigation | Status |
|------|------------|--------|
| Stakeholder approval delays | Early engagement, regular demos | Monitoring |
| Budget constraints | Phased approach, cloud cost optimization | Mitigated |
| Internet connectivity issues | Robust offline mode, low bandwidth optimization | In Progress |
| User adoption resistance | Comprehensive training, champion program | Planned |
| Security breaches | Security-first design, regular audits | Ongoing |

---

## Success Metrics

### Technical KPIs
- [ ] >99.5% uptime during OPT season
- [ ] <2 second page load time
- [ ] <1% error rate
- [ ] >95% test coverage

### User KPIs
- [ ] >80% user adoption within 6 months
- [ ] >4.0/5.0 user satisfaction
- [ ] 70% reduction in data entry time
- [ ] 95%+ data accuracy

### Health Impact KPIs
- [ ] >95% coverage of target population
- [ ] <48 hours from measurement to intervention
- [ ] 20% reduction in severe malnutrition cases

---

## Next Review Date

**Next Sprint Planning:** November 12, 2025  
**Next Stakeholder Demo:** December 20, 2025 (Post-Sprint 3)  
**MVP Review:** February 17, 2026 (End of Sprint 7)

---

**Document maintained by:** Development Team  
**Last updated:** October 31, 2025  
**Version:** 1.0
