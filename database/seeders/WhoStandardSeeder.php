<?php

namespace Database\Seeders;

use App\Models\WhoStandard;
use Illuminate\Database\Seeder;

class WhoStandardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * NOTE: This seeder contains SAMPLE DATA for development/testing.
     * For production, import full WHO 2006 Child Growth Standards data from:
     * https://www.who.int/tools/child-growth-standards/standards
     *
     * Full dataset files needed:
     * - wfa-boys-0-5-zscores.txt
     * - wfa-girls-0-5-zscores.txt
     * - hfa-boys-0-5-zscores.txt
     * - hfa-girls-0-5-zscores.txt
     * - wfh-boys-0-2-zscores.txt
     * - wfh-girls-0-2-zscores.txt
     */
    public function run(): void
    {
        $this->command->info('Seeding WHO Growth Standards (Sample Data)...');

        // Sample Weight-for-Age data for boys (0-60 months)
        $this->seedWeightForAgeBoys();

        // Sample Weight-for-Age data for girls
        $this->seedWeightForAgeGirls();

        // Sample Height-for-Age data
        $this->seedHeightForAge();

        // Sample Weight-for-Height data
        $this->seedWeightForHeight();

        $this->command->info('✅ Sample WHO data seeded successfully');
        $this->command->warn('⚠️  For production, import full WHO dataset from official sources');
    }

    /**
     * Seed sample Weight-for-Age data for boys
     * Data source: WHO 2006 Child Growth Standards
     */
    protected function seedWeightForAgeBoys(): void
    {
        $data = [
            // Days, L, M, S (sample entries for ages 0, 30, 90, 180, 365, 730, 1095, 1460, 1825 days)
            [0, 0.3487, 3.3464, 0.14602],      // Birth
            [30, 0.2297, 4.4709, 0.13085],     // 1 month
            [91, 0.1970, 5.8346, 0.12619],     // 3 months
            [183, 0.1738, 7.5340, 0.12058],    // 6 months
            [365, 0.1611, 9.6461, 0.11727],    // 12 months
            [730, 0.1515, 12.1515, 0.11316],   // 24 months
            [1095, 0.1453, 14.3354, 0.11080],  // 36 months
            [1460, 0.1412, 16.3391, 0.10958],  // 48 months
            [1826, 0.1395, 18.2663, 0.10881],  // 60 months
        ];

        foreach ($data as [$days, $l, $m, $s]) {
            WhoStandard::create([
                'indicator' => 'wfa',
                'sex' => 'male',
                'age_or_length' => $days,
                'l' => $l,
                'm' => $m,
                's' => $s,
            ]);
        }
    }

    /**
     * Seed sample Weight-for-Age data for girls
     */
    protected function seedWeightForAgeGirls(): void
    {
        $data = [
            [0, 0.3809, 3.2322, 0.14171],
            [30, 0.252, 4.2021, 0.13018],
            [91, 0.2133, 5.3996, 0.12402],
            [183, 0.1897, 6.9863, 0.11698],
            [365, 0.1752, 8.9454, 0.11309],
            [730, 0.1630, 11.2806, 0.10977],
            [1095, 0.1547, 13.4528, 0.10802],
            [1460, 0.1492, 15.5353, 0.10712],
            [1826, 0.1461, 17.5707, 0.10663],
        ];

        foreach ($data as [$days, $l, $m, $s]) {
            WhoStandard::create([
                'indicator' => 'wfa',
                'sex' => 'female',
                'age_or_length' => $days,
                'l' => $l,
                'm' => $m,
                's' => $s,
            ]);
        }
    }

    /**
     * Seed sample Height-for-Age data
     */
    protected function seedHeightForAge(): void
    {
        // Boys
        $boyData = [
            [0, 1, 49.8842, 0.03795],
            [30, 1, 54.7244, 0.03486],
            [91, 1, 61.4292, 0.03328],
            [183, 1, 67.6236, 0.03307],
            [365, 1, 75.7488, 0.03249],
            [730, 1, 87.0771, 0.03146],
            [1095, 1, 96.0994, 0.03106],
            [1460, 1, 103.3062, 0.03080],
            [1826, 1, 109.9037, 0.03063],
        ];

        foreach ($boyData as [$days, $l, $m, $s]) {
            WhoStandard::create([
                'indicator' => 'hfa',
                'sex' => 'male',
                'age_or_length' => $days,
                'l' => $l,
                'm' => $m,
                's' => $s,
            ]);
        }

        // Girls
        $girlData = [
            [0, 1, 49.1477, 0.03790],
            [30, 1, 53.6872, 0.03449],
            [91, 1, 59.8029, 0.03288],
            [183, 1, 65.7311, 0.03268],
            [365, 1, 74.0024, 0.03204],
            [730, 1, 85.7122, 0.03089],
            [1095, 1, 94.9931, 0.03048],
            [1460, 1, 102.3876, 0.03022],
            [1826, 1, 109.2140, 0.03006],
        ];

        foreach ($girlData as [$days, $l, $m, $s]) {
            WhoStandard::create([
                'indicator' => 'hfa',
                'sex' => 'female',
                'age_or_length' => $days,
                'l' => $l,
                'm' => $m,
                's' => $s,
            ]);
        }
    }

    /**
     * Seed sample Weight-for-Height data
     * Note: WHO uses height in 0.1 cm increments (e.g., 450 = 45.0 cm)
     */
    protected function seedWeightForHeight(): void
    {
        // Boys (heights 45-110 cm)
        $boyData = [
            [450, -0.3833, 2.4410, 0.09182],  // 45.0 cm
            [550, -0.3833, 3.5426, 0.08655],  // 55.0 cm
            [650, -0.3833, 5.0064, 0.08174],  // 65.0 cm
            [750, -0.3833, 7.0023, 0.07770],  // 75.0 cm
            [850, -0.3833, 9.4738, 0.07436],  // 85.0 cm
            [950, -0.3833, 12.3159, 0.07175],  // 95.0 cm
            [1050, -0.3833, 15.4371, 0.06989],  // 105.0 cm
        ];

        foreach ($boyData as [$height, $l, $m, $s]) {
            WhoStandard::create([
                'indicator' => 'wfh',
                'sex' => 'male',
                'age_or_length' => $height,
                'l' => $l,
                'm' => $m,
                's' => $s,
            ]);
        }

        // Girls (heights 45-110 cm)
        $girlData = [
            [450, -0.3809, 2.3685, 0.09182],
            [550, -0.3809, 3.3906, 0.08675],
            [650, -0.3809, 4.7602, 0.08196],
            [750, -0.3809, 6.6090, 0.07784],
            [850, -0.3809, 8.8876, 0.07442],
            [950, -0.3809, 11.5365, 0.07175],
            [1050, -0.3809, 14.5032, 0.06981],
        ];

        foreach ($girlData as [$height, $l, $m, $s]) {
            WhoStandard::create([
                'indicator' => 'wfh',
                'sex' => 'female',
                'age_or_length' => $height,
                'l' => $l,
                'm' => $m,
                's' => $s,
            ]);
        }
    }
}
