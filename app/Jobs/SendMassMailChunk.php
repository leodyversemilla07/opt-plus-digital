<?php

namespace App\Jobs;

use App\Mail\MassMailMessage;
use App\Models\MassMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendMassMailChunk implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;

    public function __construct(
        public int $massMailId,
        public array $recipients,
        public int $chunkIndex
    ) {}

    public function handle(): void
    {
        $massMail = MassMail::findOrFail($this->massMailId);
        $sent = 0;
        $failed = 0;

        foreach ($this->recipients as $recipient) {
            try {
                Mail::send(new MassMailMessage($massMail, $recipient['name']));
                $sent++;
            } catch (\Exception $e) {
                $failed++;
                Log::error("Mass mail #{$this->massMailId} failed for {$recipient['email']}: {$e->getMessage()}");
            }
        }

        $massMail->increment('sent_count', $sent);
        $massMail->increment('failed_count', $failed);

        // Check if all chunks are done
        $this->checkCompletion($massMail);
    }

    private function checkCompletion(MassMail $massMail): void
    {
        $totalChunks = (int) ceil($massMail->total_recipients / 50);
        $expectedSent = $massMail->sent_count + $massMail->failed_count;

        // This job and all other chunks have completed
        if ($expectedSent >= $massMail->total_recipients) {
            $newStatus = $massMail->failed_count > 0 && $massMail->sent_count > 0
                ? 'partially_sent'
                : ($massMail->failed_count > 0 ? 'failed' : 'sent');

            $massMail->update([
                'status' => $newStatus,
                'completed_at' => now(),
            ]);
        }
    }
}
