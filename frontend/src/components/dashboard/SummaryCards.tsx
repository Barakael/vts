import type { Device } from '../../types/telemetry';

interface SummaryCardsProps {
  devices: Device[];
  loading?: boolean;
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
}

const icons: Record<string, React.ReactNode> = {
  device: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  signal: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  mapPin: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  speed: (
    <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
};

export default function SummaryCards({ devices, loading }: SummaryCardsProps) {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => {
    if (!d.last_seen_at) return false;
    return new Date(d.last_seen_at) >= fiveMinutesAgo;
  }).length;
  const devicesWithFix = devices.filter((d) => d.last_latitude && d.last_longitude).length;
  const avgSpeed = devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + (d.last_speed || 0), 0) / (devices.filter(d => d.last_speed).length || 1))
    : 0;

  const stats: StatCard[] = [
    { title: 'Total Devices', value: totalDevices, subtitle: 'Registered in system', icon: 'device', color: '#3b82f6', bgColor: '#dbeafe' },
    { title: 'Active Now', value: activeDevices, subtitle: 'Sending data (5 min)', icon: 'signal', color: '#10b981', bgColor: '#d1fae5' },
    { title: 'GPS Fix', value: devicesWithFix, subtitle: 'With valid location', icon: 'mapPin', color: '#8b5cf6', bgColor: '#ede9fe' },
    // { title: 'Avg Speed', value: `${avgSpeed} km/h`, subtitle: 'Across all devices', icon: 'speed', color: '#f59e0b', bgColor: '#fef3c7' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ height: '16px', width: '96px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ height: '32px', width: '64px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '12px', width: '120px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#e5e7eb', borderRadius: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
      {stats.map((stat) => (
        <div
          key={stat.title}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>{stat.title}</p>
              <p style={{ fontSize: '30px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>{stat.subtitle}</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: stat.bgColor, color: stat.color }}>
              {icons[stat.icon]}
            </div>
          </div>
          <div style={{ marginTop: '16px', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              backgroundColor: stat.color,
              borderRadius: '3px',
              width: `${typeof stat.value === 'number' ? Math.min((stat.value / Math.max(totalDevices, 1)) * 100, 100) : 50}%`
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
