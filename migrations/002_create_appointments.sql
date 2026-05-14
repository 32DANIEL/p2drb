CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_doctor UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  datetime TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'done')),
  reason VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_id_user ON appointments(id_user);
CREATE INDEX IF NOT EXISTS idx_appointments_id_doctor ON appointments(id_doctor);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(datetime);
