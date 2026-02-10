/**
 * Type definition for vehicle form data
 */
export interface VehicleFormData {
  dealer_code: string;
  dealer_name: string;
  dealer_address: string;
  dealer_city: string;
  dealer_state: string;
  model_name: string;
  model_id: string;
  battery_power: string;
  serial_number: string;
}

/**
 * Type definition for vehicle with ID (from API)
 */
export interface Vehicle extends VehicleFormData {
  id: number;
  status?: string; // Vehicle status: "sold" or "available"
}

/**
 * Type definition for API response
 */
export interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Type definition for vehicle list API response
 */
export interface VehicleListResponse {
  vehicles?: Vehicle[];
  vehicle?: Vehicle;
  error?: string;
}
