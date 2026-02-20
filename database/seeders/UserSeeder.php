<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get a barangay for assignment
        $barangay = Barangay::first();
        $barangayId = $barangay?->id;

        // Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@optplus.test'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin');

        // Municipal User
        $municipal = User::firstOrCreate(
            ['email' => 'municipal@optplus.test'],
            [
                'name' => 'Municipal Health Officer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $municipal->assignRole('municipal');

        // BNS User
        $bns = User::firstOrCreate(
            ['email' => 'bns@optplus.test'],
            [
                'name' => 'Maria Santos',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'barangay_id' => $barangayId,
                'is_active' => true,
            ]
        );
        $bns->assignRole('bns');

        // BHW User
        $bhw = User::firstOrCreate(
            ['email' => 'bhw@optplus.test'],
            [
                'name' => 'Juan Dela Cruz',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'barangay_id' => $barangayId,
                'is_active' => true,
            ]
        );
        $bhw->assignRole('bhw');
    }
}
