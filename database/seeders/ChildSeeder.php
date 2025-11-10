<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Child;
use App\Models\Measurement;
use App\Models\User;
use Illuminate\Database\Seeder;

class ChildSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users for different roles
        $bhw = User::firstOrCreate(
            ['email' => 'bhw@optplus.test'],
            [
                'name' => 'Maria Santos (BHW)',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $bns = User::firstOrCreate(
            ['email' => 'bns@optplus.test'],
            [
                'name' => 'Juan Dela Cruz (BNS)',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Get all barangays
        $barangays = Barangay::all();

        if ($barangays->isEmpty()) {
            $this->command->warn('No barangays found. Run BarangaySeeder first.');

            return;
        }

        $totalChildren = 0;
        $totalMeasurements = 0;

        // For each barangay, create children with varying nutritional statuses
        foreach ($barangays as $barangay) {
            // Estimate children per barangay: 15-30
            $childrenCount = rand(15, 30);

            for ($i = 0; $i < $childrenCount; $i++) {
                // Create child
                $child = Child::factory()
                    ->create([
                        'barangay_id' => $barangay->id,
                        'created_by_user_id' => rand(0, 1) ? $bhw->id : $bns->id,
                    ]);

                $totalChildren++;

                // Create 1-3 measurements per child
                $measurementCount = rand(1, 3);

                for ($j = 0; $j < $measurementCount; $j++) {
                    // Date progression (oldest to newest)
                    $daysAgo = ($measurementCount - $j) * 90; // 90 days apart

                    // Determine nutritional status distribution:
                    // 70% normal, 20% moderately malnourished, 10% severely malnourished
                    $rand = rand(1, 100);

                    if ($rand <= 70) {
                        // Normal
                        $measurement = Measurement::factory()
                            ->normal()
                            ->create([
                                'child_id' => $child->id,
                                'measurement_date' => now()->subDays($daysAgo),
                                'age_in_months' => $child->age_in_months - floor($daysAgo / 30),
                                'measured_by_user_id' => rand(0, 1) ? $bhw->id : $bns->id,
                            ]);
                    } elseif ($rand <= 90) {
                        // Moderately malnourished
                        $measurement = Measurement::factory()
                            ->malnourished()
                            ->create([
                                'child_id' => $child->id,
                                'measurement_date' => now()->subDays($daysAgo),
                                'age_in_months' => $child->age_in_months - floor($daysAgo / 30),
                                'measured_by_user_id' => rand(0, 1) ? $bhw->id : $bns->id,
                            ]);
                    } else {
                        // Severely malnourished
                        $measurement = Measurement::factory()
                            ->severelyMalnourished()
                            ->create([
                                'child_id' => $child->id,
                                'measurement_date' => now()->subDays($daysAgo),
                                'age_in_months' => $child->age_in_months - floor($daysAgo / 30),
                                'measured_by_user_id' => rand(0, 1) ? $bhw->id : $bns->id,
                            ]);
                    }

                    $totalMeasurements++;
                }
            }
        }

        $this->command->info("Seeded {$totalChildren} children with {$totalMeasurements} measurements");
    }
}
