<?php

namespace App\Policies;

use App\Models\Child;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ChildPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view children');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Child $child): bool
    {
        if (! $user->hasPermissionTo('view children')) {
            return false;
        }

        // BHW and BNS can only view children in their own barangay
        if ($user->hasAnyRole(['bhw', 'bns'])) {
            return $user->barangay_id === $child->barangay_id;
        }

        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create children');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Child $child): bool
    {
        if (! $user->hasPermissionTo('edit children')) {
            return false;
        }

        // BHW and BNS can only update children in their own barangay
        if ($user->hasAnyRole(['bhw', 'bns'])) {
            return $user->barangay_id === $child->barangay_id;
        }

        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Child $child): bool
    {
        return $user->hasPermissionTo('delete children');
    }
}
