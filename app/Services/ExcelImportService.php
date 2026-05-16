<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Child;
use App\Models\Measurement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExcelImportService
{
    private const HEADER_ROW = 6;

    private const DATA_START_ROW = 7;

    private WHOCalculatorService $calculator;

    private array $importErrors = [];

    private array $importWarnings = [];

    public function __construct(WHOCalculatorService $calculator)
    {
        $this->calculator = $calculator;
    }

    /**
     * Import children and measurements from OPT Plus Excel file.
     */
    public function import(
        string $filePath,
        Barangay $barangay,
        User $importedBy,
        ?string $optSessionId = null
    ): ImportResult {
        $this->importErrors = [];
        $this->importWarnings = [];

        try {
            $spreadsheet = IOFactory::load($filePath);

            // Try to find the data sheet (could be "OPT Plus Form 1A" or "Nut_StatusTool")
            $worksheet = $this->findDataSheet($spreadsheet);

            if (! $worksheet) {
                throw new \Exception('Could not find data sheet. Expected "OPT Plus Form 1A" or "Nut_StatusTool"');
            }

            // Extract metadata from header rows
            $metadata = $this->extractMetadata($worksheet);

            // Parse and import records
            $records = $this->parseRecords($worksheet, $metadata);

            // Import records in a transaction
            $result = DB::transaction(function () use ($records, $barangay, $importedBy, $optSessionId) {
                return $this->importRecords($records, $barangay, $importedBy, $optSessionId);
            });

            $result->metadata = $metadata;
            $result->errors = $this->importErrors;
            $result->warnings = $this->importWarnings;

            return $result;
        } catch (\Exception $e) {
            Log::error('Excel import failed', [
                'file' => $filePath,
                'barangay_id' => $barangay->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Find the data sheet in the workbook.
     */
    private function findDataSheet($spreadsheet): ?Worksheet
    {
        $sheetNames = ['OPT Plus Form 1A', 'Nut_StatusTool', 'Sheet1'];

        foreach ($sheetNames as $name) {
            $sheet = $spreadsheet->getSheetByName($name);
            if ($sheet) {
                return $sheet;
            }
        }

        // Fall back to first sheet
        return $spreadsheet->getSheet(0);
    }

    /**
     * Extract metadata from the Excel file header rows.
     */
    private function extractMetadata(Worksheet $worksheet): array
    {
        return [
            'barangay' => trim($worksheet->getCell('D1')->getValue() ?? ''),
            'municipality' => trim($worksheet->getCell('G1')->getValue() ?? ''),
            'province' => trim($worksheet->getCell('D2')->getValue() ?? ''),
            'year' => $worksheet->getCell('L1')->getValue() ?? date('Y'),
            'measurement_month' => $worksheet->getCell('I1')->getValue(),
            'extracted_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Parse all records from the worksheet.
     */
    private function parseRecords(Worksheet $worksheet, array $metadata): Collection
    {
        $records = collect();
        $row = self::DATA_START_ROW;
        $consecutiveEmptyRows = 0;

        while ($consecutiveEmptyRows < 5) {
            $sequenceNo = $worksheet->getCell("B{$row}")->getValue();

            // Check for empty row
            if (empty($sequenceNo) && empty($worksheet->getCell("E{$row}")->getValue())) {
                $consecutiveEmptyRows++;
                $row++;

                continue;
            }

            $consecutiveEmptyRows = 0;

            try {
                $record = $this->parseRow($worksheet, $row, $metadata);

                if ($record) {
                    // Validate record
                    $validationErrors = $this->validateRecord($record, $row);

                    if (! empty($validationErrors)) {
                        foreach ($validationErrors as $error) {
                            $this->importErrors[] = [
                                'row' => $row,
                                'field' => $error['field'] ?? 'unknown',
                                'message' => $error['message'],
                                'data' => $record,
                            ];
                        }
                    } else {
                        $records->push($record);
                    }
                }
            } catch (\Exception $e) {
                $this->importErrors[] = [
                    'row' => $row,
                    'field' => 'parsing',
                    'message' => $e->getMessage(),
                ];
            }

            $row++;
        }

        return $records;
    }

    /**
     * Parse a single row from the worksheet.
     */
    private function parseRow(Worksheet $worksheet, int $row, array $metadata): ?array
    {
        $getValue = fn ($col) => $worksheet->getCell("{$col}{$row}")->getValue();

        $fullName = trim($getValue('E') ?? '');

        if (empty($fullName)) {
            return null;
        }

        [$lastName, $firstName] = $this->parseName($fullName);

        $dateOfBirth = $this->parseDate($getValue('H'));
        $measurementDate = $this->parseDate($getValue('I')) ?? $this->parseDate($metadata['measurement_month']);

        if (! $dateOfBirth || ! $measurementDate) {
            return null;
        }

        return [
            'row' => $row,
            'sequence_no' => (int) ($getValue('B') ?? 0),
            'address' => trim($getValue('C') ?? ''),
            'guardian_name' => trim($getValue('D') ?? ''),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'is_indigenous' => strtoupper(trim($getValue('F') ?? '')) === 'YES',
            'sex' => $this->parseSex($getValue('G')),
            'date_of_birth' => $dateOfBirth,
            'measurement_date' => $measurementDate,
            'weight' => $this->parseNumeric($getValue('J')),
            'height' => $this->parseNumeric($getValue('K')),
            'muac' => $this->parseNumeric($getValue('L')),
            'has_edema' => $this->parseEdema($getValue('M')),
            'edema_grade' => $this->parseEdemaGrade($getValue('M')),
            'has_disability' => strtoupper(trim($getValue('N') ?? '')) === 'YES',
        ];
    }

    /**
     * Parse full name into first and last name.
     */
    private function parseName(string $fullName): array
    {
        // Handle "Surname, First Name" format
        if (str_contains($fullName, ',')) {
            $parts = explode(',', $fullName, 2);
            $lastName = trim($parts[0] ?? '');
            $firstName = trim($parts[1] ?? '');

            return [$lastName, $firstName];
        }

        // Handle "First Name Last Name" format
        $parts = preg_split('/\s+/', $fullName);
        if (count($parts) >= 2) {
            $lastName = array_pop($parts);
            $firstName = implode(' ', $parts);

            return [$lastName, $firstName];
        }

        return [$fullName, ''];
    }

    /**
     * Parse date from various formats.
     */
    private function parseDate($value): ?Carbon
    {
        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value);
        }

        if (is_numeric($value)) {
            // Excel serial date
            try {
                return Carbon::instance(ExcelDate::excelToDateTimeObject($value));
            } catch (\Exception $e) {
                return null;
            }
        }

        if (is_string($value) && ! empty($value)) {
            try {
                return Carbon::parse($value);
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }

    /**
     * Parse sex value.
     */
    private function parseSex(?string $value): string
    {
        $value = strtoupper(trim($value ?? ''));

        return match ($value) {
            'M', 'MALE' => 'male',
            'F', 'FEMALE' => 'female',
            default => 'male', // Default to male if unclear
        };
    }

    /**
     * Parse numeric value.
     */
    private function parseNumeric($value): ?float
    {
        if (is_numeric($value)) {
            return round((float) $value, 2);
        }

        return null;
    }

    /**
     * Parse edema boolean.
     */
    private function parseEdema(?string $value): bool
    {
        $value = strtoupper(trim($value ?? ''));

        return ! in_array($value, ['', 'NONE', 'NO', 'N']);
    }

    /**
     * Parse edema grade.
     */
    private function parseEdemaGrade(?string $value): ?string
    {
        $value = strtoupper(trim($value ?? ''));

        if (in_array($value, ['+1', '+2', '+3'])) {
            return $value;
        }

        if (in_array($value, ['1', '2', '3'])) {
            return '+'.$value;
        }

        return null;
    }

    /**
     * Validate a parsed record.
     */
    private function validateRecord(array $record, int $row): array
    {
        $errors = [];

        if (empty($record['first_name']) && empty($record['last_name'])) {
            $errors[] = ['field' => 'name', 'message' => 'Child name is required'];
        }

        if (! $record['date_of_birth']) {
            $errors[] = ['field' => 'date_of_birth', 'message' => 'Date of birth is required'];
        }

        if ($record['date_of_birth'] && $record['measurement_date']) {
            $ageInDays = $record['date_of_birth']->diffInDays($record['measurement_date']);

            if ($ageInDays < 0) {
                $errors[] = ['field' => 'measurement_date', 'message' => 'Measurement date cannot be before birth date'];
            }

            if ($ageInDays > 1826) { // > 60 months
                $this->importWarnings[] = [
                    'row' => $row,
                    'field' => 'age',
                    'message' => 'Child is over 60 months (overaged)',
                ];
            }
        }

        if ($record['weight'] !== null && ($record['weight'] < 0.5 || $record['weight'] > 50)) {
            $errors[] = ['field' => 'weight', 'message' => 'Weight must be between 0.5 and 50 kg'];
        }

        if ($record['height'] !== null && ($record['height'] < 30 || $record['height'] > 150)) {
            $errors[] = ['field' => 'height', 'message' => 'Height must be between 30 and 150 cm'];
        }

        if ($record['muac'] !== null && ($record['muac'] < 5 || $record['muac'] > 30)) {
            $errors[] = ['field' => 'muac', 'message' => 'MUAC must be between 5 and 30 cm'];
        }

        return $errors;
    }

    /**
     * Import validated records into the database.
     */
    private function importRecords(
        Collection $records,
        Barangay $barangay,
        User $importedBy,
        ?string $optSessionId
    ): ImportResult {
        $result = new ImportResult;

        foreach ($records as $record) {
            try {
                // Find or create child
                $child = $this->findOrCreateChild($record, $barangay, $importedBy);

                // Check if measurement already exists for this date
                $existingMeasurement = Measurement::where('child_id', $child->id)
                    ->whereDate('measurement_date', $record['measurement_date'])
                    ->first();

                if ($existingMeasurement) {
                    $result->skipped[] = [
                        'row' => $record['row'],
                        'reason' => 'Measurement already exists for this date',
                        'child' => $child->full_name,
                    ];

                    continue;
                }

                // Create measurement with z-score calculations
                $measurement = $this->createMeasurement($record, $child, $importedBy, $optSessionId);

                if ($measurement->wasRecentlyCreated ?? true) {
                    $result->imported[] = [
                        'row' => $record['row'],
                        'child_id' => $child->id,
                        'measurement_id' => $measurement->id,
                        'child_name' => $child->full_name,
                    ];
                }
            } catch (\Exception $e) {
                $this->importErrors[] = [
                    'row' => $record['row'],
                    'field' => 'import',
                    'message' => $e->getMessage(),
                ];
            }
        }

        return $result;
    }

    /**
     * Find existing child or create new one.
     */
    private function findOrCreateChild(array $record, Barangay $barangay, User $importedBy): Child
    {
        // Try to find existing child
        $child = Child::where('barangay_id', $barangay->id)
            ->where('first_name', $record['first_name'])
            ->where('last_name', $record['last_name'])
            ->whereDate('date_of_birth', $record['date_of_birth'])
            ->first();

        if ($child) {
            // Update address if changed
            if (! empty($record['address']) && $child->address !== $record['address']) {
                $child->update(['address' => $record['address']]);
            }

            return $child;
        }

        // Create new child
        return Child::create([
            'barangay_id' => $barangay->id,
            'first_name' => $record['first_name'],
            'last_name' => $record['last_name'],
            'date_of_birth' => $record['date_of_birth'],
            'sex' => $record['sex'],
            'address' => $record['address'],
            'mother_caregiver_name' => $record['guardian_name'] ?: 'Unknown',
            'is_indigenous_people' => $record['is_indigenous'],
            'created_by_user_id' => $importedBy->id,
        ]);
    }

    /**
     * Create measurement with calculated z-scores.
     */
    private function createMeasurement(
        array $record,
        Child $child,
        User $importedBy,
        ?string $optSessionId
    ): Measurement {
        $measurementDate = $record['measurement_date'];
        $ageInDays = $child->date_of_birth->diffInDays($measurementDate);
        $ageInMonths = (int) floor($ageInDays / 30.4375);

        // Determine measurement type based on age
        $measurementType = $ageInMonths < 24 ? 'length' : 'height';

        // Determine if MUAC-only or weight+height
        $measurementMethod = 'weight_height';
        if ($record['weight'] === null && $record['height'] === null && $record['muac'] !== null) {
            $measurementMethod = 'muac_only';
        }

        // Calculate z-scores if weight and height are available
        $zscores = [];
        if ($record['weight'] !== null && $record['height'] !== null) {
            try {
                $zscores = $this->calculator->calculateAll(
                    $record['sex'],
                    $ageInDays,
                    $record['weight'],
                    $record['height']
                );
            } catch (\Exception $e) {
                Log::warning('Z-score calculation failed', [
                    'child_id' => $child->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Check for flagged z-scores
        $isFlagged = false;
        $flagReason = null;
        foreach (['weight_for_age_zscore', 'height_for_age_zscore', 'weight_for_height_zscore'] as $key) {
            if (isset($zscores[$key]) && abs($zscores[$key]) > 6) {
                $isFlagged = true;
                $flagReason = "Z-score outside ±6 SD range: {$key} = {$zscores[$key]}";
                break;
            }
        }

        // Check for overaged
        $isOveraged = $ageInDays >= 1826; // 60 months

        return Measurement::create([
            'child_id' => $child->id,
            'opt_session_id' => $optSessionId,
            'measurement_date' => $measurementDate,
            'age_in_days' => $ageInDays,
            'age_in_months' => $ageInMonths,
            'weight_kg' => $record['weight'],
            'height_length_cm' => $record['height'],
            'measurement_type' => $measurementType,
            'measurement_method' => $measurementMethod,
            'muac_cm' => $record['muac'],
            'has_edema' => $record['has_edema'],
            'edema_grade' => $record['edema_grade'],
            'has_disability' => $record['has_disability'],
            'weight_for_age_zscore' => $zscores['weight_for_age_zscore'] ?? null,
            'height_for_age_zscore' => $zscores['height_for_age_zscore'] ?? null,
            'weight_for_height_zscore' => $zscores['weight_for_height_zscore'] ?? null,
            'weight_for_age_status' => $zscores['weight_for_age_status'] ?? null,
            'height_for_age_status' => $zscores['height_for_age_status'] ?? null,
            'weight_for_height_status' => $zscores['weight_for_height_status'] ?? null,
            'opt_classification' => $zscores['opt_classification'] ?? null,
            'is_flagged' => $isFlagged,
            'flag_reason' => $flagReason,
            'is_overaged' => $isOveraged,
            'measured_by_user_id' => $importedBy->id,
        ]);
    }
}

/**
 * Import result data transfer object.
 */
class ImportResult
{
    public array $imported = [];

    public array $updated = [];

    public array $skipped = [];

    public array $errors = [];

    public array $warnings = [];

    public array $metadata = [];

    public function getSummary(): array
    {
        return [
            'total_processed' => count($this->imported) + count($this->skipped) + count($this->errors),
            'imported' => count($this->imported),
            'updated' => count($this->updated),
            'skipped' => count($this->skipped),
            'errors' => count($this->errors),
            'warnings' => count($this->warnings),
            'metadata' => $this->metadata,
        ];
    }

    public function hasErrors(): bool
    {
        return count($this->errors) > 0;
    }

    public function isSuccessful(): bool
    {
        return count($this->imported) > 0 || count($this->updated) > 0;
    }
}
