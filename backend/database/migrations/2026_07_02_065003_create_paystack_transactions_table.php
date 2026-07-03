<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paystack_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('org_id');
            $table->uuid('user_id');
            $table->string('reference');
            $table->decimal('amount_ngn', 15, 2);
            $table->string('pack');
            $table->string('status', 50)->default('pending');
            $table->json('raw_payload')->nullable();
            $table->timestamps();
            $table->foreign('org_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paystack_transactions');
    }
};
