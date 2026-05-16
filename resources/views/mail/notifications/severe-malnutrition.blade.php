<x-mail::message>
# 🚨 Severe Malnutrition Alert

A child has been identified with **Severe Acute Malnutrition (SAM)** during a recent OPT session.

---

## Child Details

- **Name:** {{ $child->full_name }}
- **Age:** {{ $measurement->age_in_months }} months
- **Barangay:** {{ $child->barangay?->name ?? 'N/A' }}
- **Date of Birth:** {{ $child->date_of_birth->toFormattedDateString() }}
- **Sex:** {{ $child->sex === 'male' ? 'Male' : 'Female' }}
- **Contact:** {{ $child->mother_caregiver_name }} ({{ $child->contact_number ?? 'N/A' }})

## Measurement Results

| Metric | Value |
|:---|---:|
| Measurement Date | {{ $measurement->measurement_date->toFormattedDateString() }} |
| Weight | {{ $measurement->weight_kg }} kg |
| Height/Length | {{ $measurement->height_length_cm }} cm |
| Weight-for-Age Z-Score | {{ number_format($measurement->weight_for_age_zscore, 2) }} |
| Height-for-Age Z-Score | {{ number_format($measurement->height_for_age_zscore, 2) }} |
| Weight-for-Height Z-Score | {{ number_format($measurement->weight_for_height_zscore, 2) }} |
@if ($measurement->has_edema)
| Edema | Present (Grade {{ $measurement->edema_grade ?? 'N/A' }}) |
@endif
| Classification | **SAM** |

<x-mail::button :url="$childUrl" color="error">
View Child Profile
</x-mail::button>

This child requires **immediate medical attention and nutritional intervention**. Please coordinate with your local health center for proper management.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
