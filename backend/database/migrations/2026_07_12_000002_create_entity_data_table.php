<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entity_data', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('entity_type', 50);
            $table->json('data');
            $table->timestamps();

            $table->index(['org_id', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entity_data');
    }
};
