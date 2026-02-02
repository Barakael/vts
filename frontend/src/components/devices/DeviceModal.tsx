import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Device } from '../../types/telemetry';

interface DeviceModalProps {
  isOpen: boolean;
  device: Device | null;
  onClose: () => void;
  onSave: (data: {
    name?: string;
    imei: string;
    model?: string;
    reg_no?: string;
    sim_no?: string;
  }) => Promise<void>;
}

export default function DeviceModal({ isOpen, device, onClose, onSave }: DeviceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    imei: '',
    model: '',
    reg_no: '',
    sim_no: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        imei: device.imei,
        model: device.model || '',
        reg_no: device.reg_no || '',
        sim_no: device.sim_no || '',
      });
    } else {
      setFormData({
        name: '',
        imei: '',
        model: '',
        reg_no: '',
        sim_no: '',
      });
    }
    setErrors({});
  }, [device, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await onSave({
        name: formData.name || undefined,
        imei: formData.imei,
        model: formData.model || undefined,
        reg_no: formData.reg_no || undefined,
        sim_no: formData.sim_no || undefined,
      });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save device. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl transform transition-all">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {device ? 'Edit Device' : 'Add New Device'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* IMEI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IMEI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.imei}
                    onChange={(e) => handleChange('imei', e.target.value)}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      errors.imei ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter IMEI number"
                  />
                  {errors.imei && (
                    <p className="mt-1 text-sm text-red-600">{errors.imei}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter device name"
                  />
                </div>

                {/* Reg No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.reg_no}
                    onChange={(e) => handleChange('reg_no', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter registration number"
                  />
                </div>

                {/* SIM No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SIM Number
                  </label>
                  <input
                    type="text"
                    value={formData.sim_no}
                    onChange={(e) => handleChange('sim_no', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter SIM card number"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter device model"
                  />
                </div>

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : (device ? 'Update Device' : 'Add Device')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}