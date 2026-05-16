<?php

namespace App\Models\Concerns;

use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Model;

/**
 * Automatically log model events to the audit_logs table.
 *
 * Include this trait on any model you want to audit:
 *   use \App\Models\Concerns\Auditable;
 *
 * By default it logs `created`, `updated`, and `deleted` events.
 * Override `auditableEvents()` on the model to customise.
 */
trait Auditable
{
    /**
     * Boot the trait and register event listeners.
     */
    public static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            if (in_array('created', $model->auditableEvents())) {
                AuditLogService::created($model);
            }
        });

        static::updated(function (Model $model) {
            if (in_array('updated', $model->auditableEvents())) {
                $old = collect($model->getChanges())
                    ->mapWithKeys(fn (mixed $value, string $key) => [
                        $key => $model->getOriginal($key),
                    ])
                    ->toArray();

                $new = $model->getChanges();

                AuditLogService::updated($model, $old, $new);
            }
        });

        static::deleted(function (Model $model) {
            if (in_array('deleted', $model->auditableEvents())) {
                AuditLogService::deleted($model);
            }
        });
    }

    /**
     * Define which events should be audited.
     * Override on the model to exclude events.
     *
     * @return list<string>
     */
    public function auditableEvents(): array
    {
        return ['created', 'updated', 'deleted'];
    }
}
