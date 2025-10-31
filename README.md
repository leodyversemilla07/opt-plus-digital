# OPT Plus Digital System

[![Laravel](https://img.shields.io/badge/Laravel-12.36-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)

> **Modernizing nutrition surveillance for Filipino children through digital innovation.**

A comprehensive Progressive Web Application (PWA) for the Philippines' Operation Timbang Plus (OPT Plus) program - digitizing nutrition data collection, enabling offline-capable mobile measurement entry, real-time WHO growth standards analysis, and automated NNC-compliant reporting.

## 🎯 Project Overview

**Mission:** Transform the OPT Plus program from paper-based to digital, reducing data entry time by 70% and enabling early intervention for malnourished children within 24-48 hours instead of weeks.

**Target Users:**
- 👩‍⚕️ Barangay Health Workers (BHW) - Field data collection
- 📊 Barangay Nutrition Scholars (BNS) - Data management & reporting
- 🏥 Municipal Health Officers - Program monitoring
- 🏛️ National Nutrition Council - Policy & planning
- 👨‍👩‍👧‍👦 Parents/Guardians - Child growth monitoring

**Impact:**
- 11M+ children under 5 years old nationwide
- 42,000+ barangays across the Philippines
- 20% target reduction in malnutrition through early intervention

## 🚀 Quick Start

### Prerequisites

- **PHP 8.3+** with extensions: `pdo`, `mbstring`, `openssl`, `json`, `curl`
- **Composer 2.x**
- **Node.js 20+** and npm
- **MySQL 8.0+** or **SQLite** (for development)
- **Redis** (optional, for caching and queues)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/opt-plus-digital.git
cd opt-plus-digital

# 2. Install dependencies and set up environment
composer setup

# This runs:
# - composer install
# - Copy .env.example to .env
# - php artisan key:generate
# - php artisan migrate
# - npm install
# - npm run build

# 3. Start development servers
composer dev

# This concurrently runs:
# - Laravel development server (http://localhost:8000)
# - Queue worker
# - Vite dev server with HMR
```

Visit **http://localhost:8000** to see the application.

### Alternative: Using Docker (Laravel Sail)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies via Docker
docker run --rm \
    -v $(pwd):/opt \
    -w /opt \
    laravelsail/php83-composer:latest \
    composer install

# 3. Start Sail
./vendor/bin/sail up -d

# 4. Generate key and migrate
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate

# 5. Install frontend dependencies
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

## 📋 Development Status

**Current Phase:** Sprint 2 Complete (Backend) ✅  
**Next Phase:** Sprint 3 - Child Registration + UI 🎯  
**Started:** October 2025  
**Sprint 1 Completed:** October 31, 2025  
**Sprint 2 Completed:** October 31, 2025 (Backend)  
**Target MVP:** February 2026

### What's Ready (Backend)
- ✅ Laravel 12 + React 19 + Inertia.js foundation
- ✅ Authentication system (Laravel Fortify with 2FA)
- ✅ Type-safe routing (Laravel Wayfinder)
- ✅ UI component library (shadcn/ui + Tailwind CSS)
- ✅ Development environment (Hot Module Replacement)
- ✅ Testing framework (Pest)
- ✅ Code quality tools (Pint, ESLint, Prettier)
- ✅ **Database schema (Barangay, Child, Measurement models)**
- ✅ **Model factories and seeders with Filipino test data**
- ✅ **27 unit tests validating all models**
- ✅ **WHO Growth Standards calculator (LMS algorithm)**
- ✅ **Automatic z-score calculation on measurement save**
- ✅ **Measurement services with validation**
- ✅ **14 WHO calculator unit tests**
- ✅ **Inertia controllers for measurements**

### What's Next (Priority Order)
1. 🔨 **Child registration UI (React components)** ⬅️ Sprint 3 (NEXT)
2. 🔨 Measurement entry UI with form validation
3. 🔨 Dashboard & analytics UI
4. 🔨 Reporting system with Excel export
5. 🔨 SMS notification integration
6. 🔨 PWA features (service workers, offline storage)

## 📚 Documentation

### For Developers
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup, architecture, coding standards
- **[Development Roadmap](docs/ROADMAP.md)** - Detailed sprint plans and milestones
- **[Database Schema](docs/DATABASE.md)** - Models, relationships, migrations ✅
- **[Sprint 1 Complete](docs/SPRINT-1-COMPLETE.md)** - What we built ✅
- **[API Documentation](docs/API.md)** - Endpoints and integration guides (Coming Soon)
- **[Testing Guide](docs/TESTING.md)** - Writing and running tests (Coming Soon)

### For Stakeholders
- **[Requirements Document](OPT-Plus-Digital-System.md)** - Complete system requirements (2,288 lines)
- **[User Guides](docs/user-guides/)** - BHW, BNS, Municipal officer manuals (Coming Soon)
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions (Coming Soon)

## 🛠️ Technology Stack

### Backend
- **Laravel 12.36** - Modern PHP framework with batteries included
- **PHP 8.3** - Latest PHP with performance improvements
- **Inertia.js 2.1** - Bridges Laravel and React without building an API
- **Laravel Fortify** - Complete authentication solution with 2FA
- **MySQL 8.0** - Primary database (PostgreSQL, SQLite also supported)
- **Redis** - Caching and queue backend

### Frontend
- **React 19.2** - Latest React with server components support
- **TypeScript 5.7** - Type-safe JavaScript
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible components
- **Vite 7.0** - Lightning-fast build tool
- **Radix UI** - Unstyled, accessible UI primitives

### Development Tools
- **Pest 4.1** - Elegant PHP testing framework
- **Laravel Pint** - Opinionated PHP code formatter
- **ESLint + Prettier** - JavaScript/TypeScript linting and formatting
- **Laravel Sail** - Docker-based local development
- **Concurrently** - Run multiple dev processes simultaneously

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser/Mobile)              │
│  ┌─────────────────────────────────────────────────┐   │
│  │     React 19 + TypeScript + Tailwind CSS        │   │
│  │  (PWA with Service Workers + IndexedDB)         │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ Inertia.js Protocol (JSON + Components)
┌───────────────────────▼─────────────────────────────────┐
│                 Laravel 12 Application                  │
│  ┌───────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │  Routes   │  │Controllers│  │  Business Logic  │   │
│  │ (Wayfinder│  │  (Inertia)│  │  (Services)      │   │
│  └─────┬─────┘  └─────┬─────┘  └────────┬─────────┘   │
│        │              │                  │              │
│  ┌─────▼──────────────▼──────────────────▼─────────┐   │
│  │         Eloquent ORM (Models & Relations)       │   │
│  └─────────────────────┬───────────────────────────┘   │
└────────────────────────┼─────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼─────────┐          ┌─────────▼────────┐
│  MySQL Database  │          │  Redis Cache     │
│  - children      │          │  - Sessions      │
│  - measurements  │          │  - Queue Jobs    │
│  - users         │          │  - App Cache     │
└──────────────────┘          └──────────────────┘
```

## 🎯 Key Features

### Phase 1 - MVP (Months 1-4)
- [x] User authentication with 2FA
- [x] **Database schema (Barangay, Child, Measurement)** ✅
- [x] **Model factories and seeders** ✅
- [x] **WHO Growth Standards calculator** ✅
- [x] **Automatic z-score calculation** ✅
- [ ] Child registration with duplicate detection
- [ ] Measurement entry UI (React components)
- [ ] Basic dashboards (BHW, BNS, Municipal)
- [ ] Excel export (eOPT-compatible)
- [ ] Audit logging
- [ ] Basic SMS notifications

### Phase 2 - Enhanced (Months 5-7)
- [ ] Advanced reporting with charts
- [ ] Geographic mapping (barangay heat maps)
- [ ] Parent portal with QR code access
- [ ] Comprehensive SMS workflows
- [ ] Data validation & approval workflows
- [ ] PWA installation & offline sync

### Phase 3 - Integration (Months 8-10)
- [ ] National Nutrition Information System (NNIS) integration
- [ ] Community-Based Monitoring System (CBMS) integration
- [ ] Historical data migration from eOPT Excel
- [ ] Advanced analytics & predictive modeling
- [ ] Security certification & penetration testing

### Phase 4 - Deployment (Months 11-12)
- [ ] Regional phased rollouts
- [ ] Train-the-trainer programs
- [ ] Help desk establishment
- [ ] Nationwide operational support

## 📊 Development Roadmap

| Sprint | Duration | Focus Area | Key Deliverables | Status |
|--------|----------|------------|------------------|--------|
| **Sprint 0** | **Week 1-2** | **Foundation** | ✅ Repository setup, documentation | **DONE** |
| **Sprint 1** | **Week 3** | **Database & Models** | ✅ Migrations, Eloquent models, seeders | **DONE** |
| **Sprint 2** | **Week 3** | **WHO Engine** | ✅ Z-score calculator, auto-calculation (backend) | **DONE** |
| **Sprint 3** | Week 4-5 | Child Module + UI | Registration forms, React components | 🎯 Next |
| **Sprint 4** | Week 6-7 | Measurement UI | Offline-capable data entry forms | Planned |
| **Sprint 5** | Week 8-9 | Dashboard UI | BHW/BNS dashboards, charts | Planned |
| **Sprint 6** | Week 10-11 | Reporting | OPT summary, master list, exports | Planned |
| **Sprint 7** | Week 12-13 | Testing & Polish | Alpha testing, bug fixes | Planned |

**See [ROADMAP.md](docs/ROADMAP.md) for detailed sprint plans**

## 🧪 Testing

```bash
# Run all tests
composer test

# Run specific test suite
php artisan test --filter=ChildRegistrationTest

# Run with coverage
php artisan test --coverage

# Frontend tests (Coming Soon)
npm test
```

## 🚢 Deployment

### Production Requirements
- Ubuntu 22.04 LTS or similar
- PHP 8.3-FPM with OPcache enabled
- Nginx or Apache with HTTPS (Let's Encrypt)
- MySQL 8.0 or PostgreSQL 14+
- Redis 7.0+
- Supervisor for queue workers
- Node.js (for building assets)

### Environment Variables
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://optplus.gov.ph

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=optplus
DB_USERNAME=optplus_user
DB_PASSWORD=your_secure_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# SMS Gateway (Semaphore)
SEMAPHORE_API_KEY=your_api_key
SEMAPHORE_SENDER_NAME=OPT_Plus

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
```

**See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide**

## 🤝 Contributing

We welcome contributions from developers, health workers, and stakeholders!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- **PHP:** Follow PSR-12, use Laravel Pint (`composer pint`)
- **TypeScript:** Follow Airbnb style, use ESLint + Prettier (`npm run lint`)
- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/)
- **Tests:** Write tests for all new features

## 📄 License

This project is proprietary software owned by the **National Nutrition Council, Philippines**.

© 2025 National Nutrition Council. All rights reserved.

Unauthorized reproduction, distribution, or use is prohibited without explicit written permission.

## 📞 Support & Contact

### For Development Issues
- **GitHub Issues:** [github.com/your-org/opt-plus-digital/issues](https://github.com)
- **Developer Chat:** [Slack/Discord Channel] (Coming Soon)

### For Official Inquiries
- **National Nutrition Council**
  - Email: info@nnc.gov.ph
  - Phone: (02) 8818-9287
  - Website: https://www.nnc.gov.ph

### For Production Support (After Launch)
- **Help Desk:** 1-800-OPT-PLUS
- **Email:** support@optplus.gov.ph
- **Hours:** 24/7 during OPT Season (Jan-Mar), 8AM-5PM regular

## 🙏 Acknowledgments

This system is built with support from:
- **National Nutrition Council** - Policy guidance and leadership
- **Department of Health** - Technical standards and integration
- **Barangay Health Workers** - User experience insights
- **WHO Philippines** - Child growth standards expertise
- **UNICEF Philippines** - Best practices in child nutrition

Special thanks to all Filipino health workers serving children with dedication. 🇵🇭

---

**Built with ❤️ for Filipino children**
