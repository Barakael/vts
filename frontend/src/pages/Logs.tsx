import { useState, useEffect } from 'react';
import { fetchAllPositions } from '../api/telemetry';
import type { DevicePositionEntry } from '../types/telemetry';

export default function Logs() {
  const [entries, setEntries] = useState<DevicePositionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [imeiFilter, setImeiFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const perPage = 20;

  const load = async (page: number) => {
    setLoading(true);
    try {
      const result = await fetchAllPositions(page, perPage);
      setEntries(result.positions ?? []);
      setTotalItems(result.pagination?.total ?? 0);
      setLastPage(result.pagination?.last_page ?? 1);
      setError(null);
    } catch {
      setError('Failed to load logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(currentPage); }, [currentPage]);

  const fmt = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');
  };

  const filtered = imeiFilter.trim()
    ? entries.filter(e => e.device?.imei?.toLowerCase().includes(imeiFilter.toLowerCase()))
    : entries;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  const pageButtons = () => {
    const total = lastPage;
    const current = currentPage;
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="px-6 pt-5 pb-1">
        <p className="text-sm text-gray-400">
          Home &rsaquo; Fleet &rsaquo; <span className="text-brand-400 font-medium">Logs</span>
        </p>
      </div>

      <div className="px-6 pb-8">
        <h1 className="text-2xl font-bold text-brand-400 mb-5">Logs</h1>

        {/* Card */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">

          {/* Blue table header bar */}
          <div className="flex items-center gap-2 px-5 py-3 bg-blue-600">
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
            <span className="text-white font-semibold text-sm">Logs</span>
          </div>

          {/* Record count */}
          {!loading && (
            <div className="px-5 py-2 text-sm text-gray-500 border-b border-gray-100">
              Showing <span className="font-medium text-gray-700">{startItem}–{endItem}</span> of{' '}
              <span className="font-medium text-gray-700">{totalItems.toLocaleString()}</span> items.
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                {/* Column headers */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['#', 'IMEI', 'Server Time', 'Tracker Time', 'Lat', 'Lng', 'Speed', 'Event Id', 'Msg ID', 'Status', ''].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
                {/* Filter inputs row */}
                <tr className="bg-gray-50 border-b border-gray-100">
                  <td className="px-4 py-1.5" />
                  <td className="px-4 py-1.5">
                    <input
                      placeholder="IMEI"
                      value={imeiFilter}
                      onChange={e => { setImeiFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </td>
                  <td className="px-4 py-1.5">
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy hh:mm"
                      className="w-36 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </td>
                  <td className="px-4 py-1.5">
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy hh:mm"
                      className="w-36 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </td>
                  {[...Array(7)].map((_, i) => <td key={i} className="px-4 py-1.5" />)}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(11)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-gray-200 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-14 text-center text-gray-400 text-sm">
                      No log entries found.
                    </td>
                  </tr>
                ) : (
                  filtered.flatMap((entry, idx) => {
                    const pos = entry.position;
                    const dev = entry.device;
                    const rowNum = (currentPage - 1) * perPage + idx + 1;
                    const isExpanded = expandedRow === pos.id;

                    const mainRow = (
                      <tr
                        key={pos.id}
                        className={`hover:bg-brand-50 transition-colors cursor-pointer ${isExpanded ? 'bg-brand-50' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : pos.id)}
                      >
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs tabular-nums">{rowNum}</td>
                        <td className="px-4 py-3 text-gray-900 font-mono font-medium text-xs">{dev?.imei ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{fmt(pos.created_at)}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{fmt(pos.recorded_at)}</td>
                        <td className="px-4 py-3 text-gray-700 font-mono text-xs tabular-nums">{pos.latitude.toFixed(6)}</td>
                        <td className="px-4 py-3 text-gray-700 font-mono text-xs tabular-nums">{pos.longitude.toFixed(6)}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs tabular-nums">{pos.speed ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{pos.event_id ?? '(not set)'}</td>
                        <td className="px-4 py-3 text-gray-700 font-mono text-xs tabular-nums">{pos.id}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            1
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); setExpandedRow(isExpanded ? null : pos.id); }}
                            className="px-3 py-1 text-xs font-medium text-white rounded bg-blue-500 hover:bg-blue-600 transition-colors"
                          >
                            view
                          </button>
                        </td>
                      </tr>
                    );

                    if (!isExpanded) return [mainRow];

                    const detailRow = (
                      <tr key={`${pos.id}-detail`} className="bg-brand-50 border-b border-brand-100">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">Device Name</span>
                              <p className="mt-0.5 text-gray-800">{dev?.name ?? '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">Reg No</span>
                              <p className="mt-0.5 text-gray-800">{dev?.reg_no ?? '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">Model</span>
                              <p className="mt-0.5 text-gray-800">{dev?.model ?? '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">SIM No</span>
                              <p className="mt-0.5 text-gray-800">{dev?.sim_no ?? '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">Altitude</span>
                              <p className="mt-0.5 text-gray-800">{pos.altitude != null ? `${pos.altitude} m` : '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">Angle / Bearing</span>
                              <p className="mt-0.5 text-gray-800">{pos.angle != null ? `${pos.angle}°` : '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">Satellites</span>
                              <p className="mt-0.5 text-gray-800">{pos.satellites ?? '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">Priority</span>
                              <p className="mt-0.5 text-gray-800">{pos.priority ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );

                    return [mainRow, detailRow];
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                Page <span className="font-medium text-gray-700">{currentPage}</span> of{' '}
                <span className="font-medium text-gray-700">{lastPage}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {pageButtons().map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded border ${
                      page === currentPage
                        ? 'bg-brand-500 text-white border-brand-500 font-semibold'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                  disabled={currentPage === lastPage}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(lastPage)}
                  disabled={currentPage === lastPage}
                  className="px-2.5 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{error}</div>
        )}
      </div>
    </div>
  );
}
