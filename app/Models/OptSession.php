<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OptSession extends Model
{
    /** @use HasFactory<\Database\Factories\OptSessionFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'barangay_id',
        'name',
        'session_date',
        'start_date',
        'end_date',
        'status',
        'target_children',
        'measured_children',
        'coverage_percentage',
        'notes',
        'venue',
        'created_by_user_id',
    ];

    protected $casts = [
        'session_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'target_children' => 'integer',
        'measured_children' => 'integer',
        'coverage_percentage' => 'decimal:2',
    ];

    /**
     * Get the barangay this session belongs to.
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * Get the user who created this session.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get all measurements recorded during this session.
     */
    public function measurements(): HasMany
    {
        return $this->hasMany(Measurement::class);
    }

    /**
     * Check if session is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if session is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if session is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Update session statistics based on measurements.
     */
    public function updateStatistics(): void
    {
        $this->measured_children = $this->measurements()->count();
        
        if ($this->target_children > 0) {
            $this->coverage_percentage = ($this->measured_children / $this->target_children) * 100;
        }
        
        $this->save();
    }

    /**
     * Get formatted session period.
     */
    public function getFormattedPeriodAttribute(): string
    {
        if ($this->start_date && $this->end_date) {
            return $this->start_date->format('M d') . ' - ' . $this->end_date->format('M d, Y');
        }
        
        return $this->session_date->format('F Y');
    }

    /**
     * Scope for active (non-cancelled) sessions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'cancelled');
    }

    /**
     * Scope for upcoming sessions.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('session_date', '>=', now())
            ->where('status', 'scheduled');
    }

    /**
     * Scope for current year sessions.
     */
    public function scopeCurrentYear($query)
    {
        return $query->whereYear('session_date', now()->year);
    }
}
