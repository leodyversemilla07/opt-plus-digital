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
        Schema::table('measurements', function (Blueprint $table) {
            // Age in days for precise WHO z-score calculation
            $table->integer('age_in_days')->nullable()->after('age_in_months');
            
            // Measurement method selection (per spec §5.2)
            $table->enum('measurement_method', ['weight_height', 'muac_only'])
                ->default('weight_height')
                ->after('measurement_type');
            
            // Edema fields (per spec §3.1)
            $table->boolean('has_edema')->default(false)->after('muac_cm');
            $table->enum('edema_grade', ['+1', '+2', '+3'])->nullable()->after('has_edema');
            
            // Disability fields (per spec §3.1)
            $table->boolean('has_disability')->default(false)->after('edema_grade');
            $table->text('disability_notes')->nullable()->after('has_disability');
            
            // Data quality flags (per spec §5.6)
            $table->boolean('is_flagged')->default(false)->after('disability_notes');
            $table->text('flag_reason')->nullable()->after('is_flagged');
            $table->boolean('is_overaged')->default(false)->after('flag_reason');
            
            // Index for flagged records
            $table->index('is_flagged');
            $table->index('is_overaged');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('measurements', function (Blueprint $table) {
            $table->dropIndex(['is_flagged']);
            $table->dropIndex(['is_overaged']);
            
            $table->dropColumn([
                'age_in_days',
                'measurement_method',
                'has_edema',
                'edema_grade',
                'has_disability',
                'disability_notes',
                'is_flagged',
                'flag_reason',
                'is_overaged',
            ]);
        });
    }
};
