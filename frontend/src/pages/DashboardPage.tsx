import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ArrowPathIcon,
	BellAlertIcon,
	BoltIcon,
	Cog6ToothIcon,
	HomeIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	PowerIcon,
	SignalIcon,
	WifiIcon,
} from '@heroicons/react/24/outline';
import LiveMap from '../components/dashboard/LiveMap';
import DataTable from '../components/dashboard/DataTable';
import DeviceDetailModal from '../components/dashboard/DeviceDetailModal';
import Pagination from '../components/common/Pagination';
import { fetchAllPositions, type AllPositionsResponse, type PaginationMeta } from '../api/telemetry';
import { useAuth } from '../context/AuthContext';
import type { DevicePositionEntry } from '../types/telemetry';

type Tone = 'emerald' | 'sky' | 'amber';

type CachedPage = {
	positions: DevicePositionEntry[];
	pagination: PaginationMeta;
	timestamp: number;
};

type CachedData = Record<number, CachedPage>;

const navItems = [
	{ label: 'Command Center', icon: HomeIcon },
	{ label: 'Devices', icon: SignalIcon },
	{ label: 'Alerts', icon: BellAlertIcon },
	{ label: 'Maintenance', icon: BoltIcon },
	{ label: 'Settings', icon: Cog6ToothIcon },
];

const cls = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

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
	const [selectedDeviceName, setSelectedDeviceName] = useState('');
	const [lastUpdated, setLastUpdated] = useState<number | null>(null);

	const greeting = user ? `Welcome back, ${user.name ?? 'operator'}` : 'Vehicle Telemetry Command Center';

	const loadPage = useCallback(
		async (page: number, force = false) => {
			const now = Date.now();
			const cachedPage = cache[page];

			if (!force && cachedPage && now - cachedPage.timestamp < 30000) {
				setPositions(cachedPage.positions);
				setPagination({ ...cachedPage.pagination });
				setLastUpdated(cachedPage.timestamp);
				setLoading(false);
				setError(null);
				return;
			}

			setLoading(true);
			try {
				const data: AllPositionsResponse = await fetchAllPositions(page, perPage);
				setPositions(data.positions);
				setPagination({ ...data.pagination });
				setLastUpdated(now);
				setError(null);
				setCache((prev) => ({
					...prev,
					[page]: {
						positions: data.positions,
						pagination: { ...data.pagination },
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
		loadPage(currentPage);
		const id = setInterval(() => loadPage(currentPage), 30000);
		return () => clearInterval(id);
	}, [currentPage, loadPage]);

	const totals = useMemo(() => {
		const activeTimeout = 5 * 60 * 1000;
		const activeDevices = positions.reduce((acc, entry) => {
			const isActive = Date.now() - new Date(entry.position.recorded_at).getTime() < activeTimeout;
			return isActive ? acc + 1 : acc;
		}, 0);

		const uniqueDevices = new Set(positions.map((entry) => entry.device.id)).size;

		return {
			total: pagination.total,
			active: activeDevices,
			devices: uniqueDevices,
		};
	}, [positions, pagination.total]);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, pagination.last_page)));
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}, [pagination.last_page]);

	const handleDeviceClick = useCallback(
		(deviceId: number) => {
			const device = positions.find((entry) => entry.device.id === deviceId);
			if (device) {
				setSelectedDeviceId(device.device.id);
				setSelectedDeviceName(device.device.name ?? `Device #${device.device.id}`);
			}
		},
		[positions]
	);

	const handleCloseModal = useCallback(() => {
		setSelectedDeviceId(null);
		setSelectedDeviceName('');
	}, []);

	const handleLogout = useCallback(async () => {
		try {
			await logout();
		} catch (err) {
			// ignore logout errors
		}
	}, [logout]);

	const refreshData = useCallback(() => {
		setCache({});
		loadPage(currentPage, true);
	}, [currentPage, loadPage]);

	const lastUpdatedDisplay = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—';

	const statCards = [
		{
			label: 'Total Records',
			value: totals.total.toLocaleString(),
			trend: '+8.4% vs last day',
			accent: 'from-indigo-500/50 to-purple-500/50',
		},
		{
			label: 'Active Devices',
			value: totals.active,
			trend: 'Live within 5 min',
			accent: 'from-emerald-500/40 to-teal-500/40',
		},
		{
			label: 'Unique Devices',
			value: totals.devices,
			trend: 'Fleet footprint',
			accent: 'from-sky-500/40 to-cyan-500/40',
		},
		{
			label: 'Page Status',
			value: `${pagination.current_page} / ${pagination.last_page}`,
			trend: `${pagination.per_page} per page`,
			accent: 'from-rose-500/40 to-amber-500/40',
		},
	];

	return (
		<div className="flex min-h-screen bg-slate-950 text-slate-100">
			<aside className="hidden w-72 flex-col border-r border-slate-900/70 bg-slate-950/95 px-6 py-8 lg:flex">
				<div className="mb-10 flex items-center gap-2 text-lg font-semibold tracking-tight">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
						<SignalIcon className="h-6 w-6" />
					</div>
					VTS Control
				</div>

				<nav className="space-y-2">
					{navItems.map(({ label, icon: Icon }, idx) => (
						<button
							key={label}
							type="button"
							className={cls(
								'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition',
								idx === 0
									? 'bg-slate-900 text-white shadow-[0_0_30px_rgba(16,185,129,0.15)]'
									: 'text-slate-400 hover:bg-slate-900/60'
							)}
						>
							<Icon className="h-5 w-5" />
							{label}
						</button>
					))}
				</nav>

				<div className="mt-12 space-y-4 text-sm text-slate-400">
					<div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4">
						<p className="text-xs uppercase tracking-wide text-slate-500">Telemetry Health</p>
						<div className="mt-3 space-y-2 text-sm">
							<StatusPill label="Sat links" icon={WifiIcon} value="Stable" tone="emerald" />
							<StatusPill label="Data bus" icon={BoltIcon} value="Syncing" tone="sky" />
							<StatusPill label="Alert queue" icon={BellAlertIcon} value="Nominal" tone="amber" />
						</div>
					</div>

					<div className="rounded-2xl border border-slate-900 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
						<p className="text-xs uppercase tracking-wide text-slate-500">Operator</p>
						<p className="mt-2 text-base font-semibold text-white">{user?.name ?? 'Unassigned'}</p>
						<p className="text-xs text-slate-500">{user?.email ?? 'No email on file'}</p>
						<button
							type="button"
							onClick={handleLogout}
							className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-500/50 hover:text-white"
						>
							<PowerIcon className="h-4 w-4" /> Sign out
						</button>
					</div>
				</div>
			</aside>

			<div className="flex flex-1 flex-col">
				<TopBar lastUpdated={lastUpdatedDisplay} onRefresh={refreshData} />

				<main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
					<section className="rounded-3xl border border-slate-900 bg-gradient-to-br from-slate-900/70 via-slate-950 to-slate-950/80 p-8">
						<div className="flex flex-wrap items-start justify-between gap-6">
							<div>
								<p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Mission Control</p>
								<h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{greeting}</h1>
								<p className="mt-2 max-w-2xl text-sm text-slate-400">
									Monitor live GPS telemetry, evaluate fleet performance, and investigate anomalies from a single
									command-center view. Data auto-refreshes every 30 seconds and is cached locally for speed.
								</p>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row">
								<button
									type="button"
									onClick={refreshData}
									className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-white shadow-inner shadow-black/40 transition hover:border-emerald-500/50"
								>
									<ArrowPathIcon className="h-5 w-5" /> Sync now
								</button>
								<button
									type="button"
									className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-200"
								>
									<MapPinIcon className="h-5 w-5" /> Live geofences
								</button>
							</div>
						</div>

						<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{statCards.map((card) => (
								<div key={card.label} className="rounded-2xl border border-slate-900 bg-slate-950/80 p-5">
									<div className={cls('rounded-xl bg-gradient-to-br p-3 text-xs font-medium text-white', card.accent)}>
										{card.label}
									</div>
									<p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
									<p className="text-xs text-slate-500">{card.trend}</p>
								</div>
							))}
						</div>
					</section>

					<section className="mt-10">
						<LiveMap data={positions} loading={loading} onDeviceFocus={handleDeviceClick} />
					</section>

					<section className="mt-10 rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
						<header className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-white">Telemetry Feed</h2>
								<p className="text-sm text-slate-500">Showing real-time payloads for the current page.</p>
							</div>
							<span className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
								Last updated {lastUpdatedDisplay}
							</span>
						</header>

						{error && (
							<div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
								{error}
							</div>
						)}

						<DataTable data={positions} loading={loading} onDeviceClick={handleDeviceClick} />

						<div className="mt-6">
							<Pagination meta={pagination} onPageChange={handlePageChange} />
						</div>
					</section>

					<footer className="mt-10 rounded-3xl border border-slate-900 bg-slate-950/70 p-6 text-sm text-slate-500">
						System cache enabled · {positions.length} records loaded · Local time {new Date().toLocaleTimeString()}
					</footer>
				</main>
			</div>

			{selectedDeviceId && (
				<DeviceDetailModal
					deviceId={selectedDeviceId}
					deviceName={selectedDeviceName}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
}

function StatusPill({
	label,
	value,
	icon: Icon,
	tone,
}: {
	label: string;
	value: string;
	icon: typeof WifiIcon;
	tone: Tone;
}) {
	const tones: Record<Tone, string> = {
		emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
		sky: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
		amber: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
	};

	return (
		<div className={cls('flex items-center justify-between rounded-xl border px-3 py-2 text-xs', tones[tone])}>
			<span className="flex items-center gap-2 text-[13px]">
				<Icon className="h-4 w-4" /> {label}
			</span>
			<span className="font-semibold">{value}</span>
		</div>
	);
}

function TopBar({ lastUpdated, onRefresh }: { lastUpdated: string; onRefresh: () => void }) {
	return (
		<div className="sticky top-0 z-30 border-b border-slate-900/60 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-3 text-sm text-slate-500">
					<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-200">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
						</span>
						Live
					</span>
					<span>Updated {lastUpdated}</span>
				</div>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
					<label className="flex items-center rounded-2xl border border-slate-900 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
						<MagnifyingGlassIcon className="mr-2 h-4 w-4" />
						<input
							type="search"
							placeholder="Search devices or IMEI"
							className="w-60 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
						/>
					</label>
					<button
						type="button"
						onClick={onRefresh}
						className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-500/50"
					>
						<ArrowPathIcon className="h-4 w-4" /> Refresh
					</button>
				</div>
			</div>
		</div>
	);
}
