import type { User } from './auth';

export type Device = {
  id: number;
  name: string | null;
  imei: string;
};

export type DevicePosition = {
  id: number;
  recorded_at: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  angle: number | null;
  satellites: number | null;
  priority: number | null;
  event_id: string | null;
  io?: Record<string, unknown> | null;
};

export type DevicePositionEntry = {
  device: Device;
  position: DevicePosition;
};

export type LatestPositionsResponse = {
  success: boolean;
  data: {
    positions: DevicePositionEntry[];
  };
  message: string;
};

export type UserResponse = {
  success: boolean;
  data: {
    user: User | null;
  };
  message: string;
};
