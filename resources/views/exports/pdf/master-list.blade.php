<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Master List - OPT Plus</title>
    <style>
        @page { margin: 15px; }
        body {
            font-family: Arial, sans-serif;
            font-size: 9px;
            margin: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 14px;
            margin: 0 0 5px 0;
        }
        .header p {
            margin: 0;
            font-size: 10px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
        }
        th, td {
            border: 1px solid #000;
            padding: 4px 2px;
            text-align: left;
        }
        th {
            background-color: #4472C4;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        td {
            vertical-align: top;
        }
        .no-col { width: 3%; text-align: center; }
        .id-col { width: 8%; }
        .name-col { width: 15%; }
        .sex-col { width: 4%; text-align: center; }
        .date-col { width: 8%; text-align: center; }
        .age-col { width: 5%; text-align: center; }
        .brgy-col { width: 12%; }
        .measurement-col { width: 7%; text-align: center; }
        .status-col { width: 10%; text-align: center; }
        .sam { background-color: #DC3545; color: white; font-weight: bold; }
        .mam { background-color: #FFC107; color: black; font-weight: bold; }
        .normal { background-color: #28A745; color: white; font-weight: bold; }
        .overweight { background-color: #17A2B8; color: white; font-weight: bold; }
        .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 8px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MASTER LIST - OPT PLUS</h1>
        <p>Generated: {{ now()->format('F d, Y h:i A') }}</p>
        @if($barangay_name)
            <p><strong>Barangay:</strong> {{ $barangay_name }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th class="no-col">No.</th>
                <th class="id-col">Child ID</th>
                <th class="name-col">Name</th>
                <th class="sex-col">Sex</th>
                <th class="date-col">Birth Date</th>
                <th class="age-col">Age (mo)</th>
                <th class="brgy-col">Barangay</th>
                <th class="date-col">Last Meas.</th>
                <th class="measurement-col">Weight (kg)</th>
                <th class="measurement-col">Height (cm)</th>
                <th class="status-col">Classification</th>
            </tr>
        </thead>
        <tbody>
            @foreach($children as $index => $child)
            @php
                $measurement = $child['latest_measurement'];
                $classification = $measurement['classification'] ?? 'N/A';
                $classStyle = strtolower(str_replace(' ', '', $classification));
            @endphp
            <tr>
                <td class="no-col">{{ $index + 1 }}</td>
                <td class="id-col">{{ $child['child_id'] }}</td>
                <td class="name-col">{{ $child['full_name'] }}</td>
                <td class="sex-col">{{ strtoupper(substr($child['sex'], 0, 1)) }}</td>
                <td class="date-col">{{ \Carbon\Carbon::parse($child['date_of_birth'])->format('m/d/Y') }}</td>
                <td class="age-col">{{ $child['age_in_months'] }}</td>
                <td class="brgy-col">{{ $child['barangay'] }}</td>
                <td class="date-col">{{ $measurement ? \Carbon\Carbon::parse($measurement['measurement_date'])->format('m/d/Y') : 'N/A' }}</td>
                <td class="measurement-col">{{ $measurement['weight'] ?? 'N/A' }}</td>
                <td class="measurement-col">{{ $measurement['height'] ?? 'N/A' }}</td>
                <td class="status-col {{ $classStyle }}">{{ $classification }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>OPT Plus Digital System | National Nutrition Council | Page {{ $children->currentPage() ?? 1 }} of {{ $children->lastPage() ?? 1 }}</p>
    </div>
</body>
</html>
