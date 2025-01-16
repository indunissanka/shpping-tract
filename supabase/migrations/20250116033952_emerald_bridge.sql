/*
      # Initial Schema Setup

      1. New Tables
        - `users` table for authentication (handled by Supabase Auth)
        - `orders` table for storing order information
          - `id` (uuid, primary key)
          - `company_name` (text)
          - `pi_number` (text)
          - `etd` (date)
          - `eta` (date)
          - `payment_terms` (text)
          - `user_id` (uuid, references auth.users)
          - `created_at` (timestamp with time zone)

      2. Security
        - Enable RLS on `orders` table
        - Add policies for users to manage their own orders
    */

    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_name text NOT NULL,
      pi_number text NOT NULL,
      etd date NOT NULL,
      eta date NOT NULL,
      payment_terms text NOT NULL,
      user_id uuid REFERENCES auth.users(id) NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their own orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own orders"
      ON orders
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
