-- Table des paramètres du cabinet
CREATE TABLE IF NOT EXISTS cabinet_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cabinet_name VARCHAR(255),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    logo_url TEXT,
    notification_enabled BOOLEAN DEFAULT true,
    reminder_days_before INTEGER DEFAULT 1,
    allow_online_booking BOOLEAN DEFAULT true,
    slot_duration_default INTEGER DEFAULT 60, -- durée par défaut des créneaux en minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les paramètres par défaut
INSERT INTO cabinet_settings (cabinet_name, contact_email, contact_phone, address)
VALUES (
    'Cabinet de Thérapie Sensorimotrice KOK',
    'contact@therapie-sensorimotrice.fr',
    '+33 1 23 45 67 89',
    '123 Rue de la Santé, 75014 Paris'
) ON CONFLICT DO NOTHING;

-- Trigger pour updated_at
CREATE TRIGGER update_cabinet_settings_updated_at BEFORE UPDATE ON cabinet_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaire pour documentation
COMMENT ON TABLE cabinet_settings IS 'Paramètres et configuration du cabinet';
