<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with('clinic')
            ->latest()
            ->paginate();

        return response()->json([
            'message' => 'Administrators retrieved successfully.',
            'data' => $users,
        ]);
    }

    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json([
            'message' => 'Administrator created successfully.',
            'data' => $user->load('clinic'),
        ], 201);
    }

    public function show(User $adminUser): JsonResponse
    {
        return response()->json([
            'message' => 'Administrator retrieved successfully.',
            'data' => $adminUser->load('clinic'),
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $adminUser): JsonResponse
    {
        $adminUser->update($request->validated());

        return response()->json([
            'message' => 'Administrator updated successfully.',
            'data' => $adminUser->refresh()->load('clinic'),
        ]);
    }

    public function destroy(User $adminUser): JsonResponse
    {
        $adminUser->delete();

        return response()->json([
            'message' => 'Administrator deleted successfully.',
            'data' => [],
        ]);
    }
}
