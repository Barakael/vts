import { useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { Device } from '../../types/telemetry';

interface DeviceTableProps {
  devices: Device[];
  loading?: boolean;
  onEdit: (device: Device) => void;
  onDelete: (deviceId: number) => void;
  onView?: (device: Device) => void;
}

export default function DeviceTable({ devices, loading, onEdit, onDelete, onView }: DeviceTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="animate-pulse h-6 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-28"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Devices ({devices.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IMEI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reg No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SIM No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Server Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracker Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.map((device) => {
              return (
                <tr
                  key={device.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onView?.(device)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {device.imei}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {device.reg_no || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {device.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {device.sim_no || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(device.last_seen_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(device.last_fix_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(device.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {device.updated_by ? `User ${device.updated_by}` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === device.id ? null : device.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      {actionMenuOpen === device.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(device);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(device.id);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}