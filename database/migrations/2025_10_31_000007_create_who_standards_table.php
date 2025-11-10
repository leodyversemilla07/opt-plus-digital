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
        Schema::create('who_standards', function (Blueprint $table) {
            $table->id();
            $table->string('indicator', 20); // wfa, hfa, wfh
            $table->enum('sex', ['male', 'female']);
            $table->integer('age_or_length')->comment('Age in days for WFA/HFA, length in cm for WFH');
            $table->decimal('l', 10, 6)->comment('Box-Cox power for transformation');
            $table->decimal('m', 10, 6)->comment('Median');
            $table->decimal('s', 10, 6)->comment('Coefficient of variation');

            // Indexes for fast lookups
            $table->index(['indicator', 'sex', 'age_or_length'], 'who_lookup_index');
            $table->unique(['indicator', 'sex', 'age_or_length'], 'who_unique_index');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('who_standards');
    }
};
