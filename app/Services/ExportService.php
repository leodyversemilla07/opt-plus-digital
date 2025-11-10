<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportService
{
    public function __construct(
        private ReportService $reportService,
        private AnalyticsService $analyticsService
    ) {}

    public function exportOPTSummaryPDF(?string $barangayId = null, ?string $startDate = null, ?string $endDate = null)
    {
        $data = $this->reportService->generateOPTSummary($barangayId, $startDate, $endDate);

        $pdf = Pdf::loadView('exports.pdf.opt-summary', $data);
        $pdf->setPaper('a4', 'landscape');

        $filename = 'OPT_Summary_'.now()->format('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    public function exportMasterListPDF(?string $barangayId = null, ?string $startDate = null, ?string $endDate = null)
    {
        $data = $this->reportService->generateMasterList($barangayId, $startDate, $endDate);

        $pdf = Pdf::loadView('exports.pdf.master-list', $data);
        $pdf->setPaper('a4', 'landscape');

        $filename = 'Master_List_'.now()->format('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    public function exportTargetListPDF(?string $barangayId = null, ?string $startDate = null, ?string $endDate = null)
    {
        $data = $this->reportService->generateTargetList($barangayId, $startDate, $endDate);

        $pdf = Pdf::loadView('exports.pdf.target-list', $data);
        $pdf->setPaper('a4', 'portrait');

        $filename = 'Target_List_'.now()->format('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    public function exportOPTSummaryExcel(?string $barangayId = null, ?string $startDate = null, ?string $endDate = null)
    {
        $data = $this->reportService->generateOPTSummary($barangayId, $startDate, $endDate);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('OPT Summary');

        $this->buildOPTSummaryExcel($sheet, $data);

        $filename = 'OPT_Summary_'.now()->format('Y-m-d').'.xlsx';

        $writer = new Xlsx($spreadsheet);

        $tempFile = tempnam(sys_get_temp_dir(), 'export_');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    public function exportMasterListExcel(?string $barangayId = null, ?string $startDate = null, ?string $endDate = null)
    {
        $data = $this->reportService->generateMasterList($barangayId, $startDate, $endDate);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Master List');

        $this->buildMasterListExcel($sheet, $data);

        $filename = 'Master_List_'.now()->format('Y-m-d').'.xlsx';

        $writer = new Xlsx($spreadsheet);

        $tempFile = tempnam(sys_get_temp_dir(), 'export_');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    public function exportTargetListExcel(?string $barangayId = null, ?string $startDate = null, ?string $endDate = null)
    {
        $data = $this->reportService->generateTargetList($barangayId, $startDate, $endDate);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Target List');

        $this->buildTargetListExcel($sheet, $data);

        $filename = 'Target_List_High_Risk_'.now()->format('Y-m-d').'.xlsx';

        $writer = new Xlsx($spreadsheet);

        $tempFile = tempnam(sys_get_temp_dir(), 'export_');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    private function buildOPTSummaryExcel($sheet, array $data): void
    {
        $row = 1;

        $sheet->setCellValue('A'.$row, 'OPT PLUS SUMMARY REPORT');
        $sheet->mergeCells('A'.$row.':H'.$row);
        $sheet->getStyle('A'.$row)->getFont()->setSize(16)->setBold(true);
        $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $row++;

        $sheet->setCellValue('A'.$row, 'Generated: '.now()->format('F d, Y h:i A'));
        $sheet->mergeCells('A'.$row.':H'.$row);
        $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $row += 2;

        $sheet->setCellValue('A'.$row, 'OVERALL STATISTICS');
        $sheet->getStyle('A'.$row)->getFont()->setBold(true);
        $row++;

        $stats = $data['overall_statistics'];
        $statsData = [
            ['Metric', 'Value'],
            ['Total Children', $stats['total_children']],
            ['Total Measurements', $stats['total_measurements']],
            ['Coverage Rate', number_format($stats['coverage_rate'], 1).'%'],
            ['Malnutrition Rate', number_format($stats['malnutrition_rate'], 1).'%'],
            ['High Risk Children', $stats['high_risk_count']],
        ];

        foreach ($statsData as $statRow) {
            $sheet->fromArray($statRow, null, 'A'.$row);
            $row++;
        }

        $row++;

        $sheet->setCellValue('A'.$row, 'NUTRITIONAL STATUS BREAKDOWN');
        $sheet->getStyle('A'.$row)->getFont()->setBold(true);
        $row++;

        $sheet->fromArray(['Classification', 'Count', 'Percentage'], null, 'A'.$row);
        $sheet->getStyle('A'.$row.':C'.$row)->getFont()->setBold(true);
        $row++;

        foreach ($data['nutritional_status'] as $status) {
            $sheet->fromArray([
                $status['classification'],
                $status['count'],
                number_format($status['percentage'], 1).'%',
            ], null, 'A'.$row);
            $row++;
        }

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    private function buildMasterListExcel($sheet, array $data): void
    {
        $row = 1;

        $sheet->setCellValue('A'.$row, 'MASTER LIST - OPT PLUS');
        $sheet->mergeCells('A'.$row.':L'.$row);
        $sheet->getStyle('A'.$row)->getFont()->setSize(14)->setBold(true);
        $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $row += 2;

        $headers = [
            'No.',
            'Child ID',
            'Name',
            'Sex',
            'Birth Date',
            'Age (months)',
            'Barangay',
            'Last Measurement',
            'Weight (kg)',
            'Height (cm)',
            'Nutritional Status',
            'Classification',
        ];

        $sheet->fromArray($headers, null, 'A'.$row);
        $headerRow = $row;
        $row++;

        $sheet->getStyle('A'.$headerRow.':L'.$headerRow)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $no = 1;
        foreach ($data['children'] as $child) {
            $measurement = $child['latest_measurement'];

            $sheet->fromArray([
                $no++,
                $child['child_id'],
                $child['full_name'],
                strtoupper($child['sex']),
                Carbon::parse($child['date_of_birth'])->format('m/d/Y'),
                $child['age_in_months'],
                $child['barangay'],
                $measurement ? Carbon::parse($measurement['measurement_date'])->format('m/d/Y') : 'N/A',
                $measurement['weight'] ?? 'N/A',
                $measurement['height'] ?? 'N/A',
                $measurement['nutritional_status'] ?? 'N/A',
                $measurement['classification'] ?? 'N/A',
            ], null, 'A'.$row);

            $this->applyNutritionalStatusColor($sheet, 'K'.$row, $measurement['classification'] ?? '');

            $row++;
        }

        $sheet->getStyle('A'.$headerRow.':L'.($row - 1))->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        foreach (range('A', 'L') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    private function buildTargetListExcel($sheet, array $data): void
    {
        $row = 1;

        $sheet->setCellValue('A'.$row, 'TARGET LIST - HIGH RISK CHILDREN');
        $sheet->mergeCells('A'.$row.':J'.$row);
        $sheet->getStyle('A'.$row)->getFont()->setSize(14)->setBold(true);
        $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A'.$row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DC3545');
        $sheet->getStyle('A'.$row)->getFont()->getColor()->setRGB('FFFFFF');
        $row += 2;

        $headers = [
            'No.',
            'Name',
            'Sex',
            'Age (months)',
            'Barangay',
            'Last Measurement',
            'Weight',
            'Height',
            'Classification',
            'Days Since Measurement',
        ];

        $sheet->fromArray($headers, null, 'A'.$row);
        $headerRow = $row;
        $row++;

        $sheet->getStyle('A'.$headerRow.':J'.$headerRow)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DC3545'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $no = 1;
        foreach ($data['high_risk_children'] as $child) {
            $sheet->fromArray([
                $no++,
                $child['full_name'],
                strtoupper($child['sex']),
                $child['age_in_months'],
                $child['barangay'],
                Carbon::parse($child['measurement_date'])->format('m/d/Y'),
                $child['weight'].' kg',
                $child['height'].' cm',
                $child['classification'],
                $child['days_since_measurement'].' days',
            ], null, 'A'.$row);

            $this->applyNutritionalStatusColor($sheet, 'I'.$row, $child['classification']);

            $row++;
        }

        $sheet->getStyle('A'.$headerRow.':J'.($row - 1))->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    private function applyNutritionalStatusColor($sheet, string $cell, string $classification): void
    {
        $colors = [
            'SAM' => 'DC3545',
            'MAM' => 'FFC107',
            'Normal' => '28A745',
            'Overweight' => '17A2B8',
            'Obese' => '6C757D',
        ];

        $color = $colors[$classification] ?? 'FFFFFF';

        $sheet->getStyle($cell)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $color],
            ],
            'font' => [
                'color' => ['rgb' => 'FFFFFF'],
                'bold' => true,
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
    }
}
