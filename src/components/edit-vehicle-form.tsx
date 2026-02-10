import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { JSX, useState, useEffect } from 'react';
import { vehicleFormSchema, type VehicleFormSchema } from '../schemas/vehicle.schema';
import { updateVehicle } from '../services/vehicle.service';
import type { Vehicle } from '../types/vehicle.types';

/**
 * Props for EditVehicleForm component
 */
interface EditVehicleFormProps {
  vehicle: Vehicle;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Form component for editing an existing vehicle
 * Uses provided vehicle data, validates with Zod, and updates via API
 */
export const EditVehicleForm = ({ vehicle, onSave, onCancel }: EditVehicleFormProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<VehicleFormSchema>({
    resolver: zodResolver(vehicleFormSchema),
    mode: 'onChange',
  });

  /**
   * Load vehicle data into form when component mounts or vehicle changes
   */
  useEffect(() => {
    if (vehicle) {
      // Reset form with provided vehicle data
      reset({
        dealer_code: vehicle.dealer_code || '',
        dealer_name: vehicle.dealer_name || '',
        dealer_address: vehicle.dealer_address || '',
        dealer_city: vehicle.dealer_city || '',
        dealer_state: vehicle.dealer_state || '',
        model_name: vehicle.model_name || '',
        model_id: vehicle.model_id || '',
        battery_power: vehicle.battery_power || '',
        serial_number: vehicle.serial_number || '',
      });
    }
  }, [vehicle, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: VehicleFormSchema): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateVehicle(vehicle.id, data);

      if (response.success) {
        toast.success(response.message || 'Vehicle updated successfully');
        onSave();
      } else {
        toast.error(response.error || 'Failed to update vehicle');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = isValid && !isSubmitting;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit Vehicle</h2>
          <p className="text-sm text-slate-600 mt-1">Update vehicle details</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close edit vehicle form"
          className="self-start sm:self-auto text-slate-500 hover:text-slate-700 text-2xl leading-none font-bold"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dealer Code - Required */}
        <div>
          <label htmlFor="edit_dealer_code" className="block text-sm font-medium text-slate-700 mb-1">
            Dealer Code <span className="text-red-500">*</span>
          </label>
          <input
            id="edit_dealer_code"
            type="text"
            {...register('dealer_code')}
            className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 bg-white ${
              errors.dealer_code
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-emerald-500'
            }`}
            placeholder="Enter dealer code"
          />
          {errors.dealer_code && (
            <p className="mt-1 text-sm text-red-600">{errors.dealer_code.message}</p>
          )}
        </div>

        {/* Dealer Name */}
        <div>
          <label htmlFor="edit_dealer_name" className="block text-sm font-medium text-slate-700 mb-1">
            Dealer Name
          </label>
          <input
            id="edit_dealer_name"
            type="text"
            {...register('dealer_name')}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Enter dealer name"
          />
        </div>

        {/* Dealer Address */}
        <div className="sm:col-span-2">
          <label
            htmlFor="edit_dealer_address"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Dealer Address
          </label>
          <input
            id="edit_dealer_address"
            type="text"
            {...register('dealer_address')}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Enter dealer address"
          />
        </div>

        {/* Dealer City */}
        <div>
          <label htmlFor="edit_dealer_city" className="block text-sm font-medium text-slate-700 mb-1">
            Dealer City
          </label>
          <input
            id="edit_dealer_city"
            type="text"
            {...register('dealer_city')}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Enter dealer city"
          />
        </div>

        {/* Dealer State */}
        <div>
          <label htmlFor="edit_dealer_state" className="block text-sm font-medium text-slate-700 mb-1">
            Dealer State
          </label>
          <input
            id="edit_dealer_state"
            type="text"
            {...register('dealer_state')}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Enter dealer state"
          />
        </div>

        {/* Model Name - Required */}
        <div>
          <label htmlFor="edit_model_name" className="block text-sm font-medium text-slate-700 mb-1">
            Model Name <span className="text-red-500">*</span>
          </label>
          <input
            id="edit_model_name"
            type="text"
            {...register('model_name')}
            className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 bg-white ${
              errors.model_name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-emerald-500'
            }`}
            placeholder="Enter model name"
          />
          {errors.model_name && (
            <p className="mt-1 text-sm text-red-600">{errors.model_name.message}</p>
          )}
        </div>

        {/* Model ID */}
        <div>
          <label htmlFor="edit_model_id" className="block text-sm font-medium text-slate-700 mb-1">
            Model ID
          </label>
          <input
            id="edit_model_id"
            type="text"
            {...register('model_id')}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Enter model ID"
          />
        </div>

        {/* Battery Power */}
        <div>
          <label
            htmlFor="edit_battery_power"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Battery Power
          </label>
          <input
            id="edit_battery_power"
            type="text"
            {...register('battery_power')}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Enter battery power"
          />
        </div>

        {/* Serial Number - Required */}
        <div>
          <label
            htmlFor="edit_serial_number"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Serial Number <span className="text-red-500">*</span>
          </label>
          <input
            id="edit_serial_number"
            type="text"
            {...register('serial_number')}
            className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 bg-white ${
              errors.serial_number
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-emerald-500'
            }`}
            placeholder="Enter serial number"
          />
          {errors.serial_number && (
            <p className="mt-1 text-sm text-red-600">{errors.serial_number.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              canSubmit
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
