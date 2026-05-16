<?php

namespace App\Notifications;

use App\Models\Measurement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SevereMalnutritionAlert extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Measurement $measurement
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $child = $this->measurement->child;
        $childUrl = route('children.show', $child);

        return (new MailMessage)
            ->subject('URGENT: Severe Malnutrition Alert - '.$child->full_name)
            ->markdown('mail.notifications.severe-malnutrition', [
                'measurement' => $this->measurement,
                'child' => $child,
                'childUrl' => $childUrl,
            ]);
    }

    /**
     * Get the array representation of the notification for the database.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $child = $this->measurement->child;

        return [
            'measurement_id' => $this->measurement->id,
            'child_id' => $child->id,
            'child_name' => $child->full_name,
            'barangay_id' => $child->barangay_id,
            'barangay_name' => $child->barangay?->name,
            'measurement_date' => $this->measurement->measurement_date->toDateString(),
            'age_in_months' => $this->measurement->age_in_months,
            'weight_kg' => $this->measurement->weight_kg,
            'height_length_cm' => $this->measurement->height_length_cm,
            'weight_for_age_zscore' => $this->measurement->weight_for_age_zscore,
            'height_for_age_zscore' => $this->measurement->height_for_age_zscore,
            'weight_for_height_zscore' => $this->measurement->weight_for_height_zscore,
            'opt_classification' => $this->measurement->opt_classification,
            'has_edema' => $this->measurement->has_edema,
            'type' => 'severe_malnutrition',
        ];
    }
}
