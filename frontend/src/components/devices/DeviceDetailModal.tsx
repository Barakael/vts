import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Device } from '../../types/telemetry';

interface DeviceDetailModalProps {
  isOpen: boolean;
  device: Device | null;
  onClose: () => void;
}

export default function DeviceDetailModal({ isOpen, device, onClose }: DeviceDetailModalProps) {
  if (!isOpen || !device) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not available';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCoordinate = (coord: number | null) => {
    if (coord === null) return 'Not available';
    return coord.toFixed(6);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-7 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Device Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{device.name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IMEI</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{device.imei}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <p className="mt-1 text-sm text-gray-900">{device.model || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <p className="mt-1 text-sm text-gray-900">{device.reg_no || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SIM Number</label>
                <p className="mt-1 text-sm text-gray-900">{device.sim_no || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <p className="mt-1 text-sm text-gray-900">{formatCoordinate(device.last_latitude)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <p className="mt-1 text-sm text-gray-900">{formatCoordinate(device.last_longitude)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Speed (km/h)</label>
                <p className="mt-1 text-sm text-gray-900">
                  {device.last_speed !== null ? `${device.last_speed} km/h` : 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Satellites</label>
                <p className="mt-1 text-sm text-gray-900">
                  {device.last_satellites !== null ? device.last_satellites : 'Not available'}
                </p>
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Timing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Seen</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(device.last_seen_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last GPS Fix</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(device.last_fix_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(device.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Updated At</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(device.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Device ID</label>
                <p className="mt-1 text-sm text-gray-900">{device.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Updated By</label>
                <p className="mt-1 text-sm text-gray-900">
                  {device.updated_by ? `User ${device.updated_by}` : 'System'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}