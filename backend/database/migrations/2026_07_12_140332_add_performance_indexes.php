<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Audits table indexes
        Schema::table('audits', function (Blueprint $table) {
            $table->index(['org_id', 'status']);
            $table->index(['org_id', 'start_date']);
            $table->index('start_date');
        });

        // Findings table indexes
        Schema::table('findings', function (Blueprint $table) {
            $table->index(['org_id', 'status']);
            $table->index(['org_id', 'type']);
            $table->index(['org_id', 'audit_id']);
            $table->index('status');
        });

        // Notifications table indexes
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });

        // Organization members table indexes
        Schema::table('organization_members', function (Blueprint $table) {
            $table->index('user_id');
            $table->index(['org_id', 'user_id']);
        });

        // Organizations table indexes
        Schema::table('organizations', function (Blueprint $table) {
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('audits', function (Blueprint $table) {
            $table->dropIndex(['org_id', 'status']);
            $table->dropIndex(['org_id', 'start_date']);
            $table->dropIndex(['start_date']);
        });

        Schema::table('findings', function (Blueprint $table) {
            $table->dropIndex(['org_id', 'status']);
            $table->dropIndex(['org_id', 'type']);
            $table->dropIndex(['org_id', 'audit_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
        });

        Schema::table('organization_members', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['org_id', 'user_id']);
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropIndex(['created_by']);
        });
    }
};
