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
        Schema::create('barangays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('municipality_city');
            $table->string('province');
            $table->string('region');
            $table->string('psgc_code', 10)->unique()->comment('Philippine Standard Geographic Code');
            $table->integer('estimated_population_0_59_months')->nullable();
            $table->point('geographic_coordinates')->nullable()->comment('Latitude and Longitude');
            $table->timestamps();

            // Indexes for efficient querying
            $table->index(['province', 'municipality_city']);
            $table->index('psgc_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangays');
    }
};
