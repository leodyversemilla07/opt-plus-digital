<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Barangay>
 */
class BarangayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true).' Barangay',
            'municipality_city' => fake()->city(),
            'province' => fake()->randomElement([
                'Manila', 'Cebu', 'Davao', 'Quezon', 'Bulacan',
                'Cavite', 'Laguna', 'Batangas', 'Pampanga', 'Rizal',
            ]),
            'region' => fake()->randomElement([
                'NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A',
                'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII',
                'Region IX', 'Region X', 'Region XI', 'Region XII', 'CAR', 'BARMM',
            ]),
            'psgc_code' => fake()->unique()->numerify('##########'),
            'estimated_population_0_59_months' => fake()->numberBetween(50, 500),
            'latitude' => fake()->latitude(4, 21), // Philippines latitude range
            'longitude' => fake()->longitude(116, 127), // Philippines longitude range
        ];
    }
}
