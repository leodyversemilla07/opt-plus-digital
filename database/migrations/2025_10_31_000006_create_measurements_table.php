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
        Schema::create('measurements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('child_id')->constrained()->onDelete('cascade');

            // Measurement data
            $table->date('measurement_date');
            $table->integer('age_in_months');
            $table->decimal('weight_kg', 5, 2);
            $table->decimal('height_length_cm', 5, 2);
            $table->enum('measurement_type', ['height', 'length'])->comment('Standing height or recumbent length');

            // WHO Z-scores (calculated)
            $table->decimal('weight_for_age_zscore', 5, 2)->nullable();
            $table->decimal('height_for_age_zscore', 5, 2)->nullable();
            $table->decimal('weight_for_height_zscore', 5, 2)->nullable();

            // Nutritional status classification (auto-calculated from z-scores)
            $table->enum('weight_for_age_status', [
                'severely_underweight',
                'underweight',
                'normal',
                'overweight',
            ])->nullable();
            $table->enum('height_for_age_status', [
                'severely_stunted',
                'stunted',
                'normal',
                'tall',
            ])->nullable();
            $table->enum('weight_for_height_status', [
                'severely_wasted',
                'wasted',
                'normal',
                'overweight',
                'obese',
            ])->nullable();

            // OPT classification (based on weight-for-height)
            $table->enum('opt_classification', [
                'severely_malnourished',
                'moderately_malnourished',
                'normal',
                'overweight',
                'obese',
            ])->nullable();

            // Additional measurements (optional)
            $table->decimal('muac_cm', 4, 2)->nullable()->comment('Mid-Upper Arm Circumference');

            // Metadata
            $table->text('notes')->nullable();
            $table->foreignId('measured_by_user_id')->constrained('users', 'id')->onDelete('restrict');
            $table->timestamp('synced_at')->nullable()->comment('When measurement was synced from offline device');
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('child_id');
            $table->index('measurement_date');
            $table->index(['child_id', 'measurement_date']);
            $table->index('opt_classification');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('measurements');
    }
};
