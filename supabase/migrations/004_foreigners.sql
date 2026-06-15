CREATE TABLE IF NOT EXISTS foreigners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) DEFAULT '',
  mother_name VARCHAR(255) DEFAULT '',
  national_id VARCHAR(50) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  address TEXT NOT NULL,
  sector VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  phone VARCHAR(50) DEFAULT '',
  profession VARCHAR(255) DEFAULT '',
  marital_status VARCHAR(20) DEFAULT 'single' CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  nationality VARCHAR(100) NOT NULL DEFAULT '',
  id_front_image_url TEXT,
  id_back_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foreigners_national_id ON foreigners(national_id);
CREATE INDEX IF NOT EXISTS idx_foreigners_sector ON foreigners(sector);
CREATE INDEX IF NOT EXISTS idx_foreigners_created_at ON foreigners(created_at);
CREATE INDEX IF NOT EXISTS idx_foreigners_last_name ON foreigners(last_name);

ALTER TABLE foreigners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read foreigners"
  ON foreigners FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert foreigners"
  ON foreigners FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update foreigners"
  ON foreigners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete foreigners"
  ON foreigners FOR DELETE TO authenticated USING (true);

-- 8 seed records
INSERT INTO foreigners (first_name, last_name, father_name, mother_name, national_id, birth_date, address, sector, gender, phone, profession, marital_status, nationality) VALUES
('Marie', 'Dubois', 'Jean Dubois', 'Sophie Martin', 'PA001001', '1985-03-15', '12 Rue des Oliviers, Résidence Al Amal', 'Agadir Ville', 'female', '+212612345601', 'Enseignante', 'married', 'Française'),
('Carlos', 'García López', 'Manuel García', 'Isabel López', 'PA001002', '1990-07-22', '45 Avenue Hassan II, Immeuble Tafoukt', 'Talborjt', 'male', '+212612345602', 'Chef de projet', 'single', 'Espagnole'),
('Giuseppe', 'Rossi', 'Antonio Rossi', 'Maria Bianchi', 'PA001003', '1982-11-08', '8 Boulevard Mohammed V', 'Charaf', 'male', '+212612345603', 'Restaurateur', 'married', 'Italienne'),
('Hans', 'Schmidt', 'Klaus Schmidt', 'Ingrid Weber', 'PA001004', '1978-05-30', '23 Rue de la Plage, Founty', 'Anza', 'male', '+212612345604', 'Ingénieur', 'divorced', 'Allemande'),
('Sarah', 'Johnson', 'Robert Johnson', 'Elizabeth Taylor', 'PA001005', '1995-09-14', '67 Rue Tassila, Résidence Saada', 'Inezgane', 'female', '+212612345605', 'Consultante', 'single', 'Britannique'),
('Fatima', 'Ben Ali', 'Ahmed Ben Ali', 'Amina Mansouri', 'PA001006', '1988-01-25', '15 Avenue des FAR, Appt 4', 'Aït Melloul', 'female', '+212612345606', 'Médecin', 'married', 'Tunisienne'),
('Yuri', 'Petrov', 'Ivan Petrov', 'Olga Sokolova', 'PA001007', '1975-12-03', '34 Rue Ouarzazate, Villa Jasmine', 'Dakhla', 'male', '+212612345607', 'Architecte', 'widowed', 'Russe'),
('Amélie', 'Lefèvre', 'Pierre Lefèvre', 'Catherine Moreau', 'PA001008', '1992-06-18', '9 Avenue Général Kettani', 'Hay Salam', 'female', '+212612345608', 'Journaliste', 'single', 'Belge');
