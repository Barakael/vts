import type { DevicePositionEntry } from '../../types/telemetry';

interface DataTableProps {
	data: DevicePositionEntry[];
	loading: boolean;
	onDeviceClick: (deviceId: number) => void;
}

const formatRelativeTime = (timestamp: string) => {
	const diff = Date.now() - new Date(timestamp).getTime();
	const minutes = Math.max(0, Math.round(diff / 60000));
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.round(hours / 24);
	return `${days}d ago`;
};

const formatSpeed = (speed?: number | null) => {
	if (speed == null) return '—';
	return `${Math.round(speed)} km/h`;
};

export default function DataTable({ data, loading, onDeviceClick }: DataTableProps) {
	const showSkeleton = loading && data.length === 0;

	if (showSkeleton) {
		return (
			<div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-8 text-center text-sm text-slate-500">
				<div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-400" />
				<p className="mt-4">Loading telemetry records…</p>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-sm text-slate-500">
				No telemetry data available for this page.
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-3xl border border-slate-900 bg-slate-950/70">
			<table className="min-w-full divide-y divide-slate-900 text-sm">
				<thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
					<tr>
						<th className="px-6 py-3 text-left">Device</th>
						<th className="px-6 py-3 text-left">Coordinates</th>
						<th className="px-6 py-3 text-left">Speed</th>
						<th className="px-6 py-3 text-left">Satellites</th>
						<th className="px-6 py-3 text-left">Timestamp</th>
						<th className="px-6 py-3 text-left">Status</th>
						<th className="px-6 py-3" />
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-900">
					{data.map((entry) => {
						const { device, position } = entry;
						const isActive = Date.now() - new Date(position.recorded_at).getTime() < 5 * 60 * 1000;
						return (
							<tr key={`${device.id}-${position.id}`} className="text-slate-300">
								<td className="px-6 py-4">
									<div className="text-sm font-semibold text-white">{device.name ?? device.imei}</div>
									<div className="text-xs text-slate-500">IMEI: {device.imei}</div>
								</td>
								<td className="px-6 py-4 text-xs text-slate-400">
									{position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
								</td>
								<td className="px-6 py-4 text-sm text-emerald-300">{formatSpeed(position.speed)}</td>
								<td className="px-6 py-4 text-sm">{position.satellites ?? '—'}</td>
								<td className="px-6 py-4 text-sm text-slate-400">
									{new Date(position.recorded_at).toLocaleString()}
									<div className="text-xs text-slate-500">{formatRelativeTime(position.recorded_at)}</div>
								</td>
								<td className="px-6 py-4">
									<span
										className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
											isActive
												? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
												: 'border border-slate-700 bg-slate-800 text-slate-400'
										}`}
									>
										<span className="h-2 w-2 rounded-full bg-current" /> {isActive ? 'Active' : 'Idle'}
									</span>
								</td>
								<td className="px-6 py-4 text-right">
									<button
										type="button"
										onClick={() => onDeviceClick(device.id)}
										className="rounded-2xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/50"
									>
										Inspect
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
