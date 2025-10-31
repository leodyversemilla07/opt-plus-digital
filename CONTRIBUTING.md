# Contributing to OPT Plus Digital System

First off, thank you for considering contributing to the OPT Plus Digital System! 🎉

This project aims to transform nutrition surveillance for Filipino children, and your contributions help make that mission a reality.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
- Check if the bug has already been reported in [Issues](https://github.com/your-org/opt-plus-digital/issues)
- Make sure you're using the latest version
- Collect information about the bug:
  - Stack trace
  - Expected vs actual behavior
  - Steps to reproduce
  - Screenshots (if applicable)

**Submitting a bug report:**

Create an issue with the following information:

```markdown
**Bug Description:**
A clear description of what the bug is.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What you expected to happen.

**Actual Behavior:**
What actually happened.

**Screenshots:**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- PHP Version: [e.g., 8.3.0]
- Node Version: [e.g., 20.10.0]
- Browser: [e.g., Chrome 120, Safari 17]

**Additional Context:**
Any other information about the problem.
```

### Suggesting Features

**Before submitting a feature request:**
- Check the [roadmap](docs/ROADMAP.md) to see if it's already planned
- Check existing [feature requests](https://github.com/your-org/opt-plus-digital/labels/enhancement)
- Consider whether your feature aligns with the project goals

**Submitting a feature request:**

```markdown
**Feature Summary:**
One-paragraph description of the feature.

**Problem Statement:**
What problem does this solve? Who will benefit?

**Proposed Solution:**
How would you implement this?

**Alternatives Considered:**
What other approaches did you consider?

**Additional Context:**
Mockups, examples, or links to similar features.
```

### Contributing Code

#### First-Time Contributors

Look for issues labeled `good first issue`:
- Simple, well-defined tasks
- Great for learning the codebase
- Mentorship available

#### Areas to Contribute

1. **Backend Development (Laravel)**
   - Controllers, models, services
   - API endpoints
   - Database migrations
   - Business logic

2. **Frontend Development (React)**
   - UI components
   - Page layouts
   - Form handling
   - State management

3. **Testing**
   - Feature tests
   - Unit tests
   - Browser tests

4. **Documentation**
   - User guides
   - API documentation
   - Code comments
   - README improvements

5. **Design**
   - UI/UX improvements
   - Mobile responsiveness
   - Accessibility enhancements

## Development Setup

See [GETTING-STARTED.md](docs/GETTING-STARTED.md) for detailed setup instructions.

**Quick setup:**
```bash
git clone https://github.com/your-org/opt-plus-digital.git
cd opt-plus-digital
composer setup
composer dev
```

## Pull Request Process

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/opt-plus-digital.git
cd opt-plus-digital

# Add upstream remote
git remote add upstream https://github.com/your-org/opt-plus-digital.git
```

### 2. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/measurement-entry`)
- `bugfix/` - Bug fixes (e.g., `bugfix/validation-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-service`)
- `test/` - Test additions (e.g., `test/child-registration`)

### 3. Make Your Changes

Follow our [coding standards](#coding-standards).

### 4. Test Your Changes

```bash
# Run all tests
composer test

# Run specific test
php artisan test --filter=ChildRegistrationTest

# Lint code
./vendor/bin/pint          # PHP
npm run lint               # TypeScript/React
```

### 5. Commit Your Changes

Follow [commit guidelines](#commit-guidelines).

```bash
git add .
git commit -m "feat: add child registration form"
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template:

```markdown
**Description:**
Brief description of changes.

**Related Issue:**
Closes #123

**Type of Change:**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Checklist:**
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated

**Screenshots (if applicable):**
Before/after screenshots for UI changes.

**Testing Instructions:**
1. Step one
2. Step two
3. Expected result
```

### 8. Code Review Process

- Maintainers will review within 2-3 business days
- Address feedback in new commits
- Once approved, maintainer will merge

**Review criteria:**
- Code quality and readability
- Test coverage
- Documentation
- Performance implications
- Security considerations

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

**Key principles:**
- Type hints for parameters and return types
- Descriptive variable and method names
- Single Responsibility Principle
- Keep methods short (<20 lines)
- Use Eloquent ORM, avoid raw SQL
- Eager load relationships

**Format with Pint:**
```bash
./vendor/bin/pint
```

### TypeScript (React)

**Follow Airbnb style guide:**

```tsx
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChildFormProps {
  child?: Child;
}

export default function ChildForm({ child }: ChildFormProps) {
  const { data, setData, post, processing, errors } = useForm({
    first_name: child?.first_name ?? '',
    last_name: child?.last_name ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('children.store'));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={data.first_name}
          onChange={(e) => setData('first_name', e.target.value)}
        />
        {errors.first_name && (
          <p className="text-sm text-red-500">{errors.first_name}</p>
        )}
      </div>
      <Button type="submit" disabled={processing}>
        Save
      </Button>
    </form>
  );
}
```

**Key principles:**
- Functional components with hooks
- TypeScript for all new code
- Props destructuring
- Descriptive component and variable names
- Extract complex logic to custom hooks
- Use Tailwind CSS for styling

**Lint and format:**
```bash
npm run lint
npm run format
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, build config)
- `perf:` - Performance improvements

### Scope (optional)

- `child` - Child registration module
- `measurement` - Measurement entry
- `dashboard` - Dashboard features
- `reports` - Reporting module
- `auth` - Authentication
- `api` - API endpoints

### Examples

```bash
feat(child): add duplicate detection on registration

Implements fuzzy name matching to detect potential duplicates
when registering new children. Shows confirmation modal
if similar child found.

Closes #45
```

```bash
fix(measurement): correct z-score calculation for girls

The LMS parameters for girls were using boys' values.
Updated to use correct WHO reference table.

Fixes #78
```

```bash
docs: update installation instructions

Added troubleshooting section for common setup issues.
```

## Testing Guidelines

### Write Tests For

- All new features
- All bug fixes
- Critical user workflows
- Edge cases

### Test Types

**Feature Tests (Full Stack):**
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
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('children', [
        'first_name' => 'Juan',
    ]);
});
```

**Unit Tests (Isolated):**
```php
<?php

use App\Services\WHOStandardsService;

test('calculates z-score correctly', function () {
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

### Coverage Goals

- **Overall:** >80%
- **Critical paths:** 100%
- **Services:** >90%
- **Controllers:** >70%

### Run Tests

```bash
# All tests
composer test

# Specific test
php artisan test --filter=ChildRegistrationTest

# With coverage
php artisan test --coverage
```

## Documentation

### Code Comments

**When to comment:**
- Complex algorithms
- Non-obvious decisions
- Workarounds for bugs
- Public API methods

**When NOT to comment:**
- Self-explanatory code
- Repeating what code does
- Commented-out code (delete instead)

**Good comments:**
```php
// Calculate age in completed months per WHO guidelines
// (disregard days, only count full months)
$ageInMonths = $dateOfBirth->diffInMonths(now(), false);

/**
 * Calculate z-score using WHO LMS method.
 * 
 * @param string $sex 'male' or 'female'
 * @param int $ageInMonths 0-71 months
 * @param float $weight in kilograms
 * @return float z-score value
 */
public function calculateWeightForAge(string $sex, int $ageInMonths, float $weight): float
```

### Update Documentation

When making changes, update:
- README.md (if user-facing changes)
- ROADMAP.md (if affecting timeline)
- API docs (if changing endpoints)
- User guides (if changing workflows)

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub contributors page
- Project acknowledgments
- Annual contributor highlights

## Questions?

- **GitHub Discussions:** For general questions
- **Issues:** For bugs and feature requests
- **Team Chat:** [Slack/Discord] for real-time help

---

**Thank you for contributing to the health of Filipino children!** 🇵🇭❤️
