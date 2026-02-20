<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in order
        $this->call([
            RolePermissionSeeder::class,  // Roles and permissions first
            WhoStandardSeeder::class,     // WHO data
            BarangaySeeder::class,        // Barangays
            UserSeeder::class,            // Users with roles
            ChildSeeder::class,           // Children data
        ]);
    }
}
