<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Measurement;
use App\Services\MeasurementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeasurementController extends Controller
{
    public function __construct(
        protected MeasurementService $measurementService
    ) {}

    /**
     * Display a listing of measurements for a child
     */
    public function index(Child $child): Response
    {
        $measurements = $child->measurements()
            ->with('measuredBy:id,name')
            ->latest('measurement_date')
            ->paginate(10);

        $statistics = $this->measurementService->getChildStatistics($child);

        return Inertia::render('measurements/index', [
            'child' => $child->load('barangay'),
            'measurements' => $measurements,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new measurement
     */
    public function create(Child $child): Response
    {
        return Inertia::render('measurements/create', [
            'child' => $child->load('barangay'),
            'measurementType' => $this->measurementService->determineMeasurementType(
                $child->age_in_months
            ),
        ]);
    }

    /**
     * Store a newly created measurement
     */
    public function store(Request $request, Child $child): RedirectResponse
    {
        $validated = $request->validate([
            'measurement_date' => 'required|date|before_or_equal:today',
            'weight_kg' => 'required|numeric|min:1|max:30',
            'height_length_cm' => 'required|numeric|min:40|max:125',
            'measurement_type' => 'nullable|in:length,height',
            'muac_cm' => 'nullable|numeric|min:10|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        // Additional custom validation
        $customErrors = $this->measurementService->validateMeasurement($validated);
        if (! empty($customErrors)) {
            return back()->withErrors($customErrors)->withInput();
        }

        // Determine measurement type if not provided
        if (! isset($validated['measurement_type'])) {
            $validated['measurement_type'] = $this->measurementService->determineMeasurementType(
                $child->age_in_months
            );
        }

        // Add measured_by_user_id
        $validated['measured_by_user_id'] = $request->user()->id;

        // Create measurement (z-scores auto-calculated by observer)
        $measurement = $this->measurementService->createMeasurement($child, $validated);

        // Check if flagged
        $isFlagged = $this->measurementService->isFlagged($child, $validated['weight_kg']);

        return redirect()
            ->route('children.measurements.show', [$child, $measurement])
            ->with('success', 'Measurement recorded successfully')
            ->with('flagged', $isFlagged ? 'This measurement shows significant change and may need review.' : null);
    }

    /**
     * Display the specified measurement
     */
    public function show(Child $child, Measurement $measurement): Response
    {
        // Ensure measurement belongs to child
        abort_if($measurement->child_id !== $child->id, 404);

        return Inertia::render('measurements/show', [
            'child' => $child->load('barangay'),
            'measurement' => $measurement->load('measuredBy'),
            'previousMeasurement' => $child->measurements()
                ->where('measurement_date', '<', $measurement->measurement_date)
                ->latest('measurement_date')
                ->first(),
        ]);
    }

    /**
     * Show the form for editing the specified measurement
     */
    public function edit(Child $child, Measurement $measurement): Response
    {
        // Ensure measurement belongs to child
        abort_if($measurement->child_id !== $child->id, 404);

        return Inertia::render('measurements/edit', [
            'child' => $child->load('barangay'),
            'measurement' => $measurement,
        ]);
    }

    /**
     * Update the specified measurement
     */
    public function update(Request $request, Child $child, Measurement $measurement): RedirectResponse
    {
        // Ensure measurement belongs to child
        abort_if($measurement->child_id !== $child->id, 404);

        $validated = $request->validate([
            'measurement_date' => 'sometimes|date|before_or_equal:today',
            'weight_kg' => 'sometimes|numeric|min:1|max:30',
            'height_length_cm' => 'sometimes|numeric|min:40|max:125',
            'measurement_type' => 'sometimes|in:length,height',
            'muac_cm' => 'nullable|numeric|min:10|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        // Update measurement (z-scores recalculated by observer if needed)
        $this->measurementService->updateMeasurement($measurement, $validated);

        return redirect()
            ->route('children.measurements.show', [$child, $measurement])
            ->with('success', 'Measurement updated successfully');
    }

    /**
     * Remove the specified measurement
     */
    public function destroy(Child $child, Measurement $measurement): RedirectResponse
    {
        // Ensure measurement belongs to child
        abort_if($measurement->child_id !== $child->id, 404);

        $measurement->delete();

        return redirect()
            ->route('children.measurements.index', $child)
            ->with('success', 'Measurement deleted successfully');
    }
}
