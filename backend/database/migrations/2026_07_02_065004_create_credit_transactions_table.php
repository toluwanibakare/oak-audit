<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('org_id');
            $table->string('kind', 50);
            $table->integer('credits');
            $table->decimal('naira_amount', 15, 2)->nullable();
            $table->string('pack', 100)->nullable();
            $table->string('reference')->nullable();
            $table->uuid('audit_license_id')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();
            $table->foreign('org_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};
