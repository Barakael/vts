import type { DevicePositionEntry } from '../../types/telemetry';

interface DataTableProps {
  data: DevicePositionEntry[];
  onDeviceClick?: (deviceId: number) => void;
}

export default function DataTable({ data, onDeviceClick }: DataTableProps) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">No position data available</p>
      </div>
    );
  }

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

  const getStatusColor = (timestamp: string) => {
    const minutes = (Date.now() - new Date(timestamp).getTime()) / 1000 / 60;
    if (minutes < 5) return 'bg-green-100 text-green-800 border-green-200';
    if (minutes < 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Device
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Timestamp
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Speed
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Satellites
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((entry) => (
              <tr
                key={`${entry.device.id}-${entry.position.id}`}
                className="transition hover:bg-indigo-50/50"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <button
                      onClick={() => onDeviceClick?.(entry.device.id)}
                      className="text-left font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {entry.device.name}
                    </button>
                    <span className="text-xs text-gray-500">{entry.device.imei}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDate(entry.position.recorded_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-sm">
                    <span className="font-mono text-gray-700">
                      {entry.position.latitude.toFixed(6)}°
                    </span>
                    <span className="font-mono text-gray-700">
                      {entry.position.longitude.toFixed(6)}°
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  {entry.position.speed ?? 0} km/h
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {entry.position.satellites ?? 0}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                      entry.position.recorded_at
                    )}`}
                  >
                    {(() => {
                      const minutes = (Date.now() - new Date(entry.position.recorded_at).getTime()) / 1000 / 60;
                      if (minutes < 5) return 'Active';
                      if (minutes < 30) return 'Recent';
                      return 'Idle';
                    })()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
