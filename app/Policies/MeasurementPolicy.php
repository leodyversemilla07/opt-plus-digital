<?php

namespace App\Policies;

use App\Models\Measurement;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MeasurementPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view measurements');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Measurement $measurement): bool
    {
        if (!$user->hasPermissionTo('view measurements')) {
            return false;
        }

        // BHW and BNS can only view measurements in their own barangay
        if ($user->hasAnyRole(['bhw', 'bns'])) {
            return $user->barangay_id === $measurement->child->barangay_id;
        }

        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create measurements');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Measurement $measurement): bool
    {
        if (!$user->hasPermissionTo('edit measurements')) {
            return false;
        }

        // BHW and BNS can only update measurements in their own barangay
        if ($user->hasAnyRole(['bhw', 'bns'])) {
            return $user->barangay_id === $measurement->child->barangay_id;
        }

        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Measurement $measurement): bool
    {
        return $user->hasPermissionTo('delete measurements');
    }
}
