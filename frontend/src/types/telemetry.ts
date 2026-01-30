import type { User } from './auth';

export type Device = {
  id: number;
  name: string | null;
  imei: string;
  model: string | null;
  last_seen_at: string | null;
  last_fix_at: string | null;
  last_latitude: number | null;
  last_longitude: number | null;
  last_speed: number | null;
  last_angle: number | null;
  last_satellites: number | null;
  last_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
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
