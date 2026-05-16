<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditLogService
{
    private ?int $userId = null;

    private ?string $action = null;

    private ?Model $subject = null;

    private ?array $oldValues = null;

    private ?array $newValues = null;

    private ?string $ipAddress = null;

    private ?string $userAgent = null;

    /**
     * Set the user who performed the action.
     */
    public function performedBy(?User $user): static
    {
        $this->userId = $user?->id;

        return $this;
    }

    /**
     * Set the action being logged.
     */
    public function withAction(string $action): static
    {
        $this->action = $action;

        return $this;
    }

    /**
     * Set the model that was acted upon.
     */
    public function on(Model $subject): static
    {
        $this->subject = $subject;

        return $this;
    }

    /**
     * Set the old values (for updates / deletes).
     */
    public function withOld(?array $values): static
    {
        $this->oldValues = $values;

        return $this;
    }

    /**
     * Set the new values (for creates / updates).
     */
    public function withNew(?array $values): static
    {
        $this->newValues = $values;

        return $this;
    }

    /**
     * Set IP address.
     */
    public function fromIp(?string $ip): static
    {
        $this->ipAddress = $ip;

        return $this;
    }

    /**
     * Set user agent.
     */
    public function withUserAgent(?string $userAgent): static
    {
        $this->userAgent = $userAgent;

        return $this;
    }

    /**
     * Persist the audit log entry.
     */
    public function log(): AuditLog
    {
        if ($this->action === null) {
            throw new \InvalidArgumentException('Action is required to create an audit log.');
        }

        if ($this->subject === null) {
            throw new \InvalidArgumentException('Subject model is required to create an audit log.');
        }

        return AuditLog::create([
            'user_id' => $this->userId,
            'action' => $this->action,
            'auditable_type' => $this->subject->getMorphClass(),
            'auditable_id' => $this->subject->getKey(),
            'old_values' => $this->oldValues,
            'new_values' => $this->newValues,
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
        ]);
    }

    /**
     * Quick shorthand: log a creation.
     */
    public static function created(Model $subject, ?User $user = null): AuditLog
    {
        return self::make()
            ->performedBy($user ?? request()?->user())
            ->withAction('created')
            ->on($subject)
            ->withNew($subject->toArray())
            ->fromIp(request()?->ip())
            ->log();
    }

    /**
     * Quick shorthand: log an update with diff.
     */
    public static function updated(Model $subject, array $oldValues, array $newValues, ?User $user = null): AuditLog
    {
        return self::make()
            ->performedBy($user ?? request()?->user())
            ->withAction('updated')
            ->on($subject)
            ->withOld($oldValues)
            ->withNew($newValues)
            ->fromIp(request()?->ip())
            ->log();
    }

    /**
     * Quick shorthand: log a deletion.
     */
    public static function deleted(Model $subject, ?User $user = null): AuditLog
    {
        return self::make()
            ->performedBy($user ?? request()?->user())
            ->withAction('deleted')
            ->on($subject)
            ->withOld($subject->toArray())
            ->fromIp(request()?->ip())
            ->log();
    }

    /**
     * Generic shorthand for any custom action.
     */
    public static function logAction(
        string $action,
        Model $subject,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $user = null,
    ): AuditLog {
        return self::make()
            ->performedBy($user ?? request()?->user())
            ->withAction($action)
            ->on($subject)
            ->withOld($oldValues)
            ->withNew($newValues)
            ->fromIp(request()?->ip())
            ->log();
    }

    /**
     * Create a new service instance.
     */
    public static function make(): static
    {
        return new static;
    }
}
