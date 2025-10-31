# Development Guide

This guide covers everything you need to know to develop the OPT Plus Digital System.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Architecture Overview](#architecture-overview)
4. [Coding Standards](#coding-standards)
5. [Database & Models](#database--models)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements

**Required:**
- PHP 8.3 or higher
- Composer 2.x
- Node.js 20.x or higher
- npm or pnpm
- MySQL 8.0+ or SQLite 3.x
- Git

**Recommended:**
- Laravel Herd (Windows/macOS native PHP)
- Redis 7.0+ (for caching and queues)
- VS Code with extensions:
  - Laravel Extension Pack
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Intelephense

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/opt-plus-digital.git
cd opt-plus-digital

# 2. Run automated setup
composer setup

# This will:
# - Install PHP dependencies
# - Copy .env.example to .env
# - Generate application key
# - Run migrations
# - Install Node dependencies
# - Build frontend assets

# 3. Configure database
# Edit .env and set your database credentials
# For development, SQLite is easiest:
DB_CONNECTION=sqlite
# (database.sqlite already created in database/ folder)

# Or use MySQL:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=optplus
DB_USERNAME=root
DB_PASSWORD=

# 4. Run migrations
php artisan migrate

# 5. Seed development data (optional)
php artisan db:seed
```

### Starting Development Servers

**Option 1: Using composer dev (Recommended)**
```bash
composer dev
```
This starts three processes concurrently:
- Laravel server at `http://localhost:8000`
- Queue worker for background jobs
- Vite dev server with Hot Module Replacement

**Option 2: Using Laravel Sail (Docker)**
```bash
./vendor/bin/sail up -d
./vendor/bin/sail npm run dev
```

**Option 3: Manual**
```bash
# Terminal 1 - Laravel
php artisan serve

# Terminal 2 - Queue worker
php artisan queue:listen

# Terminal 3 - Frontend
npm run dev
```

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Update dependencies (if composer.lock or package-lock.json changed)
composer install
npm install

# 3. Run migrations (if new migrations exist)
php artisan migrate

# 4. Start dev servers
composer dev

# 5. Make your changes...

# 6. Run tests before committing
composer test
npm run lint

# 7. Commit changes
git add .
git commit -m "feat: add child registration form"

# 8. Push to your feature branch
git push origin feature/child-registration
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (e.g., `feature/measurement-entry`)
- `bugfix/*` - Bug fixes (e.g., `bugfix/validation-error`)
- `hotfix/*` - Urgent production fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add WHO z-score calculation engine
fix: correct measurement validation logic
docs: update API documentation
style: format code with Pint
refactor: extract measurement logic to service
test: add child registration tests
chore: update dependencies
```

## Architecture Overview

### Request Lifecycle

```
1. User clicks link/submits form in React
   ↓
2. Inertia.js intercepts and sends AJAX request to Laravel
   ↓
3. Laravel route → Controller → Business Logic
   ↓
4. Controller returns Inertia::render('Component', $data)
   ↓
5. Inertia.js receives JSON response
   ↓
6. React component re-renders with new props
   ↓
7. User sees updated UI (no full page reload)
```

### Directory Structure

```
opt-plus-digital/
├── app/
│   ├── Actions/              # Fortify actions (login, register, etc.)
│   ├── Http/
│   │   ├── Controllers/      # Inertia controllers
│   │   ├── Middleware/       # Custom middleware
│   │   └── Requests/         # Form request validation
│   ├── Models/               # Eloquent models
│   ├── Services/             # Business logic services
│   │   ├── WHOStandardsService.php
│   │   ├── MeasurementService.php
│   │   └── ReportingService.php
│   ├── Observers/            # Model observers
│   └── Providers/            # Service providers
│
├── database/
│   ├── factories/            # Model factories for testing
│   ├── migrations/           # Database migrations
│   └── seeders/              # Database seeders
│
├── resources/
│   ├── css/                  # Global CSS (Tailwind entry point)
│   ├── js/
│   │   ├── actions/          # Wayfinder generated routes (type-safe)
│   │   ├── components/       # Reusable React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── layouts/     # Layout components
│   │   │   └── forms/       # Form components
│   │   ├── pages/           # Inertia page components
│   │   │   ├── auth/        # Login, register, etc.
│   │   │   ├── children/    # Child management
│   │   │   ├── measurements/# Measurement entry
│   │   │   ├── dashboard/   # Dashboards
│   │   │   └── reports/     # Reports
│   │   ├── lib/             # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── app.tsx          # Main React entry point
│   └── views/
│       └── app.blade.php    # Root HTML template
│
├── routes/
│   ├── web.php              # Web routes (Inertia)
│   ├── api.php              # API routes (for mobile/integrations)
│   ├── console.php          # Artisan commands
│   └── settings.php         # Settings routes
│
├── tests/
│   ├── Feature/             # Feature tests (full stack)
│   └── Unit/                # Unit tests (isolated)
│
├── public/                  # Public assets (compiled by Vite)
└── storage/                 # Logs, cache, uploaded files
```

### Key Concepts

**Inertia.js Pattern:**
```php
// Controller
public function index()
{
    return Inertia::render('Children/Index', [
        'children' => Child::with('barangay')->paginate(20),
    ]);
}
```

```tsx
// React component (resources/js/pages/Children/Index.tsx)
import { InertiaPageProps } from '@/types';

interface Props extends InertiaPageProps {
  children: PaginatedData<Child>;
}

export default function Index({ children }: Props) {
  return (
    <div>
      {children.data.map(child => (
        <div key={child.id}>{child.full_name}</div>
      ))}
    </div>
  );
}
```

**Type-Safe Routing with Wayfinder:**
```tsx
import { route } from '@/actions';

// Instead of manually typing URLs:
<Link href="/children/123/edit"> ❌

// Use type-safe routes:
<Link href={route('children.edit', { child: child.id })}> ✅
```

## Coding Standards

### PHP (Laravel)

**Follow PSR-12 with Laravel conventions:**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    /**
     * Display a listing of children.
     */
    public function index(Request $request): Response
    {
        $children = Child::query()
            ->with(['barangay', 'latestMeasurement'])
            ->when($request->search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Children/Index', [
            'children' => $children,
            'filters' => $request->only(['search']),
        ]);
    }
}
```

**Use Laravel Pint for formatting:**
```bash
./vendor/bin/pint        # Format all files
./vendor/bin/pint app/   # Format specific directory
```

### TypeScript (React)

**Follow Airbnb style with functional components:**

```tsx
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChildFormProps {
  child?: Child;
  barangays: Barangay[];
}

export default function ChildForm({ child, barangays }: ChildFormProps) {
  const { data, setData, post, processing, errors } = useForm({
    first_name: child?.first_name ?? '',
    last_name: child?.last_name ?? '',
    date_of_birth: child?.date_of_birth ?? '',
    barangay_id: child?.barangay_id ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('children.store'));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          value={data.first_name}
          onChange={(e) => setData('first_name', e.target.value)}
          className={errors.first_name ? 'border-red-500' : ''}
        />
        {errors.first_name && (
          <p className="text-sm text-red-500">{errors.first_name}</p>
        )}
      </div>

      <Button type="submit" disabled={processing}>
        {processing ? 'Saving...' : 'Save Child'}
      </Button>
    </form>
  );
}
```

**Lint and format:**
```bash
npm run lint        # Check for errors
npm run lint --fix  # Fix automatically
npm run format      # Format with Prettier
```

### Database Migrations

**Always use migrations, never modify database directly:**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('sex', ['male', 'female', 'intersex']);
            $table->foreignUuid('barangay_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['last_name', 'first_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
```

**Create migrations:**
```bash
php artisan make:migration create_children_table
php artisan make:migration add_qr_code_to_children_table
```

## Database & Models

### Model Conventions

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Child extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'date_of_birth',
        'sex',
        'barangay_id',
        'mother_caregiver_name',
        'contact_number',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_indigenous_people' => 'boolean',
    ];

    // Relationships
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function measurements(): HasMany
    {
        return $this->hasMany(Measurement::class)->orderByDesc('measurement_date');
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public function getAgeInMonthsAttribute(): int
    {
        return $this->date_of_birth->diffInMonths(now());
    }
}
```

### Query Optimization

**Always eager load relationships to avoid N+1 queries:**

```php
// ❌ Bad - N+1 query problem
$children = Child::all();
foreach ($children as $child) {
    echo $child->barangay->name; // Each iteration queries database
}

// ✅ Good - Single query with eager loading
$children = Child::with('barangay')->get();
foreach ($children as $child) {
    echo $child->barangay->name; // No additional queries
}

// ✅ Even better - Select only needed columns
$children = Child::with('barangay:id,name')
    ->select(['id', 'first_name', 'last_name', 'barangay_id'])
    ->get();
```

## Frontend Development

### Component Structure

**Small, reusable components:**

```tsx
// components/children/ChildCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Child } from '@/types';

interface ChildCardProps {
  child: Child;
}

export function ChildCard({ child }: ChildCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{child.full_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Age: {child.age_in_months} months</p>
        <Badge variant={child.latest_measurement?.wfa_classification === 'normal' ? 'success' : 'warning'}>
          {child.latest_measurement?.wfa_classification}
        </Badge>
      </CardContent>
    </Card>
  );
}
```

### State Management

**Use Inertia.js for server state, React hooks for UI state:**

```tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ChildrenIndex({ children, filters }) {
  // UI state (doesn't need to persist)
  const [showFilters, setShowFilters] = useState(false);

  // Server state (will trigger request to server)
  const handleSearch = (search: string) => {
    router.get(route('children.index'), 
      { search }, 
      { preserveState: true }
    );
  };

  return (
    // Component JSX
  );
}
```

### Offline Support (Coming in Phase 2)

**IndexedDB for offline storage:**

```typescript
// lib/offline-storage.ts
import Dexie from 'dexie';

class OPTPlusDatabase extends Dexie {
  measurements!: Table<Measurement>;

  constructor() {
    super('OPTPlusDB');
    this.version(1).stores({
      measurements: '++id, child_id, measurement_date, sync_status',
    });
  }
}

export const db = new OPTPlusDatabase();

// Save measurement offline
export async function saveMeasurementOffline(measurement: Measurement) {
  await db.measurements.add({
    ...measurement,
    sync_status: 'pending',
  });
}

// Sync when online
export async function syncMeasurements() {
  const pending = await db.measurements
    .where('sync_status')
    .equals('pending')
    .toArray();

  for (const measurement of pending) {
    await axios.post('/api/measurements/sync', measurement);
    await db.measurements.update(measurement.id, { sync_status: 'synced' });
  }
}
```

## Testing

### Feature Tests (Laravel)

```php
<?php

use App\Models\Child;
use App\Models\User;

test('authenticated user can create a child', function () {
    $user = User::factory()->create(['role' => 'bhw']);
    
    $this->actingAs($user)
        ->post(route('children.store'), [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'date_of_birth' => '2023-01-01',
            'sex' => 'male',
            'barangay_id' => Barangay::factory()->create()->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('children', [
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
    ]);
});

test('child registration validates required fields', function () {
    $user = User::factory()->create();
    
    $this->actingAs($user)
        ->post(route('children.store'), [])
        ->assertSessionHasErrors(['first_name', 'last_name', 'date_of_birth']);
});
```

### Unit Tests (Services)

```php
<?php

use App\Services\WHOStandardsService;

test('WHO service calculates z-score correctly', function () {
    $service = new WHOStandardsService();
    
    $zScore = $service->calculateWeightForAge(
        sex: 'male',
        ageInMonths: 12,
        weight: 9.5
    );
    
    expect($zScore)->toBeGreaterThan(-2)
                   ->toBeLessThan(2);
});
```

## Common Tasks

### Create a new page

```bash
# 1. Create controller
php artisan make:controller MeasurementController

# 2. Create React component
touch resources/js/pages/Measurements/Index.tsx

# 3. Add route
# In routes/web.php
Route::get('/measurements', [MeasurementController::class, 'index'])->name('measurements.index');

# 4. Regenerate Wayfinder routes
php artisan wayfinder:generate
```

### Add a new model with migration

```bash
php artisan make:model Measurement -mf
# -m creates migration
# -f creates factory
```

### Clear caches

```bash
php artisan optimize:clear
# This runs:
# - route:clear
# - config:clear
# - cache:clear
# - view:clear
```

## Troubleshooting

### Vite not connecting (HMR not working)

```bash
# Check if Vite dev server is running
# Should see: VITE vX.X.X  ready in XXX ms

# If not, restart:
npm run dev

# Check APP_URL in .env matches
APP_URL=http://localhost:8000
```

### Type errors in TypeScript

```bash
# Regenerate Wayfinder types
php artisan wayfinder:generate

# Check TypeScript errors without building
npm run types
```

### Database issues

```bash
# Reset database (WARNING: Deletes all data)
php artisan migrate:fresh --seed

# See what migrations ran
php artisan migrate:status

# Rollback last batch
php artisan migrate:rollback
```

### Permission errors (Windows WSL)

```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
```

---

**Next:** See [ROADMAP.md](ROADMAP.md) for sprint-by-sprint development plan.
