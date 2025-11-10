<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Child;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    /**
     * Display a listing of children
     */
    public function index(Request $request): Response
    {
        $query = Child::query()
            ->with(['barangay:id,name'])
            ->latest();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('family_serial_number', 'like', "%{$search}%")
                    ->orWhere('qr_code', 'like', "%{$search}%");
            });
        }

        // Filter by barangay
        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->barangay_id);
        }

        // Filter by indigenous people
        if ($request->filled('is_indigenous_people')) {
            $query->where('is_indigenous_people', $request->boolean('is_indigenous_people'));
        }

        $children = $query->paginate(15)->withQueryString();

        return Inertia::render('children/index', [
            'children' => $children,
            'filters' => $request->only(['search', 'barangay_id', 'is_indigenous_people']),
            'barangays' => Barangay::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new child
     */
    public function create(): Response
    {
        return Inertia::render('children/create', [
            'barangays' => Barangay::select('id', 'name', 'municipality_city', 'province')
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Store a newly created child
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'family_serial_number' => 'required|string|max:50|unique:children',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:10',
            'sex' => 'required|in:male,female',
            'date_of_birth' => 'required|date|before:today',
            'birth_weight_kg' => 'nullable|numeric|min:0.5|max:10',
            'birth_length_cm' => 'nullable|numeric|min:30|max:70',
            'barangay_id' => 'required|exists:barangays,id',
            'purok_sitio' => 'nullable|string|max:100',
            'mother_name' => 'nullable|string|max:200',
            'father_name' => 'nullable|string|max:200',
            'guardian_name' => 'nullable|string|max:200',
            'guardian_relationship' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:20',
            'is_indigenous_people' => 'boolean',
            'indigenous_group' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        // Add created_by_user_id
        $validated['created_by_user_id'] = $request->user()->id;

        // Generate QR code (simple UUID-based for now)
        $validated['qr_code'] = 'OPT-'.strtoupper(substr(md5(uniqid()), 0, 8));

        $child = Child::create($validated);

        return redirect()
            ->route('children.show', $child)
            ->with('success', 'Child registered successfully!');
    }

    /**
     * Display the specified child
     */
    public function show(Child $child): Response
    {
        $child->load([
            'barangay',
            'measurements' => fn ($q) => $q->latest('measurement_date')->take(10),
            'measurements.measuredBy:id,name',
            'createdBy:id,name',
        ]);

        return Inertia::render('children/show', [
            'child' => $child,
            'latestMeasurement' => $child->measurements->first(),
        ]);
    }

    /**
     * Show the form for editing the specified child
     */
    public function edit(Child $child): Response
    {
        return Inertia::render('children/edit', [
            'child' => $child->load('barangay'),
            'barangays' => Barangay::select('id', 'name', 'municipality_city', 'province')
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Update the specified child
     */
    public function update(Request $request, Child $child): RedirectResponse
    {
        $validated = $request->validate([
            'family_serial_number' => 'required|string|max:50|unique:children,family_serial_number,'.$child->id,
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:10',
            'sex' => 'required|in:male,female',
            'date_of_birth' => 'required|date|before:today',
            'birth_weight_kg' => 'nullable|numeric|min:0.5|max:10',
            'birth_length_cm' => 'nullable|numeric|min:30|max:70',
            'barangay_id' => 'required|exists:barangays,id',
            'purok_sitio' => 'nullable|string|max:100',
            'mother_name' => 'nullable|string|max:200',
            'father_name' => 'nullable|string|max:200',
            'guardian_name' => 'nullable|string|max:200',
            'guardian_relationship' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:20',
            'is_indigenous_people' => 'boolean',
            'indigenous_group' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $child->update($validated);

        return redirect()
            ->route('children.show', $child)
            ->with('success', 'Child information updated successfully!');
    }

    /**
     * Remove the specified child
     */
    public function destroy(Child $child): RedirectResponse
    {
        $child->delete();

        return redirect()
            ->route('children.index')
            ->with('success', 'Child record archived successfully.');
    }

    /**
     * Search for potential duplicate children
     */
    public function searchDuplicates(Request $request): Response
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'date_of_birth' => 'required|date',
        ]);

        // Find potential duplicates based on name and DOB similarity
        $potentialDuplicates = Child::query()
            ->where('first_name', 'like', '%'.$request->first_name.'%')
            ->where('last_name', 'like', '%'.$request->last_name.'%')
            ->whereRaw('ABS(DATEDIFF(date_of_birth, ?)) <= 30', [$request->date_of_birth])
            ->with('barangay:id,name')
            ->get();

        return Inertia::render('children/duplicates', [
            'duplicates' => $potentialDuplicates,
            'searchData' => $request->only(['first_name', 'last_name', 'date_of_birth']),
        ]);
    }
}
