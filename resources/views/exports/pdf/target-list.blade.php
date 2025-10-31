<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Target List - High Risk Children</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            background-color: #DC3545;
            color: white;
            padding: 15px;
        }
        .header h1 {
            font-size: 16px;
            margin: 0 0 5px 0;
        }
        .header p {
            margin: 0;
        }
        .alert {
            background-color: #FFF3CD;
            border: 1px solid #FFC107;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
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
            background-color: #DC3545;
            color: white;
            font-weight: bold;
        }
        .sam { background-color: #DC3545; color: white; font-weight: bold; text-align: center; }
        .mam { background-color: #FFC107; color: black; font-weight: bold; text-align: center; }
        .urgent {
            background-color: #FFE5E5;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠ TARGET LIST - HIGH RISK CHILDREN</h1>
        <p>Generated: {{ now()->format('F d, Y h:i A') }}</p>
        @if($barangay_name)
            <p><strong>Barangay:</strong> {{ $barangay_name }}</p>
        @endif
    </div>

    <div class="alert">
        <strong>⚠ PRIORITY ACTION REQUIRED</strong><br>
        These children require immediate nutritional intervention and close monitoring.
        Total High-Risk Children: <strong>{{ count($high_risk_children) }}</strong>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 20%;">Name</th>
                <th style="width: 8%;">Sex</th>
                <th style="width: 10%;">Age (months)</th>
                <th style="width: 15%;">Barangay</th>
                <th style="width: 12%;">Last Measurement</th>
                <th style="width: 10%;">Weight (kg)</th>
                <th style="width: 10%;">Height (cm)</th>
                <th style="width: 10%;">Classification</th>
            </tr>
        </thead>
        <tbody>
            @foreach($high_risk_children as $index => $child)
            @php
                $classification = $child['classification'];
                $classStyle = strtolower(str_replace(' ', '', $classification));
                $daysSince = $child['days_since_measurement'];
                $isUrgent = $daysSince > 30;
            @endphp
            <tr class="{{ $isUrgent ? 'urgent' : '' }}">
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td><strong>{{ $child['full_name'] }}</strong></td>
                <td style="text-align: center;">{{ strtoupper($child['sex']) }}</td>
                <td style="text-align: center;">{{ $child['age_in_months'] }}</td>
                <td>{{ $child['barangay'] }}</td>
                <td style="text-align: center;">
                    {{ \Carbon\Carbon::parse($child['measurement_date'])->format('m/d/Y') }}<br>
                    <small>({{ $daysSince }} days ago)</small>
                </td>
                <td style="text-align: center;">{{ number_format($child['weight'], 1) }}</td>
                <td style="text-align: center;">{{ number_format($child['height'], 1) }}</td>
                <td class="{{ $classStyle }}">{{ $classification }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #DC3545;">
        <strong>Legend:</strong><br>
        <span class="sam" style="padding: 2px 8px; margin-right: 10px;">SAM</span> Severely Acute Malnutrition - Immediate intervention required<br>
        <span class="mam" style="padding: 2px 8px; margin-right: 10px;">MAM</span> Moderate Acute Malnutrition - Close monitoring needed<br>
        <span style="background-color: #FFE5E5; padding: 2px 8px;">Highlighted rows</span> - Not measured in over 30 days (urgent follow-up needed)
    </div>

    <div class="footer">
        <p>OPT Plus Digital System | National Nutrition Council</p>
        <p>This report contains confidential health information.</p>
    </div>
</body>
</html>
