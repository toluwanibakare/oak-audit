<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcessAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcessAssignmentController extends Controller
{
    public function index(string $orgId): JsonResponse
    {
        $assignments = ProcessAssignment::where('org_id', $orgId)->get();
        return response()->json($assignments);
    }
}
