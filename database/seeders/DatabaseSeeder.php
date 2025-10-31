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

        // Create default test user
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Run seeders in order
        $this->call([
            BarangaySeeder::class,
            ChildSeeder::class,
        ]);

        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->newLine();
        $this->command->info('🔑 Test accounts created:');
        $this->command->info('   - test@example.com (password: password)');
        $this->command->info('   - bhw@optplus.test (password: password)');
        $this->command->info('   - bns@optplus.test (password: password)');
    }
}
