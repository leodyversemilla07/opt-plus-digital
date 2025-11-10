<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('family_serial_number')->nullable();

            // Child information
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->enum('sex', ['male', 'female', 'intersex']);
            $table->date('date_of_birth');

            // Address
            $table->text('address');
            $table->string('purok_sitio')->nullable();
            $table->foreignUuid('barangay_id')->constrained()->onDelete('cascade');

            // Parent/Guardian information
            $table->string('mother_caregiver_name');
            $table->string('father_name')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('alternative_contact_number')->nullable();

            // Indigenous People status
            $table->boolean('is_indigenous_people')->default(false);
            $table->string('ip_tribe_name')->nullable();

            // Additional fields
            $table->string('photo_url')->nullable();
            $table->string('qr_code', 36)->unique()->nullable();

            // Audit
            $table->foreignId('created_by_user_id')->constrained('users', 'id')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();

            // Indexes for search and filtering
            $table->index(['last_name', 'first_name']);
            $table->index('date_of_birth');
            $table->index('barangay_id');
            $table->index('qr_code');
            $table->index('is_indigenous_people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
