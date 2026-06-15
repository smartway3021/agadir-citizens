-- Create citizens table
CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(50) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  address TEXT NOT NULL,
  sector VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  id_front_image_url TEXT,
  id_back_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_citizens_national_id ON citizens(national_id);
CREATE INDEX IF NOT EXISTS idx_citizens_sector ON citizens(sector);
CREATE INDEX IF NOT EXISTS idx_citizens_created_at ON citizens(created_at);
CREATE INDEX IF NOT EXISTS idx_citizens_last_name ON citizens(last_name);

-- Enable Row Level Security
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;

-- Policy: only authenticated users can read
CREATE POLICY "Authenticated users can read citizens"
  ON citizens FOR SELECT
  TO authenticated
  USING (true);

-- Policy: only authenticated users can insert
CREATE POLICY "Authenticated users can insert citizens"
  ON citizens FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: only authenticated users can update
CREATE POLICY "Authenticated users can update citizens"
  ON citizens FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: only authenticated users can delete
CREATE POLICY "Authenticated users can delete citizens"
  ON citizens FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for citizen images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('citizen-images', 'citizen-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'citizen-images');

-- Storage policy: allow public to view images
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'citizen-images');
