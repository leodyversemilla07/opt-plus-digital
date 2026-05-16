<?php

namespace App\Notifications;

use App\Models\ScheduledReport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReportGeneratedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ScheduledReport $report
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Check user's notification preferences for email channel
        $pref = $notifiable->notificationPreferences()
            ->where('notification_type', 'report_generated')
            ->first();

        if ($pref?->email ?? true) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('reports.scheduled.download', $this->report);

        return (new MailMessage)
            ->subject('Report Generated: '.$this->report->title)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A new report has been generated:')
            ->line('**'.$this->report->title.'**')
            ->line('Type: '.ucfirst($this->report->type))
            ->line('Generated: '.$this->report->generated_at->format('F d, Y h:i A'))
            ->action('Download Report', $url)
            ->line('This report is available for download in your account.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'report_id' => $this->report->id,
            'title' => $this->report->title,
            'type' => $this->report->type,
            'generated_at' => $this->report->generated_at->toDateTimeString(),
            'notif_type' => 'report_generated',
        ];
    }
}
