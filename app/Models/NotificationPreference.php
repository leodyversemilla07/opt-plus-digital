<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'notification_type',
        'database',
        'email',
        'push',
    ];

    protected $attributes = [
        'database' => 1,
        'email' => 1,
        'push' => 1,
    ];

    protected function casts(): array
    {
        return [
            'database' => 'boolean',
            'email' => 'boolean',
            'push' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
