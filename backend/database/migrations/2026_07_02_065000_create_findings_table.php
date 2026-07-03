<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('findings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('org_id');
            $table->uuid('audit_id');
            $table->string('type', 50)->default('minor');
            $table->string('clause', 100)->nullable();
            $table->text('description');
            $table->text('capa')->nullable();
            $table->string('owner')->nullable();
            $table->string('status', 50)->default('open');
            $table->date('due_date')->nullable();
            $table->text('root_cause')->nullable();
            $table->text('auditor_comment')->nullable();
            $table->timestamps();
            $table->foreign('org_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('audit_id')->references('id')->on('audits')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('findings');
    }
};
