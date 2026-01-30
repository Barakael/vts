import { useState } from 'react';
import type { Device } from '../../types/telemetry';

interface DeviceListProps {
  devices: Device[];
  loading?: boolean;
}

type SortField = 'name' | 'imei' | 'last_seen_at' | 'last_speed' | 'last_satellites';
type SortDirection = 'asc' | 'desc';

export default function DeviceList({ devices, loading }: DeviceListProps) {
  const [sortField, setSortField] = useState<SortField>('last_seen_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedDevices = [...devices].sort((a, b) => {
    let aVal: string | number | null = a[sortField];
    let bVal: string | number | null = b[sortField];
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';
    if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCoord = (value: number | null, type: 'lat' | 'lng') => {
    if (value === null) return '—';
    const dir = type === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
    return `${Math.abs(value).toFixed(5)}° ${dir}`;
  };

  const isActive = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return new Date(lastSeen) >= new Date(Date.now() - 5 * 60 * 1000);
  };

  const getTimeSince = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  };

  const tdStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid #f3f4f6'
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', padding: '24px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '8px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '16px', width: '120px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '180px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', padding: '48px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l8.735 8.735m0 0a.374.374 0 11.53.53m-.53-.53l.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 010 5.304m2.121-7.425a6.75 6.75 0 010 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 01-1.06-2.122m-1.061 4.243a6.75 6.75 0 01-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12z" />
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>No devices found</h3>
        <p style={{ color: '#6b7280' }}>Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
          Device Readings
          <span style={{ marginLeft: '8px', color: '#9ca3af', fontWeight: '400' }}>({devices.length} {devices.length === 1 ? 'device' : 'devices'})</span>
        </h3>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>
                <button onClick={() => handleSort('name')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', font: 'inherit', color: 'inherit' }}>
                  Device {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>
                <button onClick={() => handleSort('last_speed')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', font: 'inherit', color: 'inherit' }}>
                  Speed {sortField === 'last_speed' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th style={thStyle}>Heading</th>
              <th style={thStyle}>
                <button onClick={() => handleSort('last_satellites')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', font: 'inherit', color: 'inherit' }}>
                  Satellites {sortField === 'last_satellites' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th style={thStyle}>
                <button onClick={() => handleSort('last_seen_at')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', font: 'inherit', color: 'inherit' }}>
                  Last Seen {sortField === 'last_seen_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((device) => {
              const active = isActive(device.last_seen_at);
              return (
                <tr key={device.id} style={{ transition: 'background-color 150ms' }}>
                  {/* Device info */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active ? '#d1fae5' : '#f3f4f6',
                        color: active ? '#059669' : '#9ca3af'
                      }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          {active ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l8.735 8.735m0 0a.374.374 0 11.53.53m-.53-.53l.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 010 5.304m2.121-7.425a6.75 6.75 0 010 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 01-1.06-2.122m-1.061 4.243a6.75 6.75 0 01-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12z" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827', marginBottom: '2px' }}>{device.name || 'Unnamed Device'}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{device.imei}</p>
                        {device.model && (
                          <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', fontSize: '11px', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '4px' }}>{device.model}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '9999px',
                      backgroundColor: active ? '#d1fae5' : '#f3f4f6',
                      color: active ? '#047857' : '#4b5563'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: active ? '#10b981' : '#9ca3af' }} />
                      {active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Location */}
                  <td style={tdStyle}>
                    {device.last_latitude && device.last_longitude ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <svg style={{ width: '16px', height: '16px', color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                          <p style={{ color: '#111827' }}>{formatCoord(device.last_latitude, 'lat')}</p>
                          <p style={{ color: '#6b7280' }}>{formatCoord(device.last_longitude, 'lng')}</p>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '14px' }}>No GPS fix</span>
                    )}
                  </td>

                  {/* Speed */}
                  <td style={tdStyle}>
                    {device.last_speed !== null ? (
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{device.last_speed}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>km/h</span>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>

                  {/* Heading */}
                  <td style={tdStyle}>
                    {device.last_angle !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${device.last_angle}deg)` }}>
                          <svg style={{ width: '12px', height: '12px', color: '#4b5563' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l4 10H8l4-10z" />
                          </svg>
                        </div>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}>{device.last_angle}°</span>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>

                  {/* Satellites */}
                  <td style={tdStyle}>
                    {device.last_satellites !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
                          {[1, 2, 3, 4, 5].map((bar) => (
                            <div
                              key={bar}
                              style={{
                                width: '4px',
                                borderRadius: '2px',
                                backgroundColor: bar <= Math.min(Math.ceil((device.last_satellites || 0) / 3), 5) ? '#10b981' : '#e5e7eb',
                                height: `${bar * 3 + 6}px`
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '14px', color: '#4b5563' }}>{device.last_satellites}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>

                  {/* Last seen */}
                  <td style={tdStyle}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: active ? '#059669' : '#4b5563' }}>{getTimeSince(device.last_seen_at)}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(device.last_seen_at)}</p>
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
