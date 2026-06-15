-- Add new columns to citizens table
ALTER TABLE citizens 
  ADD COLUMN IF NOT EXISTS father_name VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '',
  ADD COLUMN IF NOT EXISTS profession VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20) DEFAULT 'single' CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) DEFAULT 'Marocaine';

-- Ensure sector column exists (in case city→sector wasn't run)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='city') THEN
    ALTER TABLE citizens RENAME COLUMN city TO sector;
  END IF;
END $$;
