<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    /**
     * Get all devices with their latest position data
     */
    public function index(Request $request): JsonResponse
    {
        $query = Device::query();

        // Search by name or IMEI
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('imei', 'like', "%{$search}%");
            });
        }

        // Filter by model
        if ($model = $request->get('model')) {
            $query->where('model', $model);
        }

        // Filter by active status (seen in last 5 minutes)
        if ($request->has('active')) {
            $fiveMinutesAgo = now()->subMinutes(5);
            if ($request->boolean('active')) {
                $query->where('last_seen_at', '>=', $fiveMinutesAgo);
            } else {
                $query->where(function ($q) use ($fiveMinutesAgo) {
                    $q->whereNull('last_seen_at')
                      ->orWhere('last_seen_at', '<', $fiveMinutesAgo);
                });
            }
        }

        // Filter by GPS fix
        if ($request->has('has_gps')) {
            if ($request->boolean('has_gps')) {
                $query->whereNotNull('last_latitude')
                      ->whereNotNull('last_longitude');
            } else {
                $query->where(function ($q) {
                    $q->whereNull('last_latitude')
                      ->orWhereNull('last_longitude');
                });
            }
        }

        // Order by last seen
        $query->orderByDesc('last_seen_at');

        $devices = $query->get();

        return response()->json([
            'success' => true,
            'data' => [
                'devices' => $devices,
            ],
            'message' => 'Devices retrieved successfully',
        ]);
    }

    /**
     * Get a single device by ID
     */
    public function show(int $id): JsonResponse
    {
        $device = Device::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'device' => $device,
            ],
            'message' => 'Device retrieved successfully',
        ]);
    }

    /**
     * Get a single device by IMEI
     */
    public function showByImei(string $imei): JsonResponse
    {
        $device = Device::where('imei', $imei)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'device' => $device,
            ],
            'message' => 'Device retrieved successfully',
        ]);
    }

    /**
     * Create a new device
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'imei' => 'required|string|unique:devices,imei',
            'model' => 'nullable|string|max:255',
            'reg_no' => 'nullable|string|max:255',
            'sim_no' => 'nullable|string|max:255',
        ]);

        $validated['updated_by'] = $request->user()->id;

        $device = Device::create($validated);

        return response()->json([
            'success' => true,
            'data' => [
                'device' => $device,
            ],
            'message' => 'Device created successfully',
        ], 201);
    }

    /**
     * Update a device
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $device = Device::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'imei' => 'required|string|unique:devices,imei,' . $id,
            'model' => 'nullable|string|max:255',
            'reg_no' => 'nullable|string|max:255',
            'sim_no' => 'nullable|string|max:255',
        ]);

        $validated['updated_by'] = $request->user()->id;

        $device->update($validated);

        return response()->json([
            'success' => true,
            'data' => [
                'device' => $device,
            ],
            'message' => 'Device updated successfully',
        ]);
    }

    /**
     * Delete a device
     */
    public function destroy(int $id): JsonResponse
    {
        $device = Device::findOrFail($id);
        $device->delete();

        return response()->json([
            'success' => true,
            'message' => 'Device deleted successfully',
        ]);
    }

    /**
     * Get available device models
     */
    public function models(): JsonResponse
    {
        $models = Device::whereNotNull('model')
            ->distinct()
            ->pluck('model');

        return response()->json([
            'success' => true,
            'data' => [
                'models' => $models,
            ],
            'message' => 'Device models retrieved successfully',
        ]);
    }

    /**
     * Get device statistics
     */
    public function stats(): JsonResponse
    {
        $fiveMinutesAgo = now()->subMinutes(5);

        $stats = [
            'total' => Device::count(),
            'active' => Device::where('last_seen_at', '>=', $fiveMinutesAgo)->count(),
            'with_gps' => Device::whereNotNull('last_latitude')
                ->whereNotNull('last_longitude')
                ->count(),
            'average_speed' => Device::whereNotNull('last_speed')->avg('last_speed') ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
            ],
            'message' => 'Device statistics retrieved successfully',
        ]);
    }
}
