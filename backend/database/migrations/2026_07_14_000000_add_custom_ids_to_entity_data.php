<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $records = DB::table('entity_data')
            ->where('entity_type', 'processes')
            ->get();

        foreach ($records as $record) {
            $data = json_decode($record->data, true);
            if (!isset($data['id']) || !str_starts_with($data['id'], 'P-')) {
                $suffix = strtoupper(substr(str_replace('-', '', $record->id), -8));
                $data['id'] = 'P-' . $suffix;
                DB::table('entity_data')
                    ->where('id', $record->id)
                    ->update(['data' => json_encode($data)]);
            }
        }
    }

    public function down(): void
    {
        $records = DB::table('entity_data')
            ->where('entity_type', 'processes')
            ->get();

        foreach ($records as $record) {
            $data = json_decode($record->data, true);
            if (isset($data['id']) && str_starts_with($data['id'], 'P-')) {
                unset($data['id']);
                DB::table('entity_data')
                    ->where('id', $record->id)
                    ->update(['data' => json_encode($data)]);
            }
        }
    }
};
