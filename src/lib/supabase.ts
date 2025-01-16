import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please connect to Supabase using the "Connect to Supabase" button.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const OrderSchema = z.object({
  company_name: z.string().min(1),
  pi_number: z.string().min(1),
  etd: z.string(),
  eta: z.string(),
  payment_terms: z.enum(['T/T', 'DA', 'DP', 'LC', 'LC/T/T']),
});

export type Order = z.infer<typeof OrderSchema>;
