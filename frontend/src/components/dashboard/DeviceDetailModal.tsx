import { useCallback, useEffect, useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Pagination from '../common/Pagination';
import {
	fetchDevicePositions,
	type DevicePositionsResponse,
	type PaginationMeta,
} from '../../api/telemetry';
import type { DevicePositionEntry } from '../../types/telemetry';

interface DeviceDetailModalProps {
	deviceId: number;
	deviceName: string;
	onClose: () => void;
}

type Position = DevicePositionEntry['position'];

const defaultMeta: PaginationMeta = {
	current_page: 1,
	per_page: 10,
	total: 0,
	last_page: 1,
};

export default function DeviceDetailModal({ deviceId, deviceName, onClose }: DeviceDetailModalProps) {
	const [positions, setPositions] = useState<Position[]>([]);
	const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deviceInfo, setDeviceInfo] = useState<DevicePositionsResponse['device'] | null>(null);

	const loadPositions = useCallback(
		async (page = 1) => {
			setLoading(true);
			try {
				const response = await fetchDevicePositions(deviceId, page, 10);
				setPositions(response.positions);
				setMeta(response.pagination);
				setDeviceInfo(response.device);
				setError(null);
			} catch (err) {
				setError('Unable to load device positions');
			} finally {
				setLoading(false);
			}
		},
		[deviceId]
	);

	useEffect(() => {
		loadPositions(1);
	}, [loadPositions]);

	useEffect(() => {
		if (typeof document === 'undefined') return () => undefined;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, []);

	const lastPing = positions[0]?.recorded_at ? new Date(positions[0].recorded_at).toLocaleString() : '—';

	const metrics = useMemo(
		() => [
			{ label: 'IMEI', value: deviceInfo?.imei ?? '—' },
			{ label: 'Records', value: meta.total.toLocaleString() },
			{ label: 'Last ping', value: lastPing },
		],
		[deviceInfo?.imei, meta.total, lastPing]
	);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10">
			<div className="w-full max-w-4xl rounded-3xl border border-slate-900 bg-slate-950/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
				<header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-900 pb-4">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-slate-500">Device insight</p>
						<h3 className="mt-2 text-2xl font-semibold text-white">{deviceName}</h3>
						<p className="text-sm text-slate-500">{deviceInfo?.imei ?? 'Fetching IMEI…'}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-2xl border border-slate-800 p-2 text-slate-400 transition hover:border-rose-500/50 hover:text-white"
					>
						<XMarkIcon className="h-6 w-6" />
					</button>
				</header>

				<div className="mt-6 grid gap-4 sm:grid-cols-3">
					{metrics.map((metric) => (
						<div key={metric.label} className="rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
							<p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
							<p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
						</div>
					))}
				</div>

				<div className="mt-6 rounded-2xl border border-slate-900 bg-slate-950/70">
					<div className="flex items-center justify-between border-b border-slate-900 px-6 py-4 text-sm text-slate-400">
						<span>Historical telemetry ({meta.total.toLocaleString()} samples)</span>
						<span>Page {meta.current_page} of {meta.last_page}</span>
					</div>

					<div className="max-h-[360px] overflow-y-auto">
						{loading ? (
							<div className="flex items-center justify-center p-8 text-sm text-slate-500">
								Loading records…
							</div>
						) : positions.length === 0 ? (
							<div className="flex items-center justify-center p-8 text-sm text-slate-500">
								No telemetry history available.
							</div>
						) : (
							<table className="min-w-full divide-y divide-slate-900 text-sm text-slate-300">
								<thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
									<tr>
										<th className="px-6 py-3 text-left">Timestamp</th>
										<th className="px-6 py-3 text-left">Speed</th>
										<th className="px-6 py-3 text-left">Coordinates</th>
										<th className="px-6 py-3 text-left">Altitude</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-900">
									{positions.map((position) => (
										<tr key={position.id}>
											<td className="px-6 py-3 text-white">{new Date(position.recorded_at).toLocaleString()}</td>
											<td className="px-6 py-3 text-emerald-300">{formatSpeed(position.speed)}</td>
											<td className="px-6 py-3 text-slate-400">
												{position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
											</td>
											<td className="px-6 py-3 text-slate-400">{position.altitude ?? '—'} m</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					<div className="border-t border-slate-900 px-6 py-4">
						<Pagination meta={meta} onPageChange={loadPositions} />
					</div>
				</div>

				{error && (
					<div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
						{error}
					</div>
				)}
			</div>
		</div>
	);
}

function formatSpeed(speed?: number | null) {
	if (speed == null) return '—';
	return `${Math.round(speed)} km/h`;
}
