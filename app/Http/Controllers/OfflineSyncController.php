<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Measurement;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OfflineSyncController extends Controller
{
    /**
     * Sync pending measurements submitted while offline.
     * Called by the Service Worker's background sync.
     */
    public function syncMeasurements(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => 'required|exists:children,id',
            'measurement_date' => 'required|date|before_or_equal:today',
            'weight_kg' => 'required|numeric|min:0.5|max:50',
            'height_length_cm' => 'required|numeric|min:30|max:150',
            'muac_cm' => 'nullable|numeric|min:5|max:30',
            'measurement_method' => 'nullable|string|in:weight_height,muac_only',
            'has_edema' => 'boolean',
            'edema_grade' => 'nullable|string|in:+1,+2,+3',
            'has_disability' => 'boolean',
            'disability_notes' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'localId' => 'nullable|string|max:100',
        ]);

        try {
            $child = Child::findOrFail($validated['child_id']);

            // Auto-calculate age in months for the measurement
            $measurementDate = Carbon::parse($validated['measurement_date']);
            $ageInMonths = $child->date_of_birth->diffInMonths($measurementDate);

            // Determine measurement type based on age
            $measurementType = $validated['measurement_type'] ?? ($ageInMonths < 24 ? 'length' : 'height');

            $measurement = Measurement::create([
                'child_id' => $child->id,
                'measurement_date' => $validated['measurement_date'],
                'weight_kg' => $validated['weight_kg'],
                'height_length_cm' => $validated['height_length_cm'],
                'muac_cm' => $validated['muac_cm'] ?? null,
                'measurement_type' => $measurementType,
                'measurement_method' => $validated['measurement_method'] ?? 'weight_height',
                'age_in_months' => $ageInMonths,
                'has_edema' => $validated['has_edema'] ?? false,
                'edema_grade' => $validated['edema_grade'] ?? null,
                'has_disability' => $validated['has_disability'] ?? false,
                'disability_notes' => $validated['disability_notes'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'measured_by_user_id' => $request->user()->id,
                'synced_at' => now(),
            ]);

            Log::info('Offline measurement synced', [
                'measurement_id' => $measurement->id,
                'child_id' => $child->id,
                'local_id' => $validated['localId'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'measurement_id' => $measurement->id,
                'message' => 'Measurement synced successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to sync offline measurement', [
                'error' => $e->getMessage(),
                'child_id' => $validated['child_id'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to sync measurement: '.$e->getMessage(),
            ], 500);
        }
    }
}
