<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EntityData;
use App\Models\Organization;
use App\Models\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntityDataController extends Controller
{
    public function index(Request $request, string $orgId, string $entityType): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $this->authorizeAccess($org);

        $items = EntityData::where('org_id', $orgId)
            ->where('entity_type', $entityType)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($e) => array_merge(['id' => $e->id], $e->data));

        return response()->json($items);
    }

    public function store(Request $request, string $orgId, string $entityType): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $this->authorizeAccess($org);

        $request->validate(['data' => 'required|array']);

        $entity = EntityData::create([
            'org_id' => $orgId,
            'entity_type' => $entityType,
            'data' => $request->data,
        ]);

        return response()->json(array_merge(['id' => $entity->id], $entity->data), 201);
    }

    public function update(Request $request, string $orgId, string $entityType, string $id): JsonResponse
    {
        $entity = EntityData::where('org_id', $orgId)
            ->where('entity_type', $entityType)
            ->find($id);

        // Fallback: lookup by data->id (for prefixed temp IDs from frontend)
        if (!$entity) {
            $entity = EntityData::where('org_id', $orgId)
                ->where('entity_type', $entityType)
                ->where('data->id', $id)
                ->first();
        }

        if (!$entity) {
            return response()->json(['message' => 'Entity not found.'], 404);
        }

        $request->validate(['data' => 'required|array']);

        $entity->update(['data' => $request->data]);

        return response()->json(array_merge(['id' => $entity->id], $entity->data));
    }

    public function destroy(string $orgId, string $entityType, string $id): JsonResponse
    {
        $entity = EntityData::where('org_id', $orgId)
            ->where('entity_type', $entityType)
            ->find($id);

        if (!$entity) {
            $entity = EntityData::where('org_id', $orgId)
                ->where('entity_type', $entityType)
                ->where('data->id', $id)
                ->first();
        }

        if (!$entity) {
            return response()->json(['message' => 'Entity not found.'], 404);
        }

        $entity->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function seed(Request $request, string $orgId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);
        $this->authorizeAccess($org);

        $seedData = $request->validate(['data' => 'required|array']);

        $created = [];
        foreach ($seedData as $type => $items) {
            foreach ($items as $item) {
                $id = $item['id'] ?? null;
                unset($item['id']);
                $entity = EntityData::create([
                    'org_id' => $orgId,
                    'entity_type' => $type,
                    'data' => $item,
                ]);
                $created[] = ['old_id' => $id, 'new_id' => $entity->id, 'type' => $type];
            }
        }

        return response()->json(['seeded' => count($created), 'mapping' => $created]);
    }

    private function authorizeAccess(Organization $org): void
    {
        $user = request()->user();
        $isMember = $org->created_by === $user->id
            || UserRole::where('org_id', $org->id)->where('user_id', $user->id)->exists();
        if (!$isMember) {
            abort(403);
        }
    }
}
