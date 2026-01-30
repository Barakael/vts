import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAllPositions, type AllPositionsResponse, type PaginationMeta } from '../api/telemetry';
import LiveMap from '../components/dashboard/LiveMap';
import DataTable from '../components/dashboard/DataTable';
import DeviceDetailModal from '../components/dashboard/DeviceDetailModal';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import type { DevicePositionEntry } from '../types/telemetry';

interface CachedData {
  [page: number]: {
    positions: DevicePositionEntry[];
    timestamp: number;
  };
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [positions, setPositions] = useState<DevicePositionEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<CachedData>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState<string>('');
  const greeting = user ? `Welcome back, ${user.name ?? 'operator'}` : 'Vehicle Telemetry Dashboard';

  const load = useCallback(
    async (page: number) => {
      const now = Date.now();
      const cached = cache[page];
      
      // Use cached data if available and less than 30 seconds old
      if (cached && now - cached.timestamp < 30000) {
        setPositions(cached.positions);
        return;
      }

      setLoading(true);
      try {
        const data: AllPositionsResponse = await fetchAllPositions(page, perPage);
        setPositions(data.positions);
        setPagination(data.pagination);
        setError(null);
        
        // Update cache
        setCache((prev) => ({
          ...prev,
          [page]: {
            positions: data.positions,
            timestamp: now,
          },
        }));
      } catch (err) {
        setError('Unable to load telemetry data');
      } finally {
        setLoading(false);
      }
    },
    [cache, perPage]
  );

  useEffect(() => {
    load(currentPage);
    // Refresh data every 30 seconds
    const id = setInterval(() => load(currentPage), 30000);
    return () => clearInterval(id);
  }, [currentPage, load]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const totals = useMemo(
    () => ({
      total: pagination.total,
      active: positions.filter(
        (entry) => Date.now() - new Date(entry.position.recorded_at).getTime() < 5 * 60 * 1000
      ).length,
      devices: new Set(positions.map((entry) => entry.device.id)).size,
    }),
    [positions, pagination.total]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      // ignore
    }
  }, [logout]);

  const handleDeviceClick = useCallback((deviceId: number) => {
    const device = positions.find((entry) => entry.device.id === deviceId);
    if (device) {
      setSelectedDeviceId(deviceId);
      setSelectedDeviceName(device.device.name);
    }
  }, [positions]);

  const handleCloseModal = useCallback(() => {
    setSelectedDeviceId(null);
    setSelectedDeviceName('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {selectedDeviceId && (
        <DeviceDetailModal
          deviceId={selectedDeviceId}
          deviceName={selectedDeviceName}
          onClose={handleCloseModal}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live Tracking
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{greeting}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Real-time GPS tracking powered by Teltonika FMB130 · Auto-refresh every 30s
              </p>
            </div>
            {user && (
              <button
                onClick={handleLogout}
                className="self-start rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Sign out
              </button>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Records"
            value={totals.total.toLocaleString()}
            icon="📊"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Active Devices"
            value={totals.active}
            icon="🟢"
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            label="Unique Devices"
            value={totals.devices}
            icon="📡"
            gradient="from-indigo-500 to-purple-500"
          />
          <StatCard
            label="Current Page"
            value={`${pagination.current_page} / ${pagination.last_page}`}
            icon="📄"
            gradient="from-pink-500 to-rose-500"
          />
        </section>

        {/* Map Section */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">📍 Live Map View</h2>
            {loading && (
              <span className="animate-pulse text-sm text-gray-500">Updating...</span>
            )}
          </div>
          <LiveMap data={positions} />
        </section>

        {/* Data Table Section */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">📋 Position Data</h2>
            <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
              Showing {positions.length} of {pagination.total} records
            </span>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {loading && positions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="mt-4 text-gray-600">Loading position data...</p>
            </div>
          ) : (
            <>
              <DataTable data={positions} onDeviceClick={handleDeviceClick} />
              <div className="mt-6">
                <Pagination meta={pagination} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-600">
            🚀 Vehicle Tracking System · Cache-enabled for optimal performance · Last updated:{' '}
            {new Date().toLocaleTimeString()}
          </p>
        </footer>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number | string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition hover:shadow-xl">
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-center justify-between">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">{label}</span>
        </div>
      </div>
      <div className="bg-white p-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
