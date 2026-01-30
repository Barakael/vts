import client from './client';
import type { Device, DevicePosition } from '../types/telemetry';

export interface DevicesResponse {
  success: boolean;
  data: {
    devices: Device[];
  };
  message: string;
}

export interface DeviceResponse {
  success: boolean;
  data: {
    device: Device;
  };
  message: string;
}

export interface PositionsResponse {
  success: boolean;
  data: {
    positions: Array<{
      device: { id: number; name: string; imei: string };
      position: DevicePosition;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
  message: string;
}

export interface DevicePositionsResponse {
  success: boolean;
  data: {
    device: { id: number; name: string; imei: string };
    positions: DevicePosition[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
  message: string;
}

/**
 * Fetch all devices
 */
export async function fetchDevices(): Promise<DevicesResponse> {
  const response = await client.get<DevicesResponse>('/api/devices');
  return response.data;
}

/**
 * Fetch a single device by ID
 */
export async function fetchDevice(id: number): Promise<DeviceResponse> {
  const response = await client.get<DeviceResponse>(`/api/devices/${id}`);
  return response.data;
}

/**
 * Fetch a single device by IMEI
 */
export async function fetchDeviceByImei(imei: string): Promise<DeviceResponse> {
  const response = await client.get<DeviceResponse>(`/api/devices/imei/${imei}`);
  return response.data;
}

/**
 * Fetch all device positions (paginated)
 */
export async function fetchPositions(page = 1, perPage = 20): Promise<PositionsResponse> {
  const response = await client.get<PositionsResponse>(`/api/device-positions?page=${page}&per_page=${perPage}&order=desc`);
  return response.data;
}

/**
 * Fetch positions for a specific device (paginated)
 */
export async function fetchDevicePositions(deviceId: number, page = 1, perPage = 50): Promise<DevicePositionsResponse> {
  const response = await client.get<DevicePositionsResponse>(`/api/devices/${deviceId}/positions?page=${page}&per_page=${perPage}&order=desc`);
  return response.data;
}
