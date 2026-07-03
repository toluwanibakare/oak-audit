<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('audit_id');
            $table->uuid('process_id');
            $table->string('clause', 100);
            $table->string('kind', 50)->default('default');
            $table->string('q_ref', 100)->nullable();
            $table->text('question_text')->nullable();
            $table->string('status', 50)->default('pending');
            $table->string('severity', 50)->nullable();
            $table->text('note')->nullable();
            $table->string('auditee_name')->nullable();
            $table->string('auditor_name')->nullable();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->foreign('audit_id')->references('id')->on('audits')->onDelete('cascade');
            $table->foreign('process_id')->references('id')->on('org_processes')->onDelete('cascade');
            $table->unique(['audit_id', 'process_id', 'clause', 'kind', 'q_ref'], 'unique_answer');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_answers');
    }
};
