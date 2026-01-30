<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DevicePosition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DevicePositionController extends BaseController
{
    public function all(Request $request): JsonResponse
    {
        $page = (int) max(1, $request->integer('page', 1));
        $perPage = (int) min(100, max(10, $request->integer('per_page', 20)));

        $query = DevicePosition::with('device')
            ->latest('recorded_at');

        $total = $query->count();
        $positions = $query
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function (DevicePosition $position): array {
                return [
                    'device' => [
                        'id' => $position->device->id,
                        'name' => $position->device->name ?? $position->device->imei,
                        'imei' => $position->device->imei,
                    ],
                    'position' => $this->formatPosition($position),
                ];
            });

        return $this->sendResponse([
            'positions' => $positions,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ], 'All device positions');
    }

    public function latest(): JsonResponse
    {
        $devices = Device::with('latestPosition')->get();

        $positions = $devices
            ->map(function (Device $device): ?array {
                $latest = $device->latestPosition;
                if (! $latest) {
                    return null;
                }

                return [
                    'device' => [
                        'id' => $device->id,
                        'name' => $device->name ?? $device->imei,
                        'imei' => $device->imei,
                    ],
                    'position' => $this->formatPosition($latest),
                ];
            })
            ->filter()
            ->values();

        return $this->sendResponse([
            'positions' => $positions,
        ], 'Latest device fixes');
    }

    public function forDevice(Request $request, Device $device): JsonResponse
    {
        $page = (int) max(1, $request->integer('page', 1));
        $perPage = (int) min(100, max(10, $request->integer('per_page', 50)));

        $query = $device->positions()->latest('recorded_at');
        $total = $query->count();

        $positions = $query
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn (DevicePosition $position): array => $this->formatPosition($position));

        return $this->sendResponse([
            'device' => [
                'id' => $device->id,
                'name' => $device->name ?? $device->imei,
                'imei' => $device->imei,
            ],
            'positions' => $positions,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ], 'Device positions');
    }

    public function tracker(): View
    {
        return view('tracker');
    }

    private function formatPosition(DevicePosition $position): array
    {
        return [
            'id' => $position->id,
            'recorded_at' => $position->recorded_at?->toIso8601String(),
            'latitude' => $position->latitude,
            'longitude' => $position->longitude,
            'altitude' => $position->altitude,
            'speed' => $position->speed,
            'angle' => $position->angle,
            'satellites' => $position->satellites,
            'priority' => $position->priority,
            'event_id' => $position->event_id,
            'io' => $position->io,
        ];
    }
}
