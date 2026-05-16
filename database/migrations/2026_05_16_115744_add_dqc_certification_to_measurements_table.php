<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('measurements', function (Blueprint $table) {
            $table->string('dqc_status', 20)->default('pending')->after('notes');
            $table->foreignId('dqc_certified_by_user_id')
                ->nullable()
                ->after('dqc_status')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('dqc_certified_at')->nullable()->after('dqc_certified_by_user_id');
            $table->text('dqc_notes')->nullable()->after('dqc_certified_at');

            $table->index('dqc_status');
        });
    }

    public function down(): void
    {
        Schema::table('measurements', function (Blueprint $table) {
            $table->dropIndex(['dqc_status']);
            $table->dropColumn([
                'dqc_status',
                'dqc_certified_by_user_id',
                'dqc_certified_at',
                'dqc_notes',
            ]);
        });
    }
};
