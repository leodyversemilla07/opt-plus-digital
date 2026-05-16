<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MassMail extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'message_body',
        'recipient_type',
        'recipient_criteria',
        'total_recipients',
        'sent_count',
        'failed_count',
        'status',
        'created_by',
        'sent_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'recipient_criteria' => 'array',
            'sent_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isQueued(): bool
    {
        return $this->status === 'queued';
    }

    public function isSent(): bool
    {
        return in_array($this->status, ['sent', 'partially_sent']);
    }
}
