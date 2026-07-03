<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('org_id');
            $table->string('standard', 100);
            $table->string('clause');
            $table->text('text');
            $table->string('kind', 50)->default('default');
            $table->string('process_key');
            $table->string('reference', 500)->nullable();
            $table->text('evidence')->nullable();
            $table->boolean('active')->default(true);
            $table->uuid('created_by');
            $table->timestamps();
            $table->foreign('org_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_questions');
    }
};
