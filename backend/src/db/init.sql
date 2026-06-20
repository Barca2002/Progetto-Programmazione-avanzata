
-- Abilita l'estensione PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;


DROP TABLE IF EXISTS geofence_imbarcazioni;
DROP TABLE IF EXISTS user_imbarcazioni;
DROP TABLE IF EXISTS geofence_areas;
DROP TABLE IF EXISTS imbarcazioni;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
--  TABELLA: users
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id    INT GENERATED ALWAYS AS IDENTITY,
    username   VARCHAR(50)  NOT NULL,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    is_admin   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_email_key    UNIQUE (email)
);

-- ------------------------------------------------------------
--  TABELLA: imbarcazioni
-- ------------------------------------------------------------
CREATE TABLE imbarcazioni (
    mmsi       INT          PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    type       VARCHAR(50)  NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT imbarcazioni_name_key UNIQUE (name)
);

-- ------------------------------------------------------------
--  TABELLA: geofence_areas
-- ------------------------------------------------------------
CREATE TABLE geofence_areas (
    geoarea_id INT GENERATED ALWAYS AS IDENTITY,
    name       VARCHAR(255)         NOT NULL,
    area       GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (geoarea_id),
    CONSTRAINT geoarea_name_key UNIQUE (name)
);

-- ------------------------------------------------------------
--  TABELLA: user_imbarcazioni
-- ------------------------------------------------------------
CREATE TABLE user_imbarcazioni (
    user_id INT NOT NULL,
    mmsi    INT NOT NULL,

    PRIMARY KEY (user_id, mmsi),
    CONSTRAINT fk_ui_user FOREIGN KEY (user_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    CONSTRAINT fk_ui_mmsi FOREIGN KEY (mmsi)    REFERENCES imbarcazioni(mmsi)   ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  TABELLA: geofence_imbarcazioni 
-- ------------------------------------------------------------
CREATE TABLE geofence_imbarcazioni (
    geoarea_id INT NOT NULL,
    mmsi       INT NOT NULL,

    PRIMARY KEY (geoarea_id, mmsi),
    CONSTRAINT fk_gi_area FOREIGN KEY (geoarea_id) REFERENCES geofence_areas(geoarea_id) ON DELETE CASCADE,
    CONSTRAINT fk_gi_mmsi FOREIGN KEY (mmsi)       REFERENCES imbarcazioni(mmsi)         ON DELETE CASCADE
);

-- ============================================================
--  SEEDING
-- ============================================================

INSERT INTO users (username, email, password, is_admin) VALUES
('admin1', 'admin1@mail.com', '$2a$12$2bDNGhP/5n6QaX0.Wqck8uq6bl6t4YLoRDxL5gp4fcNF6Kb/iMVoW', TRUE),  -- password: Admin123
('admin2', 'admin2@mail.com', '$2a$12$NpQxcovOve2mXsqywHW2MeW.hK0MgOqbCUSzM4jb4Gdo4LtUfz.Ji', TRUE),  -- password: Admin234
('user1',  'user1@mail.com',  '$2a$12$p9iYrTGX7ZXNDrliMdpsZuK7sHXmQSeAXFZw6Y7OVLZj4fLSRwdkC', FALSE), -- password: User1234
('user2',  'user2@mail.com',  '$2a$12$JZqS1wa2UpFVRxXemEKWC.l6q6oULEg7DAVmD7kiPqRrGfgjj37uG', FALSE), -- password: User2345
('user3',  'user3@mail.com',  '$2a$12$2LeoNCaTB6wUlgsf.uegCeYcWWSjJxNKLD1JfdvrdZ5Um7tYVBKkO', FALSE); -- password: User3456

-- ------------------------------------------------------------
--  imbarcazioni
-- ------------------------------------------------------------
INSERT INTO imbarcazioni (mmsi, name, type) VALUES
(247123456, 'Adriatica Uno',    'cargo'),
(247234567, 'Conero Explorer',  'ferry'),
(247345678, 'San Ciriaco',      'tanker'),
(215456789, 'Marche Star',      'container'),
(247567890, 'Riviera Blu',      'yacht'),
(247789012, 'Don Bosco II',     'fishing'),
(247890123, 'Bora Bora',        'sailing_yacht'),
(247901234, 'Eurocargo Ancona', 'ro_ro'),
(247012345, 'Falco Marino',     'coast_guard'),
(247112233, 'Medusa',           'research');

-- ------------------------------------------------------------
--  geofence_areas
-- ------------------------------------------------------------
INSERT INTO geofence_areas (name, area) VALUES

('Zona Marittima Nord Ancona', ST_GeomFromText('POLYGON((
  13.4700 43.7000,
  13.5500 43.7000,
  13.5600 43.6700,
  13.4900 43.6600,
  13.4700 43.7000
))', 4326)),

('Zona Marittima Est Porto', ST_GeomFromText('POLYGON((
  13.5600 43.6600,
  13.6400 43.6600,
  13.6500 43.6300,
  13.5800 43.6200,
  13.5600 43.6600
))', 4326)),

('Area Offshore Conero Nord', ST_GeomFromText('POLYGON((
  13.6200 43.6000,
  13.7000 43.6000,
  13.7100 43.5600,
  13.6400 43.5500,
  13.6200 43.6000
))', 4326)),

('Area Offshore Portonovo', ST_GeomFromText('POLYGON((
  13.6500 43.5600,
  13.7300 43.5600,
  13.7400 43.5200,
  13.6700 43.5100,
  13.6500 43.5600
))', 4326)),

('Area Offshore Sirolo', ST_GeomFromText('POLYGON((
  13.6800 43.5200,
  13.7600 43.5200,
  13.7700 43.4800,
  13.7000 43.4700,
  13.6800 43.5200
))', 4326)),

('Area Offshore Numana', ST_GeomFromText('POLYGON((
  13.7000 43.4700,
  13.7900 43.4700,
  13.8000 43.4300,
  13.7200 43.4200,
  13.7000 43.4700
))', 4326)),

('Adriatico Centrale 1', ST_GeomFromText('POLYGON((
  13.8000 43.6500,
  13.9500 43.6500,
  13.9500 43.5000,
  13.8000 43.5000,
  13.8000 43.6500
))', 4326)),

('Adriatico Centrale 2', ST_GeomFromText('POLYGON((
  13.8500 43.4800,
  14.0000 43.4800,
  14.0000 43.3500,
  13.8500 43.3500,
  13.8500 43.4800
))', 4326));


INSERT INTO user_imbarcazioni (user_id, mmsi) VALUES
(1, 247901234),  -- admin1  -> Eurocargo Ancona
(2, 247012345),  -- admin2  -> Falco Marino
(3, 247123456),  -- user1   -> Adriatica Uno
(3, 247234567),  -- user1   -> Conero Explorer
(3, 247567890),  -- user1   -> Riviera Blu
(4, 247345678),  -- user2   -> San Ciriaco
(4, 215456789),  -- user2   -> Marche Star
(5, 247789012),  -- user3   -> Don Bosco II
(5, 247890123),  -- user3   -> Bora Bora
(5, 247112233);  -- user3   -> Medusa


INSERT INTO geofence_imbarcazioni (geoarea_id, mmsi) VALUES
-- Zona Marittima Nord Ancona (id=1)
(1, 247123456),  -- Adriatica Uno
(1, 247234567),  -- Conero Explorer
(1, 247901234),  -- Eurocargo Ancona

-- Zona Marittima Est Porto (id=2)
(2, 247345678),  -- San Ciriaco
(2, 215456789),  -- Marche Star
(2, 247012345),  -- Falco Marino

-- Area Offshore Conero Nord (id=3)
(3, 247567890),  -- Riviera Blu
(3, 247890123),  -- Bora Bora

-- Area Offshore Portonovo (id=4)
(4, 247789012),  -- Don Bosco II
(4, 247890123),  -- Bora Bora
(4, 247112233),  -- Medusa

-- Area Offshore Sirolo (id=5)
(5, 247567890),  -- Riviera Blu
(5, 247112233),  -- Medusa

-- Area Offshore Numana (id=6)
(6, 247789012),  -- Don Bosco II
(6, 247112233),  -- Medusa

-- Adriatico Centrale 1 (id=7)
(7, 247123456),  -- Adriatica Uno
(7, 247345678),  -- San Ciriaco
(7, 215456789),  -- Marche Star
(7, 247901234),  -- Eurocargo Ancona

-- Adriatico Centrale 2 (id=8)
(8, 247123456),  -- Adriatica Uno
(8, 215456789),  -- Marche Star
(8, 247901234);  -- Eurocargo Ancona
