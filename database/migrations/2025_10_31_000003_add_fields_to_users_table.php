<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('barangay_id')->nullable()->after('email');
            $table->foreign('barangay_id')->references('id')->on('barangays')->nullOnDelete();
            $table->string('phone')->nullable()->after('email');
            $table->boolean('is_active')->default(true)->after('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['barangay_id']);
            $table->dropColumn(['barangay_id', 'phone', 'is_active']);
        });
    }
};
