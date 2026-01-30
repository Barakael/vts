import client from './client';
import type { DevicePositionEntry } from '../types/telemetry';

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface AllPositionsResponse {
  positions: DevicePositionEntry[];
  pagination: PaginationMeta;
}

export async function fetchAllPositions(page = 1, perPage = 20): Promise<AllPositionsResponse> {
  const response = await client.get('/api/device-positions', {
    params: { page, per_page: perPage },
  });
  return response.data?.data ?? { positions: [], pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1 } };
}

export async function fetchLatestPositions(): Promise<DevicePositionEntry[]> {
  const response = await client.get('/api/device-positions/latest');
  return response.data?.data?.positions ?? [];
}

export interface DevicePositionsResponse {
  device: {
    id: number;
    name: string;
    imei: string;
  };
  positions: DevicePositionEntry['position'][];
  pagination: PaginationMeta;
}

export async function fetchDevicePositions(
  deviceId: number,
  page = 1,
  perPage = 50
): Promise<DevicePositionsResponse> {
  const response = await client.get(`/api/devices/${deviceId}/positions`, {
    params: { page, per_page: perPage },
  });
  return (
    response.data?.data ?? {
      device: { id: deviceId, name: '', imei: '' },
      positions: [],
      pagination: { current_page: 1, per_page: 50, total: 0, last_page: 1 },
    }
  );
}
