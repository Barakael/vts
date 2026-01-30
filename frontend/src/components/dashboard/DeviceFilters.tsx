import type { Device } from '../../types/telemetry';

export interface FilterState {
  search: string;
  status: 'all' | 'active' | 'inactive';
  model: string;
  hasGps: 'all' | 'yes' | 'no';
}

interface DeviceFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  devices: Device[];
}

export default function DeviceFilters({ filters, onFiltersChange, devices }: DeviceFiltersProps) {
  const models = [...new Set(devices.map((d) => d.model).filter(Boolean))] as string[];

  const handleChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', status: 'all', model: '', hasGps: 'all' });
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.model || filters.hasGps !== 'all';

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontSize: '14px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    minWidth: '140px'
  };

  const tagStyle = (bg: string, color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: bg,
    color: color,
    borderRadius: '9999px'
  });

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #f3f4f6',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or IMEI..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: '40px' }}
          />
        </div>

        {/* Filters label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          <span>Filters:</span>
        </div>

        {/* Status */}
        <select value={filters.status} onChange={(e) => handleChange('status', e.target.value)} style={inputStyle}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Model */}
        <select value={filters.model} onChange={(e) => handleChange('model', e.target.value)} style={inputStyle}>
          <option value="">All Models</option>
          {models.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        {/* GPS */}
        <select value={filters.hasGps} onChange={(e) => handleChange('hasGps', e.target.value)} style={inputStyle}>
          <option value="all">GPS Status</option>
          <option value="yes">Has GPS Fix</option>
          <option value="no">No GPS Fix</option>
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
          {filters.search && (
            <span style={tagStyle('#dbeafe', '#1d4ed8')}>
              Search: "{filters.search}"
              <button onClick={() => handleChange('search', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.status !== 'all' && (
            <span style={tagStyle('#d1fae5', '#047857')}>
              Status: {filters.status}
              <button onClick={() => handleChange('status', 'all')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.model && (
            <span style={tagStyle('#ede9fe', '#6d28d9')}>
              Model: {filters.model}
              <button onClick={() => handleChange('model', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.hasGps !== 'all' && (
            <span style={tagStyle('#fef3c7', '#b45309')}>
              GPS: {filters.hasGps === 'yes' ? 'Has Fix' : 'No Fix'}
              <button onClick={() => handleChange('hasGps', 'all')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
