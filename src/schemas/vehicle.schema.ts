import { z } from 'zod';

/**
 * Zod schema for vehicle form validation
 * Required fields: serial_number, dealer_code, model_name
 */
export const vehicleFormSchema = z.object({
  dealer_code: z.string().min(1, 'Dealer code is required'),
  dealer_name: z.string(),
  dealer_address: z.string(),
  dealer_city: z.string(),
  dealer_state: z.string(),
  model_name: z.string().min(1, 'Model name is required'),
  model_id: z.string(),
  battery_power: z.string(),
  serial_number: z.string().min(1, 'Serial number is required'),
});

/**
 * Type inference from Zod schema
 */
export type VehicleFormSchema = z.infer<typeof vehicleFormSchema>;
