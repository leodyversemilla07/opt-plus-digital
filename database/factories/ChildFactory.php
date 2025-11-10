<?php

namespace Database\Factories;

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Child>
 */
class ChildFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $middleName = fake()->lastName();
        $lastName = fake()->lastName();
        $sex = fake()->randomElement(['male', 'female']);

        // Generate date of birth for children 0-59 months old
        $dateOfBirth = fake()->dateTimeBetween('-59 months', 'now');

        // Generate Filipino contact number format
        $contactNumber = fake()->optional()->numerify('09#########');

        // Indigenous people (approximately 10-15% of population)
        $isIndigenousPeople = fake()->boolean(12);
        $ipTribes = [
            'Aeta', 'Igorot', 'Lumad', 'Manobo', 'T\'boli',
            'Mangyan', 'Badjao', 'Tagbanwa', 'B\'laan', 'Subanen',
        ];

        return [
            'family_serial_number' => fake()->unique()->numerify('FSN-####-####'),
            'first_name' => $firstName,
            'middle_name' => $middleName,
            'last_name' => $lastName,
            'sex' => $sex,
            'date_of_birth' => $dateOfBirth,
            'address' => fake()->streetAddress(),
            'purok_sitio' => fake()->optional()->randomElement([
                'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4',
                'Sitio San Jose', 'Sitio San Miguel', 'Sitio Rizal',
            ]),
            'barangay_id' => Barangay::factory(),
            'mother_caregiver_name' => fake()->name('female'),
            'father_name' => fake()->optional()->name('male'),
            'contact_number' => $contactNumber,
            'alternative_contact_number' => fake()->optional()->numerify('09#########'),
            'is_indigenous_people' => $isIndigenousPeople,
            'ip_tribe_name' => $isIndigenousPeople ? fake()->randomElement($ipTribes) : null,
            'photo_url' => null,
            'qr_code' => fake()->unique()->uuid(),
            'created_by_user_id' => User::factory(),
        ];
    }

    public function male(): static
    {
        return $this->state(fn (array $attributes) => [
            'sex' => 'male',
        ]);
    }

    public function female(): static
    {
        return $this->state(fn (array $attributes) => [
            'sex' => 'female',
        ]);
    }

    public function indigenousPeople(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_indigenous_people' => true,
            'ip_tribe_name' => fake()->randomElement([
                'Aeta', 'Igorot', 'Lumad', 'Manobo', 'T\'boli',
            ]),
        ]);
    }

    public function ageInMonths(int $months): static
    {
        $dateOfBirth = now()->subMonths($months);

        return $this->state(fn (array $attributes) => [
            'date_of_birth' => $dateOfBirth,
        ]);
    }
}
