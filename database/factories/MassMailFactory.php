<?php

namespace Database\Factories;

use App\Models\MassMail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MassMail>
 */
class MassMailFactory extends Factory
{
    protected $model = MassMail::class;

    public function definition(): array
    {
        return [
            'subject' => fake()->sentence(),
            'message_body' => fake()->paragraphs(3, true),
            'recipient_type' => 'all_parents',
            'total_recipients' => 0,
            'sent_count' => 0,
            'failed_count' => 0,
            'status' => 'draft',
            'created_by' => User::factory(),
            'sent_at' => null,
            'completed_at' => null,
        ];
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'sent',
            'total_recipients' => 100,
            'sent_count' => 100,
            'sent_at' => now(),
            'completed_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'total_recipients' => 100,
            'failed_count' => 100,
            'completed_at' => now(),
        ]);
    }
}
