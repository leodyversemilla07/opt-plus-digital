<?php

namespace Database\Seeders;

use App\Models\Barangay;
use Illuminate\Database\Seeder;

class BarangaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample barangays from different regions of the Philippines
        $barangays = [
            // NCR - Manila
            [
                'name' => 'Barangay 1 (Poblacion)',
                'municipality_city' => 'Manila',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'psgc_code' => '1337500001',
                'estimated_population_0_59_months' => 320,
            ],
            [
                'name' => 'Tondo',
                'municipality_city' => 'Manila',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'psgc_code' => '1337500897',
                'estimated_population_0_59_months' => 850,
            ],

            // NCR - Quezon City
            [
                'name' => 'Batasan Hills',
                'municipality_city' => 'Quezon City',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'psgc_code' => '1374200009',
                'estimated_population_0_59_months' => 450,
            ],
            [
                'name' => 'Commonwealth',
                'municipality_city' => 'Quezon City',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'psgc_code' => '1374200030',
                'estimated_population_0_59_months' => 680,
            ],

            // Region VII - Cebu
            [
                'name' => 'Guadalupe',
                'municipality_city' => 'Cebu City',
                'province' => 'Cebu',
                'region' => 'Region VII',
                'psgc_code' => '0722200033',
                'estimated_population_0_59_months' => 520,
            ],
            [
                'name' => 'Lahug',
                'municipality_city' => 'Cebu City',
                'province' => 'Cebu',
                'region' => 'Region VII',
                'psgc_code' => '0722200045',
                'estimated_population_0_59_months' => 390,
            ],

            // Region XI - Davao
            [
                'name' => 'Poblacion',
                'municipality_city' => 'Davao City',
                'province' => 'Davao del Sur',
                'region' => 'Region XI',
                'psgc_code' => '1123800059',
                'estimated_population_0_59_months' => 410,
            ],
            [
                'name' => 'Buhangin',
                'municipality_city' => 'Davao City',
                'province' => 'Davao del Sur',
                'region' => 'Region XI',
                'psgc_code' => '1123800014',
                'estimated_population_0_59_months' => 560,
            ],

            // Region IV-A - Cavite
            [
                'name' => 'San Jose',
                'municipality_city' => 'Dasmarinas',
                'province' => 'Cavite',
                'region' => 'Region IV-A',
                'psgc_code' => '0421200077',
                'estimated_population_0_59_months' => 720,
            ],
            [
                'name' => 'Paliparan',
                'municipality_city' => 'Dasmarinas',
                'province' => 'Cavite',
                'region' => 'Region IV-A',
                'psgc_code' => '0421200065',
                'estimated_population_0_59_months' => 490,
            ],

            // Region III - Bulacan
            [
                'name' => 'San Jose',
                'municipality_city' => 'Malolos',
                'province' => 'Bulacan',
                'region' => 'Region III',
                'psgc_code' => '0314100022',
                'estimated_population_0_59_months' => 380,
            ],
            [
                'name' => 'Barasoain',
                'municipality_city' => 'Malolos',
                'province' => 'Bulacan',
                'region' => 'Region III',
                'psgc_code' => '0314100003',
                'estimated_population_0_59_months' => 290,
            ],
        ];

        foreach ($barangays as $barangay) {
            Barangay::firstOrCreate(
                ['psgc_code' => $barangay['psgc_code']],
                $barangay
            );
        }

        // Create additional random barangays for testing
        Barangay::factory(38)->create();

        $this->command->info('Seeded 50 barangays (12 real + 38 test data)');
    }
}
