# Documentation Index

**OPT Plus Digital System**  
Complete documentation package for developers, stakeholders, and contributors.

**Status:** All Milestones Complete ✅  
**Tests:** 425 passing, 1,834 assertions  
**Last Updated:** May 2026

---

## 📚 Active Documentation

| Document | Purpose | Audience |
|---|---|---|
| [README.md](../README.md) | Project overview, quick start, tech stack | Everyone |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Architecture, coding standards, development patterns | Developers |
| [GETTING-STARTED.md](GETTING-STARTED.md) | Developer environment setup | Developers |
| [DATABASE.md](DATABASE.md) | Database schema and migrations | Developers |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution guidelines, PR process | Contributors |
| [USER-MANUAL.md](USER-MANUAL.md) | End-user training guide | BHW, BNS users |
| [OFFLINE-INTEGRATION.md](OFFLINE-INTEGRATION.md) | PWA and offline functionality guide | Developers |
| [TESTING-OFFLINE.md](TESTING-OFFLINE.md) | Offline features test scenarios | Developers, QA |

## 🗂️ Archived Documents

The following documents are preserved for historical reference in `docs/archive/`:

- Sprint completion reports (Sprint 1-9)
- Project summary and specification
- Roadmap
- TODOs

---

## 🎯 Quick Reference

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.4, Laravel 13.9 |
| Frontend | React 19, Inertia v3, TypeScript 5.7 |
| Styling | Tailwind v4, shadcn/ui |
| Database | MySQL 8+ / SQLite (dev) |
| Cache | Redis (optional) |
| PWA | Service Worker + IndexedDB |

### Key Commands

```bash
composer setup        # First-time setup
composer dev          # Start development servers
php artisan test      # Run tests (425 total)
npm run build         # Build frontend assets
./vendor/bin/pint     # Format PHP code
npm run lint          # Lint TypeScript
```

### Test Coverage

- **425 tests** (1,834 assertions)
- Feature tests for all controllers and services
- End-to-end workflow tests for critical user journeys
- Unit tests for WHO calculator, models, services

---

## 📋 Feature Summary

- **Child Registry** — Full CRUD with QR codes, duplicate detection, offline caching
- **OPT Sessions** — Create, schedule, start/complete with batch operations, duplication
- **Measurements** — WHO z-score computation, offline entry, DQC certification
- **Dashboard** — Real-time charts, nutritional breakdown, barangay comparison
- **Reports** — PDF/Excel export, scheduled reports, 10+ report types
- **Data Quality Control** — Flagged measurements, eye-check certification
- **Notifications** — SAM alerts, multi-channel delivery (in-app, email, push)
- **Offline/PWA** — IndexedDB storage, background sync, service worker
- **Multi-language** — Filipino translations for all UI text
- **Mobile Responsive** — Card layouts, bottom navigation, responsive dialogs
- **User Management** — Roles & permissions, 2FA, audit logs

---

## 🔗 Key Links

- **Repository:** [github.com/leodyversemilla07/opt-plus-digital](https://github.com/leodyversemilla07/opt-plus-digital)
- **Laravel Docs:** [laravel.com/docs/12.x](https://laravel.com/docs/12.x)
- **React Docs:** [react.dev](https://react.dev)
- **Inertia Docs:** [inertiajs.com](https://inertiajs.com)

---

**Last Updated:** May 17, 2026
