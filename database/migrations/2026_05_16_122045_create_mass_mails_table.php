<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mass_mails', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->text('message_body');
            $table->string('recipient_type'); // all_parents, by_barangay, by_classification, specific_roles
            $table->json('recipient_criteria')->nullable(); // filters like barangay_id, classification, roles
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->string('status')->default('draft'); // draft, queued, sending, sent, failed, partially_sent
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mass_mails');
    }
};
