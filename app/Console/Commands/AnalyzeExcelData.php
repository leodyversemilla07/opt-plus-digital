<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class AnalyzeExcelData extends Command
{
    protected $signature = 'analyze:excel {file}';
    protected $description = 'Analyze OPT Plus Excel file structure';

    public function handle(): int
    {
        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $this->info("Analyzing file: {$filePath}");
        $this->newLine();

        try {
            $spreadsheet = IOFactory::load($filePath);
            
            $this->info("═══════════════════════════════════════════════════════════════");
            $this->info("                    EXCEL FILE ANALYSIS                        ");
            $this->info("═══════════════════════════════════════════════════════════════");
            $this->newLine();
            
            // List all sheets
            $sheetNames = $spreadsheet->getSheetNames();
            $this->info("📑 Found " . count($sheetNames) . " sheet(s):");
            foreach ($sheetNames as $index => $name) {
                $this->line("   [$index] $name");
            }
            $this->newLine();

            // Analyze each sheet
            foreach ($sheetNames as $sheetName) {
                $sheet = $spreadsheet->getSheetByName($sheetName);
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();
                $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

                $this->info("═══════════════════════════════════════════════════════════════");
                $this->info("Sheet: $sheetName");
                $this->info("Rows: $highestRow | Columns: $highestColumn ($highestColumnIndex)");
                $this->info("═══════════════════════════════════════════════════════════════");
                
                // Show headers (first row) and column letters
                $this->newLine();
                $this->info("📋 COLUMN HEADERS (Row 1):");
                $headers = [];
                for ($col = 1; $col <= $highestColumnIndex; $col++) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $cellValue = $sheet->getCell($colLetter . '1')->getValue();
                    $headers[$colLetter] = $cellValue;
                    if (!empty($cellValue)) {
                        $this->line("   [$colLetter] " . trim($cellValue));
                    }
                }

                // Show sample data (rows 2-6)
                $this->newLine();
                $this->info("📊 SAMPLE DATA (Rows 2-6):");
                for ($row = 2; $row <= min(6, $highestRow); $row++) {
                    $this->newLine();
                    $this->line("   --- Row $row ---");
                    for ($col = 1; $col <= min($highestColumnIndex, 25); $col++) { // Limit to first 25 cols
                        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                        $cellValue = $sheet->getCell($colLetter . $row)->getValue();
                        $header = $headers[$colLetter] ?? $colLetter;
                        if (!empty($cellValue) && !empty($header)) {
                            // Format dates
                            if (is_numeric($cellValue) && $cellValue > 40000 && $cellValue < 50000) {
                                $dateValue = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($cellValue)->format('Y-m-d');
                                $cellValue = "$cellValue (Date: $dateValue)";
                            }
                            $this->line("      [$colLetter] " . substr(trim($header), 0, 25) . ": " . substr($cellValue, 0, 50));
                        }
                    }
                }

                // Count data rows (non-empty first column after header)
                $dataRowCount = 0;
                for ($row = 2; $row <= $highestRow; $row++) {
                    $firstCell = $sheet->getCell('A' . $row)->getValue();
                    if (!empty($firstCell)) {
                        $dataRowCount++;
                    }
                }
                $this->newLine();
                $this->info("📈 Data rows (non-empty A column): $dataRowCount");
                $this->newLine();
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("Error reading file: {$e->getMessage()}");
            return 1;
        }
    }
}
