<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\OptSession;
use App\Services\ExcelImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportController extends Controller
{
    public function __construct(
        private ExcelImportService $importService
    ) {}

    /**
     * Display the import page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get barangays based on user role
        $barangays = $this->getAccessibleBarangays($user);

        // Get recent import history (could be stored in a separate table)
        $recentImports = [];

        // Get available OPT sessions for linking
        $optSessions = OptSession::query()
            ->when($user->barangay_id, function ($query) use ($user) {
                $query->where('barangay_id', $user->barangay_id);
            })
            ->where('status', '!=', 'cancelled')
            ->orderBy('session_date', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'session_date', 'barangay_id']);

        return Inertia::render('import/index', [
            'barangays' => $barangays,
            'optSessions' => $optSessions,
            'recentImports' => $recentImports,
        ]);
    }

    /**
     * Handle file upload and import.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'], // 10MB max
            'barangay_id' => ['required', 'exists:barangays,id'],
            'opt_session_id' => ['nullable', 'exists:opt_sessions,id'],
        ]);

        $user = $request->user();
        $barangay = Barangay::findOrFail($request->barangay_id);

        // Verify user has access to this barangay
        if (! $this->canAccessBarangay($user, $barangay)) {
            abort(403, 'You do not have access to import data for this barangay.');
        }

        // Store the uploaded file temporarily
        $file = $request->file('file');
        $tempPath = $file->store('imports/temp');
        $fullPath = Storage::path($tempPath);

        try {
            // Perform the import
            $result = $this->importService->import(
                $fullPath,
                $barangay,
                $user,
                $request->opt_session_id
            );

            // Clean up temp file
            Storage::delete($tempPath);

            $summary = $result->getSummary();

            if ($result->hasErrors() && ! $result->isSuccessful()) {
                return back()->with('error', 'Import failed. Please check the errors and try again.')
                    ->with('importResult', [
                        'success' => false,
                        'summary' => $summary,
                        'errors' => $result->errors,
                    ]);
            }

            $message = sprintf(
                'Import completed: %d records imported, %d skipped, %d errors.',
                $summary['imported'],
                $summary['skipped'],
                $summary['errors']
            );

            return back()->with('success', $message)
                ->with('importResult', [
                    'success' => true,
                    'summary' => $summary,
                    'imported' => $result->imported,
                    'skipped' => $result->skipped,
                    'errors' => $result->errors,
                    'warnings' => $result->warnings,
                ]);
        } catch (\Exception $e) {
            // Clean up temp file on error
            Storage::delete($tempPath);

            return back()->with('error', 'Import failed: '.$e->getMessage());
        }
    }

    /**
     * Download import template.
     */
    public function downloadTemplate()
    {
        $templatePath = resource_path('templates/opt-plus-import-template.xlsx');

        if (! file_exists($templatePath)) {
            abort(404, 'Import template not found.');
        }

        return response()->download($templatePath, 'OPT-Plus-Import-Template.xlsx');
    }

    /**
     * Validate uploaded file without importing.
     */
    public function validate(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        $file = $request->file('file');
        $tempPath = $file->store('imports/temp');
        $fullPath = Storage::path($tempPath);

        try {
            $spreadsheet = IOFactory::load($fullPath);
            $sheetNames = $spreadsheet->getSheetNames();
            $rowCount = $spreadsheet->getActiveSheet()->getHighestRow();

            Storage::delete($tempPath);

            return response()->json([
                'valid' => true,
                'sheets' => $sheetNames,
                'estimated_rows' => max(0, $rowCount - 6), // Subtract header rows
            ]);
        } catch (\Exception $e) {
            Storage::delete($tempPath);

            return response()->json([
                'valid' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get barangays accessible to the user.
     */
    private function getAccessibleBarangays($user)
    {
        if ($user->hasRole(['admin', 'municipal'])) {
            return Barangay::orderBy('name')->get(['id', 'name']);
        }

        if ($user->barangay_id) {
            return Barangay::where('id', $user->barangay_id)->get(['id', 'name']);
        }

        return collect();
    }

    /**
     * Check if user can access a specific barangay.
     */
    private function canAccessBarangay($user, Barangay $barangay): bool
    {
        if ($user->hasRole(['admin', 'municipal'])) {
            return true;
        }

        return $user->barangay_id === $barangay->id;
    }
}
