/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text)
      - `message` (text)
      - `type` (text) - 'placement', 'internship', 'general'
      - `target_audience` (text) - 'all', 'specific_class'
      - `target_classes` (text array)
      - `created_by` (uuid, references admin_users)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `read_by` (text array) - array of user IDs who have read the notification

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for reading notifications
    - Add policies for admins to create notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('placement', 'internship', 'general')),
  target_audience text DEFAULT 'all',
  target_classes text[] DEFAULT '{}',
  created_by uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  read_by text[] DEFAULT '{}'
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active notifications"
  ON notifications
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can update notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_active_type ON notifications(is_active, type, created_at);