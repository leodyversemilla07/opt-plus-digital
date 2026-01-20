<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DqcPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view DQC dashboard
     */
    public function viewDqc(User $user): bool
    {
        // BHW, BNS, MNO, Admin can view DQC
        return in_array($user->role ?? 'bhw', ['bhw', 'bns', 'municipal', 'admin']);
    }

    /**
     * Determine if user can export DQC reports
     */
    public function exportDqc(User $user): bool
    {
        // Only BNS, MNO, Admin can export
        return in_array($user->role ?? 'bhw', ['bns', 'municipal', 'admin']);
    }
}
