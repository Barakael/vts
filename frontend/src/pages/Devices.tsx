import { useState, useEffect, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '../api/devices';
import type { Device } from '../types/telemetry';
import DeviceTable from '../components/devices/DeviceTable';
import DeviceFilters from '../components/devices/DeviceFilters';
import DeviceModal from '../components/devices/DeviceModal';
import DeviceDetailModal from '../components/devices/DeviceDetailModal';
import SimplePagination from '../components/common/SimplePagination';

export interface DeviceFiltersState {
  search: string;
  status: 'all' | 'active' | 'inactive';
  model: string;
  hasGps: 'all' | 'yes' | 'no';
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DeviceFiltersState>({
    search: '',
    status: 'all',
    model: '',
    hasGps: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const itemsPerPage = 10;

  const loadDevices = async () => {
    setLoading(true);
    try {
      const response = await fetchDevices();
      setDevices(response.data.devices || []);
      setError(null);
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

  // Filter and paginate devices
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          (device.name && device.name.toLowerCase().includes(searchLower)) ||
          device.imei.toLowerCase().includes(searchLower) ||
          (device.reg_no && device.reg_no.toLowerCase().includes(searchLower)) ||
          (device.sim_no && device.sim_no.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const isActive = device.last_seen_at && new Date(device.last_seen_at) >= new Date(Date.now() - 5 * 60 * 1000);
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }

      // Model filter
      if (filters.model && device.model !== filters.model) return false;

      // GPS filter
      if (filters.hasGps !== 'all') {
        const hasGps = device.last_latitude !== null && device.last_longitude !== null;
        if (filters.hasGps === 'yes' && !hasGps) return false;
        if (filters.hasGps === 'no' && hasGps) return false;
      }

      return true;
    });
  }, [devices, filters]);

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddDevice = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleViewDevice = (device: Device) => {
    setViewingDevice(device);
    setIsDetailModalOpen(true);
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      await deleteDevice(deviceId);
      await loadDevices();
    } catch (err) {
      alert('Failed to delete device. Please try again.');
      console.error('Error deleting device:', err);
    }
  };

  const handleSaveDevice = async (data: {
    name?: string;
    imei: string;
    model?: string;
    reg_no?: string;
    sim_no?: string;
  }) => {
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.id, data);
      } else {
        await createDevice(data);
      }
      setIsModalOpen(false);
      await loadDevices();
    } catch (err) {
      alert('Failed to save device. Please try again.');
      console.error('Error saving device:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
            <p className="mt-2 text-gray-600">Manage your GPS tracking devices</p>
          </div>
          <button
            onClick={handleAddDevice}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Device
          </button>
        </div>

        {/* Filters */}
        <DeviceFilters
          filters={filters}
          onFiltersChange={setFilters}
          devices={devices}
        />

        {/* Table */}
        <DeviceTable
          devices={paginatedDevices}
          loading={loading}
          onEdit={handleEditDevice}
          onDelete={handleDeleteDevice}
          onView={handleViewDevice}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
      </div>

      {/* Device Modal */}
      <DeviceModal
        isOpen={isModalOpen}
        device={editingDevice}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDevice}
      />

      {/* Device Detail Modal */}
      <DeviceDetailModal
        isOpen={isDetailModalOpen}
        device={viewingDevice}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}