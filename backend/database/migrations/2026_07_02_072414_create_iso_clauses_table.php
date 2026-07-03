<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iso_clauses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('standard', 10);
            $table->string('clause', 20);
            $table->string('title');
            $table->text('requirement');
            $table->timestamps();
            $table->unique(['standard', 'clause']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iso_clauses');
    }
};
