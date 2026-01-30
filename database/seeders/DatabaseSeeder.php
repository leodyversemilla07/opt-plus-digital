<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting OPT Plus database seeding...');

        // Run seeders in order
        $this->call([
            RolePermissionSeeder::class,  // Roles and permissions first
            WhoStandardSeeder::class,     // WHO data
            BarangaySeeder::class,        // Barangays
            UserSeeder::class,            // Users with roles
            ChildSeeder::class,           // Children data
        ]);

        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->newLine();
        $this->command->info('🔑 Test accounts created:');
        $this->command->info('   - admin@optplus.test     (Admin)');
        $this->command->info('   - municipal@optplus.test (Municipal Officer)');
        $this->command->info('   - bns@optplus.test       (BNS)');
        $this->command->info('   - bhw@optplus.test       (BHW)');
        $this->command->info('   Password for all: password');
    }
}

