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
        Schema::create('opt_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('barangay_id')->constrained()->onDelete('cascade');

            // Session details
            $table->string('name'); // e.g., "OPT October 2025"
            $table->date('session_date');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Status tracking
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])
                ->default('scheduled');

            // Statistics (cached for performance)
            $table->integer('target_children')->default(0);
            $table->integer('measured_children')->default(0);
            $table->decimal('coverage_percentage', 5, 2)->default(0);

            // Notes and metadata
            $table->text('notes')->nullable();
            $table->text('venue')->nullable();

            // Audit
            $table->foreignId('created_by_user_id')->constrained('users', 'id')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['barangay_id', 'session_date']);
            $table->index('status');
        });

        // Add opt_session_id to measurements table to link measurements to sessions
        Schema::table('measurements', function (Blueprint $table) {
            $table->foreignUuid('opt_session_id')->nullable()->after('child_id')
                ->constrained('opt_sessions')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('measurements', function (Blueprint $table) {
            $table->dropForeign(['opt_session_id']);
            $table->dropColumn('opt_session_id');
        });

        Schema::dropIfExists('opt_sessions');
    }
};
