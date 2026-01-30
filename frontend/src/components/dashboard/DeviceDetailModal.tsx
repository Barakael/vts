import { useCallback, useEffect, useState } from 'react';
import { fetchDevicePositions, type DevicePositionsResponse } from '../../api/telemetry';
import Pagination from '../common/Pagination';

interface DeviceDetailModalProps {
  deviceId: number;
  deviceName: string;
  onClose: () => void;
}

export default function DeviceDetailModal({ deviceId, deviceName, onClose }: DeviceDetailModalProps) {
  const [data, setData] = useState<DevicePositionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await fetchDevicePositions(deviceId, page, 50);
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load device data');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    load(currentPage);
  }, [currentPage, load]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-white">📡 {deviceName}</h2>
            <p className="mt-1 text-sm text-white/80">
              {data ? `${data.pagination.total} total positions` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="mt-4 text-gray-600">Loading device positions...</p>
            </div>
          ) : data ? (
            <>
              {/* Device Info Cards */}
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Device ID</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{data.device.id}</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">IMEI</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{data.device.imei}</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Total Records</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{data.pagination.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Positions Table */}
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Latitude
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Longitude
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Altitude
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Speed
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Angle
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Satellites
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {data.positions.map((position, index) => (
                        <tr key={position.id} className="transition hover:bg-indigo-50/30">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600">
                            {(currentPage - 1) * 50 + index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatDate(position.recorded_at)}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-gray-700">
                            {position.latitude.toFixed(6)}°
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-gray-700">
                            {position.longitude.toFixed(6)}°
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {position.altitude ?? 'N/A'} m
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">
                            {position.speed ?? 0} km/h
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {position.angle ?? 0}°
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {position.satellites ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data.positions.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                  <p className="text-gray-500">No position data available for this device</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer with Pagination */}
        {data && data.pagination.last_page > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Pagination meta={data.pagination} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
}
