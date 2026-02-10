import { JSX, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getVehicles, deleteVehicle, markAsSold } from '../services/vehicle.service';
import type { Vehicle } from '../types/vehicle.types';
import { useDebounce } from '../hooks/use-debounce';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { EditVehicleForm } from './edit-vehicle-form';
import { ActionMenu } from './action-menu';

/**
 * Pagination configuration
 */
const ITEMS_PER_PAGE = 5;

/**
 * Debounce delay for search inputs (in milliseconds)
 */
const DEBOUNCE_DELAY_MS = 500;

/**
 * Search mode for vehicle dashboard
 * - serial_number: search only by serial number
 * - dealer_code: search only by dealer code
 */
type VehicleSearchMode = 'serial_number' | 'dealer_code';

/**
 * Dashboard component displaying vehicles in a table with pagination, search, and actions
 */
export const VehicleDashboard = (): JSX.Element => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchSerialNumber, setSearchSerialNumber] = useState<string>('');
  const [searchDealerCode, setSearchDealerCode] = useState<string>('');
  const [searchMode, setSearchMode] = useState<VehicleSearchMode>('serial_number');
  const debouncedSerialNumber = useDebounce(searchSerialNumber, DEBOUNCE_DELAY_MS);
  const debouncedDealerCode = useDebounce(searchDealerCode, DEBOUNCE_DELAY_MS);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<{ id: number; serialNumber: string } | null>(
    null,
  );

  /**
   * Fetch vehicles from API with optional filters
   * @param serialNumber - Optional serial number filter
   * @param dealerCode - Optional dealer code filter
   */
  const fetchVehicles = useCallback(async (
    serialNumber?: string,
    dealerCode?: string,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const serialNum = serialNumber?.trim() || undefined;
      const dealer = dealerCode?.trim() || undefined;

      const response = await getVehicles(serialNum, dealer);

      if (response.error) {
        toast.error(response.error);
        setVehicles([]);
      } else {
        setVehicles(response.vehicles || []);
        // Reset to first page when search changes
        setCurrentPage(1);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch vehicles';
      toast.error(errorMessage);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Auto-search when debounced search values change.
   * Fires on mount (both values are '') and 500ms after
   * the user stops typing in either search field.
   * The active searchMode determines which single filter is applied.
   */
  useEffect(() => {
    let serialFilter: string | undefined;
    let dealerFilter: string | undefined;
    if (searchMode === 'serial_number') {
      serialFilter = debouncedSerialNumber;
      dealerFilter = undefined;
    } else {
      serialFilter = undefined;
      dealerFilter = debouncedDealerCode;
    }
    fetchVehicles(serialFilter, dealerFilter);
  }, [debouncedSerialNumber, debouncedDealerCode, searchMode, fetchVehicles]);

  /**
   * Handle clear search filters.
   * Resetting the state triggers the debounced auto-search effect.
   */
  const handleClearSearch = (): void => {
    setSearchSerialNumber('');
    setSearchDealerCode('');
  };

  /**
   * Handle delete vehicle
   */
  const handleDelete = async (): Promise<void> => {
    if (!deletingVehicle) {
      return;
    }

    try {
      const response = await deleteVehicle(deletingVehicle.id);

      if (response.success) {
        toast.success(response.message || 'Vehicle deleted successfully');
        setDeletingVehicle(null);
        fetchVehicles(); // Refresh the list
      } else {
        toast.error(response.error || 'Failed to delete vehicle');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    }
  };

  /**
   * Handle mark as sold
   * Updates both frontend state immediately and backend via API
   */
  const handleMarkAsSold = async (vehicle: Vehicle): Promise<void> => {
    // Optimistically update frontend state immediately
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) =>
        v.id === vehicle.id ? { ...v, status: 'sold' } : v
      )
    );

    try {
      const response = await markAsSold(vehicle.id);

      if (response.success) {
        toast.success(response.message || 'Vehicle marked as sold successfully');
        // Refresh the list to ensure backend and frontend are in sync
        fetchVehicles();
      } else {
        // Revert optimistic update on error
        setVehicles((prevVehicles) =>
          prevVehicles.map((v) =>
            v.id === vehicle.id ? { ...v, status: vehicle.status } : v
          )
        );
        toast.error(response.error || 'Failed to mark vehicle as sold');
      }
    } catch (error) {
      // Revert optimistic update on error
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) =>
          v.id === vehicle.id ? { ...v, status: vehicle.status } : v
        )
      );
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    }
  };

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVehicles = vehicles.slice(startIndex, endIndex);
  const hasSearchFilters =
    searchSerialNumber.trim().length > 0 || searchDealerCode.trim().length > 0;
  const isSearchPending =
    searchSerialNumber !== debouncedSerialNumber ||
    searchDealerCode !== debouncedDealerCode;

  /**
   * Handle edit save - refresh list and close edit form
   */
  const handleEditSave = (): void => {
    setEditingVehicle(null);
    fetchVehicles();
  };

  /**
   * Handle edit cancel - just close edit form
   */
  const handleEditCancel = (): void => {
    setEditingVehicle(null);
  };

  // Show edit form if editing
  if (editingVehicle !== null) {
    return (
      <EditVehicleForm vehicle={editingVehicle} onSave={handleEditSave} onCancel={handleEditCancel} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Vehicle Dashboard
          </h2>
          <p className="text-slate-600 mt-1">Manage your vehicle inventory</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-sm font-semibold text-slate-900">{vehicles.length}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Showing</div>
            <div className="text-sm font-semibold text-slate-900">{currentVehicles.length}</div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Search Vehicles</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Search either by serial number or by dealer code.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={(): void => {
                  setSearchMode('serial_number');
                  setSearchDealerCode('');
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                  searchMode === 'serial_number'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Serial Number
              </button>
              <button
                type="button"
                onClick={(): void => {
                  setSearchMode('dealer_code');
                  setSearchSerialNumber('');
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-colors ${
                  searchMode === 'dealer_code'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dealer Code
              </button>
            </div>
            {isSearchPending && (
              <span className="text-xs sm:text-sm text-blue-600 animate-pulse">Searching...</span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {searchMode === 'serial_number' && (
            <div>
              <label htmlFor="search_serial" className="block text-sm font-medium text-slate-700 mb-1">
                Serial Number
              </label>
              <input
                id="search_serial"
                type="text"
                value={searchSerialNumber}
                onChange={(event) => setSearchSerialNumber(event.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Search by serial number"
              />
            </div>
          )}
          {searchMode === 'dealer_code' && (
            <div>
              <label htmlFor="search_dealer" className="block text-sm font-medium text-slate-700 mb-1">
                Dealer Code
              </label>
              <input
                id="search_dealer"
                type="text"
                value={searchDealerCode}
                onChange={(event) => setSearchDealerCode(event.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Search by dealer code"
              />
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleClearSearch}
              disabled={!hasSearchFilters}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-md font-semibold transition-colors border ${
                hasSearchFilters
                  ? 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600">Loading vehicles...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && vehicles.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600">
            {hasSearchFilters
              ? 'No vehicles found matching your search criteria.'
              : 'No vehicles found. Add a vehicle to get started.'}
          </p>
        </div>
      )}

      {/* Vehicles Table */}
      {!isLoading && vehicles.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Dealer Code
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                      Dealer Name
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                      Dealer Address
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden xl:table-cell">
                      Dealer City
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden xl:table-cell">
                      Dealer State
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Model Name
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                      Model ID
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                      Battery Power
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                  {currentVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {vehicle.id}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {vehicle.serial_number}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {vehicle.dealer_code}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900 hidden md:table-cell">
                        {vehicle.dealer_name || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900 hidden lg:table-cell max-w-xs truncate" title={vehicle.dealer_address || ''}>
                        {vehicle.dealer_address || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900 hidden xl:table-cell">
                        {vehicle.dealer_city || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900 hidden xl:table-cell">
                        {vehicle.dealer_state || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {vehicle.model_name}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900 hidden lg:table-cell">
                        {vehicle.model_id || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-slate-900 hidden lg:table-cell">
                        {vehicle.battery_power || '-'}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
                        {vehicle.status === 'sold' ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                            Sold
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end">
                          <ActionMenu
                            vehicleId={vehicle.id}
                            items={[
                              {
                                label: 'Edit',
                                onClick: () => setEditingVehicle(vehicle),
                                disabled: vehicle.status === 'sold',
                                className: 'text-blue-600 hover:bg-blue-50',
                                icon: (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                ),
                              },
                              {
                                label: 'Mark as Sold',
                                onClick: () => handleMarkAsSold(vehicle),
                                disabled: vehicle.status === 'sold',
                                className: 'text-green-600 hover:bg-green-50',
                                icon: (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                ),
                              },
                              {
                                label: 'Delete',
                                onClick: () =>
                                  setDeletingVehicle({
                                    id: vehicle.id,
                                    serialNumber: vehicle.serial_number,
                                  }),
                                className: 'text-red-600 hover:bg-red-50',
                                icon: (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                ),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-slate-50 px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200">
                <div className="text-sm text-slate-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, vehicles.length)} of{' '}
                  {vehicles.length} vehicles
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </section>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVehicle && (
        <DeleteConfirmationModal
          isOpen={true}
          vehicleId={deletingVehicle.id}
          serialNumber={deletingVehicle.serialNumber}
          onConfirm={handleDelete}
          onCancel={() => setDeletingVehicle(null)}
        />
      )}
    </div>
  );
};
