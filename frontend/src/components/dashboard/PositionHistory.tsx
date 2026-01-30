import { useState, useEffect } from 'react';
import { fetchPositions, type PositionsResponse } from '../../api/devices';
import type { DevicePosition } from '../../types/telemetry';

interface PositionEntry {
  device: { id: number; name: string; imei: string };
  position: DevicePosition;
}

export default function PositionHistory() {
  const [positions, setPositions] = useState<PositionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PositionsResponse['data']['pagination'] | null>(null);

  const loadPositions = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPositions(pageNum, 15);
      setPositions(response.data.positions);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load position history');
      console.error('Error loading positions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions(page);
  }, [page]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCoord = (value: number, type: 'lat' | 'lng') => {
    const dir = type === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
    return `${Math.abs(value).toFixed(5)}° ${dir}`;
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#060d1b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '13px',
  };

  if (loading && positions.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '120px', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '100px', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
            <div style={{ width: '80px', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
            <div style={{ width: '120px', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={() => loadPositions(page)} style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg style={{ width: '20px', height: '20px', color: '#6366f1' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Position History
            {pagination && (
              <span style={{ marginLeft: '8px', color: '#9ca3af', fontWeight: '400' }}>
                ({pagination.total} records)
              </span>
            )}
          </h3>
        </div>
        <button
          onClick={() => loadPositions(page)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: loading ? '#f3f4f6' : '#f0f9ff',
            color: loading ? '#9ca3af' : '#0369a1',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          <svg style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Device</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Speed</th>
              <th style={thStyle}>Altitude</th>
              <th style={thStyle}>Heading</th>
              <th style={thStyle}>Sats</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((entry, idx) => (
              <tr key={`${entry.position.id}-${idx}`} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                {/* Device */}
                <td style={tdStyle}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#111827', marginBottom: '2px' }}>{entry.device.name || 'Unnamed'}</p>
                    <p style={{ fontSize: '11px', color: '#09101d', fontFamily: 'monospace' }}>{entry.device.imei}</p>
                  </div>
                </td>

                {/* Time */}
                <td style={tdStyle}>
                  <span style={{ color: '#374151', whiteSpace: 'nowrap' }}>{formatDate(entry.position.recorded_at)}</span>
                </td>

                {/* Location */}
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <svg style={{ width: '14px', height: '14px', color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      <p style={{ color: '#111827', margin: 0 }}>{formatCoord(entry.position.latitude, 'lat')}</p>
                      <p style={{ color: '#6b7280', margin: 0 }}>{formatCoord(entry.position.longitude, 'lng')}</p>
                    </div>
                  </div>
                </td>

                {/* Speed */}
                <td style={tdStyle}>
                  {entry.position.speed !== null ? (
                    <span style={{ fontWeight: '500', color: '#111827' }}>{entry.position.speed} <span style={{ fontSize: '11px', color: '#9ca3af' }}>km/h</span></span>
                  ) : (
                    <span style={{ color: '#d1d5db' }}>—</span>
                  )}
                </td>

                {/* Altitude */}
                <td style={tdStyle}>
                  {entry.position.altitude !== null ? (
                    <span style={{ color: '#374151' }}>{entry.position.altitude} <span style={{ fontSize: '11px', color: '#9ca3af' }}>m</span></span>
                  ) : (
                    <span style={{ color: '#d1d5db' }}>—</span>
                  )}
                </td>

                {/* Heading */}
                <td style={tdStyle}>
                  {entry.position.angle !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${entry.position.angle}deg)` }}>
                        <svg style={{ width: '10px', height: '10px', color: '#4b5563' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l4 10H8l4-10z" />
                        </svg>
                      </div>
                      <span style={{ color: '#4b5563', fontSize: '12px' }}>{entry.position.angle}°</span>
                    </div>
                  ) : (
                    <span style={{ color: '#d1d5db' }}>—</span>
                  )}
                </td>

                {/* Satellites */}
                <td style={tdStyle}>
                  {entry.position.satellites !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end' }}>
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            style={{
                              width: '3px',
                              borderRadius: '1px',
                              backgroundColor: bar <= Math.min(Math.ceil((entry.position.satellites || 0) / 4), 4) ? '#10b981' : '#e5e7eb',
                              height: `${bar * 2 + 4}px`,
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', color: '#4b5563' }}>{entry.position.satellites}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#d1d5db' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Page {pagination.current_page} of {pagination.last_page}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: page <= 1 ? '#f3f4f6' : 'white',
                color: page <= 1 ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: page <= 1 ? 'default' : 'pointer',
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={page >= pagination.last_page || loading}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: page >= pagination.last_page ? '#f3f4f6' : 'white',
                color: page >= pagination.last_page ? '#9ca3af' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: page >= pagination.last_page ? 'default' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
