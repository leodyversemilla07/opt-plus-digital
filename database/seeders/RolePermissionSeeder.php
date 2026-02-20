<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Child Management
            'view children',
            'create children',
            'edit children',
            'delete children',

            // Measurement Management
            'view measurements',
            'create measurements',
            'edit measurements',
            'delete measurements',

            // Reports
            'view reports',
            'export reports',

            // Analytics
            'view analytics',
            'view barangay analytics',
            'view municipal analytics',

            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            'manage roles',

            // Settings
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Admin - Full access
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());

        // Municipal Health Officer - View and manage municipality-wide data
        $municipal = Role::create(['name' => 'municipal']);
        $municipal->givePermissionTo([
            'view children',
            'create children',
            'edit children',
            'view measurements',
            'create measurements',
            'edit measurements',
            'view reports',
            'export reports',
            'view analytics',
            'view barangay analytics',
            'view municipal analytics',
            'view users',
            'create users',
            'edit users',
        ]);

        // Barangay Nutrition Scholar (BNS) - Manage barangay data
        $bns = Role::create(['name' => 'bns']);
        $bns->givePermissionTo([
            'view children',
            'create children',
            'edit children',
            'view measurements',
            'create measurements',
            'edit measurements',
            'view reports',
            'export reports',
            'view analytics',
            'view barangay analytics',
        ]);

        // Barangay Health Worker (BHW) - Field data collection
        $bhw = Role::create(['name' => 'bhw']);
        $bhw->givePermissionTo([
            'view children',
            'create children',
            'edit children',
            'view measurements',
            'create measurements',
            'edit measurements',
            'view reports',
        ]);
    }
}
