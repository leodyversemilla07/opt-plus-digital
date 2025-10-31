<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\Measurement;
use App\Services\MeasurementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MeasurementController extends Controller
{
    public function __construct(
        protected MeasurementService $measurementService
    ) {}

    /**
     * Display a listing of measurements for a child
     */
    public function index(Child $child): JsonResponse
    {
        $measurements = $child->measurements()
            ->with('measuredBy:id,name')
            ->latest('measurement_date')
            ->get();

        $statistics = $this->measurementService->getChildStatistics($child);

        return response()->json([
            'data' => $measurements,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Store a newly created measurement
     */
    public function store(Request $request, Child $child): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'measurement_date' => 'required|date|before_or_equal:today',
            'weight_kg' => 'required|numeric|min:1|max:30',
            'height_length_cm' => 'required|numeric|min:40|max:125',
            'measurement_type' => 'nullable|in:recumbent,standing',
            'muac_cm' => 'nullable|numeric|min:10|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Additional custom validation
        $customErrors = $this->measurementService->validateMeasurement($request->all());
        if (!empty($customErrors)) {
            return response()->json([
                'message' => 'Measurement validation failed',
                'errors' => $customErrors,
            ], 422);
        }

        // Determine measurement type if not provided
        $data = $request->all();
        if (!isset($data['measurement_type'])) {
            $data['measurement_type'] = $this->measurementService->determineMeasurementType(
                $child->age_in_months
            );
        }

        // Add measured_by_user_id
        $data['measured_by_user_id'] = $request->user()?->id;

        // Create measurement (z-scores will be auto-calculated by observer)
        $measurement = $this->measurementService->createMeasurement($child, $data);

        // Check if flagged
        $isFlagged = $this->measurementService->isFlagged($child, $data['weight_kg']);

        return response()->json([
            'message' => 'Measurement created successfully',
            'data' => $measurement->load('child', 'measuredBy'),
            'flagged' => $isFlagged,
        ], 201);
    }

    /**
     * Display the specified measurement
     */
    public function show(Child $child, Measurement $measurement): JsonResponse
    {
        // Ensure measurement belongs to child
        if ($measurement->child_id !== $child->id) {
            return response()->json([
                'message' => 'Measurement not found for this child',
            ], 404);
        }

        return response()->json([
            'data' => $measurement->load('child', 'measuredBy'),
        ]);
    }

    /**
     * Update the specified measurement
     */
    public function update(Request $request, Child $child, Measurement $measurement): JsonResponse
    {
        // Ensure measurement belongs to child
        if ($measurement->child_id !== $child->id) {
            return response()->json([
                'message' => 'Measurement not found for this child',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'measurement_date' => 'sometimes|date|before_or_equal:today',
            'weight_kg' => 'sometimes|numeric|min:1|max:30',
            'height_length_cm' => 'sometimes|numeric|min:40|max:125',
            'measurement_type' => 'sometimes|in:recumbent,standing',
            'muac_cm' => 'nullable|numeric|min:10|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update measurement (z-scores will be recalculated by observer if needed)
        $measurement = $this->measurementService->updateMeasurement($measurement, $request->all());

        return response()->json([
            'message' => 'Measurement updated successfully',
            'data' => $measurement->load('child', 'measuredBy'),
        ]);
    }

    /**
     * Remove the specified measurement
     */
    public function destroy(Child $child, Measurement $measurement): JsonResponse
    {
        // Ensure measurement belongs to child
        if ($measurement->child_id !== $child->id) {
            return response()->json([
                'message' => 'Measurement not found for this child',
            ], 404);
        }

        $measurement->delete();

        return response()->json([
            'message' => 'Measurement deleted successfully',
        ]);
    }
}

