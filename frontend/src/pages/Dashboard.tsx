import { useState, useEffect, useMemo } from 'react';
import { SummaryCards, DeviceFilters, DeviceList, PositionHistory } from '../components/dashboard';
import type { FilterState } from '../components/dashboard';
import { fetchDevices } from '../api/devices';
import type { Device } from '../types/telemetry';

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    model: '',
    hasGps: 'all',
  });

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchDevices();
      setDevices(response.data.devices || []);
    } catch (err) {
      setError('Failed to load devices. Please try again.');
      console.error('Error loading devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // Filter devices based on current filters
  const filteredDevices = useMemo(() => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    return devices.filter((device) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = device.name?.toLowerCase().includes(searchLower);
        const imeiMatch = device.imei.toLowerCase().includes(searchLower);
        if (!nameMatch && !imeiMatch) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const isActive = device.last_seen_at
          ? new Date(device.last_seen_at) >= fiveMinutesAgo
          : false;
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }

      // Model filter
      if (filters.model && device.model !== filters.model) {
        return false;
      }

      // GPS filter
      if (filters.hasGps !== 'all') {
        const hasGps = device.last_latitude !== null && device.last_longitude !== null;
        if (filters.hasGps === 'yes' && !hasGps) return false;
        if (filters.hasGps === 'no' && hasGps) return false;
      }

      return true;
    });
  }, [devices, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            Monitor your fleet in real-time
          </p>
        </div>
        <button
          onClick={loadDevices}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <svg style={{ width: '16px', height: '16px', animation: loading ? 'spin 1s linear infinite' : 'none' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Summary cards */}
      <SummaryCards devices={devices} loading={loading} />

      {/* Filters */}
      <DeviceFilters
        filters={filters}
        onFiltersChange={setFilters}
        devices={devices}
      />

      {/* Device list */}
      <DeviceList devices={filteredDevices} loading={loading} />

      {/* Position History */}
      <PositionHistory />
    </div>
  );
}
