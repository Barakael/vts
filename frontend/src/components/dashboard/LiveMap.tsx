import { useMemo } from 'react';
import { SignalIcon } from '@heroicons/react/24/outline';
import type { DevicePositionEntry } from '../../types/telemetry';

interface LiveMapProps {
	data: DevicePositionEntry[];
	loading: boolean;
	onDeviceFocus?: (deviceId: number) => void;
}

type PlottedPoint = {
	id: number;
	top: string;
	left: string;
	label: string;
};

export default function LiveMap({ data, loading, onDeviceFocus }: LiveMapProps) {
	const plottedPoints = useMemo<PlottedPoint[]>(() => {
		return data.slice(0, 24).map((entry) => {
			const { latitude, longitude } = entry.position;
			const top = `${100 - ((latitude + 90) / 180) * 100}%`;
			const left = `${((longitude + 180) / 360) * 100}%`;
			return {
				id: entry.device.id,
				top,
				left,
				label: entry.device.name ?? entry.device.imei,
			};
		});
	}, [data]);

	const recentEvents = useMemo(() => data.slice(0, 5), [data]);

	return (
		<section className="rounded-3xl border border-slate-900 bg-slate-950/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live Map</p>
					<h2 className="text-2xl font-semibold text-white">Global Fleet Tracking</h2>
				</div>
				<div className="flex items-center gap-3 text-sm text-slate-400">
					<span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 px-3 py-1 text-emerald-200">
						<SignalIcon className="h-4 w-4" />
						{`${data.length} signals`}
					</span>
					{loading && <span className="text-amber-300">Updating…</span>}
				</div>
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
				<div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
					<div
						className="pointer-events-none absolute inset-0 opacity-40"
						style={{
							backgroundImage:
								'radial-gradient(circle at center, rgba(30,64,175,0.4) 0, transparent 45%), repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)',
						}}
					/>
					{plottedPoints.length === 0 && !loading && (
						<div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
							No telemetry samples on this page.
						</div>
					)}
					{plottedPoints.map((point) => (
						<button
							key={`${point.id}-${point.left}-${point.top}`}
							type="button"
							onClick={() => onDeviceFocus?.(point.id)}
							className="group absolute -translate-x-1/2 -translate-y-1/2"
							style={{ top: point.top, left: point.left }}
						>
							<span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/40 blur-sm transition group-hover:bg-emerald-300/60" />
							<span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
							<span className="mt-2 hidden rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-200 shadow-lg group-hover:inline-flex">
								{point.label}
							</span>
						</button>
					))}
					{loading && (
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-400" />
						</div>
					)}
				</div>

				<div className="rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
					<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent activity</p>
					<div className="mt-4 space-y-3">
						{recentEvents.length === 0 && (
							<div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-sm text-slate-500">
								Awaiting telemetry data…
							</div>
						)}
						{recentEvents.map((entry) => (
							<button
								key={entry.device.id + entry.position.recorded_at}
								type="button"
								onClick={() => onDeviceFocus?.(entry.device.id)}
								className="flex w-full items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
							>
								<div>
									<p className="font-semibold text-white">{entry.device.name ?? entry.device.imei}</p>
									<p className="text-xs text-slate-500">
										{entry.position.latitude.toFixed(4)}, {entry.position.longitude.toFixed(4)}
									</p>
								</div>
								<div className="text-right text-xs text-slate-400">
									{new Date(entry.position.recorded_at).toLocaleTimeString()}
									<p className="text-emerald-300">{Math.round(entry.position.speed ?? 0)} km/h</p>
								</div>
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
