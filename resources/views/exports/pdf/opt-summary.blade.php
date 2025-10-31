<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>OPT Plus Summary Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 18px;
            margin: 0 0 5px 0;
        }
        .header p {
            margin: 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4472C4;
            color: white;
            font-weight: bold;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #333;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .stat-item {
            display: table-row;
        }
        .stat-label, .stat-value {
            display: table-cell;
            padding: 8px;
            border: 1px solid #ddd;
        }
        .stat-label {
            font-weight: bold;
            background-color: #f8f9fa;
            width: 40%;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .sam { background-color: #DC3545; color: white; font-weight: bold; text-align: center; }
        .mam { background-color: #FFC107; color: black; font-weight: bold; text-align: center; }
        .normal { background-color: #28A745; color: white; font-weight: bold; text-align: center; }
        .overweight { background-color: #17A2B8; color: white; font-weight: bold; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>OPT PLUS SUMMARY REPORT</h1>
        <p>Generated: {{ now()->format('F d, Y h:i A') }}</p>
        @if($barangay_name)
            <p><strong>Barangay:</strong> {{ $barangay_name }}</p>
        @endif
        @if($date_range)
            <p><strong>Period:</strong> {{ $date_range }}</p>
        @endif
    </div>

    <div class="section-title">Overall Statistics</div>
    <div class="stats-grid">
        <div class="stat-item">
            <div class="stat-label">Total Children</div>
            <div class="stat-value">{{ number_format($overall_statistics['total_children']) }}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Total Measurements</div>
            <div class="stat-value">{{ number_format($overall_statistics['total_measurements']) }}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Coverage Rate</div>
            <div class="stat-value">{{ number_format($overall_statistics['coverage_rate'], 1) }}%</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Malnutrition Rate</div>
            <div class="stat-value">{{ number_format($overall_statistics['malnutrition_rate'], 1) }}%</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">High Risk Children</div>
            <div class="stat-value">{{ number_format($overall_statistics['high_risk_count']) }}</div>
        </div>
    </div>

    <div class="section-title">Nutritional Status Breakdown</div>
    <table>
        <thead>
            <tr>
                <th>Classification</th>
                <th style="text-align: center;">Count</th>
                <th style="text-align: center;">Percentage</th>
            </tr>
        </thead>
        <tbody>
            @foreach($nutritional_status as $status)
            <tr>
                <td class="{{ strtolower(str_replace(' ', '', $status['classification'])) }}">
                    {{ $status['classification'] }}
                </td>
                <td style="text-align: center;">{{ number_format($status['count']) }}</td>
                <td style="text-align: center;">{{ number_format($status['percentage'], 1) }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if(count($age_groups) > 0)
    <div class="section-title">Age Group Distribution</div>
    <table>
        <thead>
            <tr>
                <th>Age Group</th>
                <th style="text-align: center;">Count</th>
                <th style="text-align: center;">Percentage</th>
            </tr>
        </thead>
        <tbody>
            @foreach($age_groups as $group)
            <tr>
                <td>{{ $group['age_group'] }}</td>
                <td style="text-align: center;">{{ number_format($group['count']) }}</td>
                <td style="text-align: center;">{{ number_format($group['percentage'], 1) }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        <p>OPT Plus Digital System | National Nutrition Council</p>
        <p>This report is system-generated and contains confidential information.</p>
    </div>
</body>
</html>
