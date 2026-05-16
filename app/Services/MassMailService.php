<?php

namespace App\Services;

use App\Jobs\SendMassMailChunk;
use App\Models\Child;
use App\Models\MassMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class MassMailService
{
    /**
     * Resolve recipients based on recipient_type and criteria
     */
    public function resolveRecipients(string $recipientType, ?array $criteria = null): array
    {
        $recipients = [];

        switch ($recipientType) {
            case 'all_parents':
                $children = Child::whereNotNull('contact_number')
                    ->where('contact_number', '!=', '')
                    ->get();

                foreach ($children as $child) {
                    $name = $child->guardian_name ?? $child->mother_name ?? $child->father_name ?? 'Parent/Guardian';
                    $recipients[] = [
                        'email' => $child->contact_number, // May be contact number or email
                        'name' => $name,
                    ];
                }
                break;

            case 'by_barangay':
                $barangayId = $criteria['barangay_id'] ?? null;
                if (! $barangayId) {
                    break;
                }

                $children = Child::where('barangay_id', $barangayId)
                    ->whereNotNull('contact_number')
                    ->where('contact_number', '!=', '')
                    ->get();

                foreach ($children as $child) {
                    $name = $child->guardian_name ?? $child->mother_name ?? $child->father_name ?? 'Parent/Guardian';
                    $recipients[] = [
                        'email' => $child->contact_number,
                        'name' => $name,
                    ];
                }
                break;

            case 'by_classification':
                $classification = $criteria['classification'] ?? null;
                if (! $classification) {
                    break;
                }

                $children = Child::whereHas('measurements', function ($q) use ($classification) {
                    $q->where('opt_classification', $classification)
                        ->latest('measurement_date');
                })
                    ->whereNotNull('contact_number')
                    ->where('contact_number', '!=', '')
                    ->get();

                foreach ($children as $child) {
                    $name = $child->guardian_name ?? $child->mother_name ?? $child->father_name ?? 'Parent/Guardian';
                    $recipients[] = [
                        'email' => $child->contact_number,
                        'name' => $name,
                    ];
                }
                break;

            case 'specific_roles':
                $roles = $criteria['roles'] ?? [];
                $barangayId = $criteria['barangay_id'] ?? null;

                $query = User::query();

                if (! empty($roles)) {
                    $query->whereHas('roles', function ($q) use ($roles) {
                        $q->whereIn('name', $roles);
                    });
                }

                if ($barangayId) {
                    $query->where('barangay_id', $barangayId);
                }

                $users = $query->where('is_active', true)->get();

                foreach ($users as $user) {
                    $recipients[] = [
                        'email' => $user->email,
                        'name' => $user->name,
                    ];
                }
                break;
        }

        return $recipients;
    }

    /**
     * Get recipient counts by type (for UI preview)
     */
    public function getRecipientCount(string $recipientType, ?array $criteria = null): int
    {
        return count($this->resolveRecipients($recipientType, $criteria));
    }

    /**
     * Queue a mass mail for sending
     */
    public function queueMassMail(MassMail $massMail): void
    {
        $recipients = $this->resolveRecipients(
            $massMail->recipient_type,
            $massMail->recipient_criteria
        );

        $massMail->update([
            'total_recipients' => count($recipients),
            'status' => 'queued',
        ]);

        if (count($recipients) === 0) {
            $massMail->update([
                'status' => 'sent',
                'sent_count' => 0,
                'completed_at' => now(),
            ]);

            return;
        }

        // Dispatch individual jobs for each recipient
        // Using chunking to avoid too many jobs at once
        $chunks = array_chunk($recipients, 50);

        foreach ($chunks as $chunkIndex => $chunk) {
            SendMassMailChunk::dispatch($massMail->id, $chunk, $chunkIndex)
                ->onQueue('mass-mail');
        }
    }

    /**
     * Get available classifications for filtering
     */
    public static function getClassifications(): array
    {
        return [
            'sam' => 'Severe Acute Malnutrition (SAM)',
            'mam' => 'Moderate Acute Malnutrition (MAM)',
            'overweight' => 'Overweight',
            'obese' => 'Obese',
            'stunted' => 'Stunted',
            'severely_stunted' => 'Severely Stunted',
            'wasted' => 'Wasted',
            'severely_wasted' => 'Severely Wasted',
            'underweight' => 'Underweight',
            'severely_underweight' => 'Severely Underweight',
        ];
    }

    /**
     * Get available recipient types
     */
    public static function getRecipientTypes(): array
    {
        return [
            'all_parents' => 'All Parents/Guardians',
            'by_barangay' => 'By Barangay',
            'by_classification' => 'By Nutritional Classification',
            'specific_roles' => 'Specific User Roles',
        ];
    }
}
