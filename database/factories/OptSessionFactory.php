<?php

namespace Database\Factories;

use App\Models\Barangay;
use App\Models\OptSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OptSession>
 */
class OptSessionFactory extends Factory
{
    protected $model = OptSession::class;

    public function definition(): array
    {
        return [
            'barangay_id' => Barangay::factory(),
            'name' => 'OPT Session ' . fake()->monthName() . ' ' . fake()->year(),
            'session_date' => fake()->dateTimeThisYear(),
            'status' => 'scheduled',
            'target_children' => fake()->numberBetween(50, 500),
            'measured_children' => 0,
            'coverage_percentage' => 0,
            'notes' => fake()->optional()->sentence(),
            'venue' => fake()->optional()->streetName() . ' Health Center',
            'created_by_user_id' => User::factory(),
        ];
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'scheduled',
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'start_date' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'start_date' => now()->subDays(3),
            'end_date' => now(),
            'measured_children' => fake()->numberBetween(50, 200),
            'coverage_percentage' => fake()->randomFloat(1, 50, 100),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}
