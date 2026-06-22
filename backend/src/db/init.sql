-- Abilita l'estensione PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS violazioni;
DROP TABLE IF EXISTS dati_inviati;      
DROP TABLE IF EXISTS segnalazioni;
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
    mmsi          INT          PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    type          VARCHAR(50)  NOT NULL,
    descr          VARCHAR(255) NOT NULL,
    max_capacity  INT          NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT imbarcazioni_name_key UNIQUE (name)
);

-- ------------------------------------------------------------
--  TABELLA: geofence_areas
-- ------------------------------------------------------------
CREATE TABLE geofence_areas (
    geoarea_id INT GENERATED ALWAYS AS IDENTITY,
    name       VARCHAR(255)            NOT NULL,
    area       GEOMETRY(Polygon, 4326) NOT NULL,
    max_speed  INT NULL, -- La velocità max è opzionale  
    created_at TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    CONSTRAINT fk_ui_user FOREIGN KEY (user_id) REFERENCES users(user_id)      ON DELETE CASCADE,
    CONSTRAINT fk_ui_mmsi FOREIGN KEY (mmsi)    REFERENCES imbarcazioni(mmsi)  ON DELETE CASCADE,
    CONSTRAINT unique_mmsi UNIQUE (mmsi)
);

-- ------------------------------------------------------------
--  TABELLA: geofence_imbarcazioni
-- ------------------------------------------------------------
CREATE TABLE geofence_imbarcazioni (
    geoarea_id INT     NOT NULL,
    mmsi       INT     NOT NULL,
    is_in      BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (geoarea_id, mmsi),
    CONSTRAINT fk_gi_area FOREIGN KEY (geoarea_id) REFERENCES geofence_areas(geoarea_id) ON DELETE CASCADE,
    CONSTRAINT fk_gi_mmsi FOREIGN KEY (mmsi)       REFERENCES imbarcazioni(mmsi)         ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  TABELLA: segnalazioni
-- Una segnazione avviene quando entro due giorni da una violazione, se ne verificano in totale 5. Però, se una violazione successiva avviene entro un'ora dalla precedente, essa non viene conteggiata.
-- ------------------------------------------------------------
CREATE TABLE segnalazioni (
    id    INT GENERATED ALWAYS AS IDENTITY,
    mmsi               INT          NOT NULL,
    geoarea_id         INT          NOT NULL,
    stato              VARCHAR(10)  NOT NULL DEFAULT 'IN CORSO',
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_seg_mmsi    FOREIGN KEY (mmsi)       REFERENCES imbarcazioni(mmsi)         ON DELETE CASCADE,
    CONSTRAINT fk_seg_geoarea FOREIGN KEY (geoarea_id) REFERENCES geofence_areas(geoarea_id) ON DELETE CASCADE,
    CONSTRAINT chk_stato      CHECK (stato IN ('IN CORSO', 'RIENTRATA'))
);

-- ------------------------------------------------------------
--  TABELLA: violazioni
-- Se un'imbarcazione commette 5 violazioni in un arco di 2 giorni in una certa geoarea, verrà emessa una segnalazione.
-- Però se dalla prima violazione viene commessa un'altra entro 1h, essa non viene conteggiata. 
-- ------------------------------------------------------------
CREATE TABLE violazioni (
    id    INT GENERATED ALWAYS AS IDENTITY,
    tipo  VARCHAR(255)          NOT NULL,
    mmsi               INT          NOT NULL,
    geoarea_id         INT          NOT NULL,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_viol_mmsi    FOREIGN KEY (mmsi)       REFERENCES imbarcazioni(mmsi)         ON DELETE CASCADE,
    CONSTRAINT fk_viol_geoarea FOREIGN KEY (geoarea_id) REFERENCES geofence_areas(geoarea_id) ON DELETE CASCADE,
    CONSTRAINT chk_tipo     CHECK (tipo IN ('ECCESSO VELOCITA', 'ACCESSO AREA NON AUTORIZZATA'))
);

-- ------------------------------------------------------------
--  TABELLA: dati_inviati
-- ------------------------------------------------------------

CREATE TABLE dati_inviati (
    id        INT GENERATED ALWAYS AS IDENTITY,
    mmsi           INT             NOT NULL,
    latitudine     DECIMAL(9,6)    NOT NULL,
    longitudine    DECIMAL(9,6)    NOT NULL,
    velocita_kmh   DECIMAL(6,2)    NOT NULL,
    timestamp      BIGINT          NOT NULL, -- Formato linux epoch
    stato          VARCHAR(15)     NOT NULL,
    
    PRIMARY KEY (id),
    CONSTRAINT fk_dati_mmsi FOREIGN KEY (mmsi) REFERENCES imbarcazioni(mmsi) ON DELETE CASCADE,
    CONSTRAINT chk_stato_dati CHECK (stato IN ('IN NAVIGAZIONE', 'IN PESCA', 'STAZIONARIO'))
);

-- ============================================================
--  SEEDING
-- ============================================================

-- ------------------------------------------------------------
--  users
-- ------------------------------------------------------------
INSERT INTO users (username, email, password, is_admin) VALUES
('admin1', 'admin1@mail.com', '$2a$12$2bDNGhP/5n6QaX0.Wqck8uq6bl6t4YLoRDxL5gp4fcNF6Kb/iMVoW', TRUE),   -- password: Admin123
('admin2', 'admin2@mail.com', '$2a$12$NpQxcovOve2mXsqywHW2MeW.hK0MgOqbCUSzM4jb4Gdo4LtUfz.Ji', TRUE),   -- password: Admin234
('user1',  'user1@mail.com',  '$2a$12$p9iYrTGX7ZXNDrliMdpsZuK7sHXmQSeAXFZw6Y7OVLZj4fLSRwdkC', FALSE),  -- password: User1234
('user2',  'user2@mail.com',  '$2a$12$JZqS1wa2UpFVRxXemEKWC.l6q6oULEg7DAVmD7kiPqRrGfgjj37uG', FALSE),  -- password: User2345
('user3',  'user3@mail.com',  '$2a$12$2LeoNCaTB6wUlgsf.uegCeYcWWSjJxNKLD1JfdvrdZ5Um7tYVBKkO', FALSE),  -- password: User3456
('user4',  'user4@mail.com',  '$2a$12$2bDNGhP/5n6QaX0.Wqck8uq6bl6t4YLoRDxL5gp4fcNF6Kb/iMVoW', FALSE),  -- password: Admin123
('user5',  'user5@mail.com',  '$2a$12$NpQxcovOve2mXsqywHW2MeW.hK0MgOqbCUSzM4jb4Gdo4LtUfz.Ji', FALSE),  -- password: Admin234
('user6',  'user6@mail.com',  '$2a$12$p9iYrTGX7ZXNDrliMdpsZuK7sHXmQSeAXFZw6Y7OVLZj4fLSRwdkC', FALSE),  -- password: User1234
('user7',  'user7@mail.com',  '$2a$12$JZqS1wa2UpFVRxXemEKWC.l6q6oULEg7DAVmD7kiPqRrGfgjj37uG', FALSE),  -- password: User2345
('user8',  'user8@mail.com',  '$2a$12$2LeoNCaTB6wUlgsf.uegCeYcWWSjJxNKLD1JfdvrdZ5Um7tYVBKkO', FALSE);  -- password: User3456

-- ------------------------------------------------------------
--  imbarcazioni
-- ------------------------------------------------------------
INSERT INTO imbarcazioni (mmsi, name, type, descr, max_capacity) VALUES
(247123456, 'Adriatica Uno',      'cargo',         'Cargo multipurpose per merci varie',             1800),
(247234567, 'Conero Explorer',    'ferry',         'Traghetto passeggeri costiero',                  850),
(247345678, 'San Ciriaco',        'tanker',        'Petroliera per trasporto carburanti',           12000),
(215456789, 'Marche Star',        'container',     'Portacontainer regionale',                       3500),
(247567890, 'Riviera Blu',        'yacht',         'Yacht privato di lusso',                           12),
(247789012, 'Don Bosco II',       'fishing',       'Peschereccio per pesca d’altura',                 35),
(247890123, 'Bora Bora',          'sailing_yacht', 'Yacht a vela per crociere',                        10),
(247901234, 'Eurocargo Ancona',   'ro_ro',         'Nave Ro-Ro per veicoli e rimorchi',             2500),
(247012345, 'Falco Marino',       'coast_guard',   'Motovedetta per pattugliamento',                  25),
(247112233, 'Medusa',             'research',      'Nave per ricerca oceanografica',                  40),
(247113344, 'Stella del Mare',    'cargo',         'Cargo costiero per merci secche',              1500),
(247114455, 'Vento di Levante',   'ferry',         'Traghetto per collegamenti regionali',           650),
(247115566, 'Porto Recanati',     'tanker',        'Cisterna per prodotti chimici',                 8500),
(247116677, 'Sirena Adriatica',   'yacht',         'Yacht da diporto moderno',                         14),
(247117788, 'Orizzonte Blu',      'fishing',       'Peschereccio per pesca costiera',                 22),
(247118899, 'Punta Trave',        'sailing_yacht', 'Imbarcazione a vela da regata',                    8),
(247119900, 'Mare Nostrum',       'container',     'Portacontainer per rotte adriatiche',          4200),
(247120011, 'Costa Conero',       'ro_ro',         'Trasporto veicoli e mezzi pesanti',            1800),
(247121122, 'Albatros Due',       'coast_guard',   'Unità di soccorso marittimo',                     18),
(247122233, 'Tritone',            'research',      'Nave per monitoraggio ambientale',                30);

-- ------------------------------------------------------------
--  geofence_areas
-- ------------------------------------------------------------
INSERT INTO geofence_areas (name, area, max_speed) VALUES

('Zona Marittima Nord Ancona', ST_GeomFromText('POLYGON((
  13.4700 43.7000,
  13.5500 43.7000,
  13.5600 43.6700,
  13.4900 43.6600,
  13.4700 43.7000
))', 4326), 20),

('Zona Marittima Est Porto', ST_GeomFromText('POLYGON((
  13.5600 43.6600,
  13.6400 43.6600,
  13.6500 43.6300,
  13.5800 43.6200,
  13.5600 43.6600
))', 4326), 20),

('Area Offshore Conero Nord', ST_GeomFromText('POLYGON((
  13.6200 43.6000,
  13.7000 43.6000,
  13.7100 43.5600,
  13.6400 43.5500,
  13.6200 43.6000
))', 4326), 50),

('Area Offshore Portonovo', ST_GeomFromText('POLYGON((
  13.6500 43.5600,
  13.7300 43.5600,
  13.7400 43.5200,
  13.6700 43.5100,
  13.6500 43.5600
))', 4326), 50),

('Area Offshore Sirolo', ST_GeomFromText('POLYGON((
  13.6800 43.5200,
  13.7600 43.5200,
  13.7700 43.4800,
  13.7000 43.4700,
  13.6800 43.5200
))', 4326), 50),

('Area Offshore Numana', ST_GeomFromText('POLYGON((
  13.7000 43.4700,
  13.7900 43.4700,
  13.8000 43.4300,
  13.7200 43.4200,
  13.7000 43.4700
))', 4326), 50),

('Adriatico Centrale 1', ST_GeomFromText('POLYGON((
  13.8000 43.6500,
  13.9500 43.6500,
  13.9500 43.5000,
  13.8000 43.5000,
  13.8000 43.6500
))', 4326), NULL),

('Adriatico Centrale 2', ST_GeomFromText('POLYGON((
  13.8500 43.4800,
  14.0000 43.4800,
  14.0000 43.3500,
  13.8500 43.3500,
  13.8500 43.4800
))', 4326), NULL),

('Canale di Fano', ST_GeomFromText('POLYGON((
  13.8000 43.8500,
  13.9500 43.8500,
  13.9500 43.7500,
  13.8000 43.7500,
  13.8000 43.8500
))', 4326), NULL),

('Acque Territoriali Pesaro', ST_GeomFromText('POLYGON((
  12.8000 43.9500,
  13.0000 43.9500,
  13.0000 43.8500,
  12.8000 43.8500,
  12.8000 43.9500
))', 4326), NULL);

-- ------------------------------------------------------------
--  user_imbarcazioni
-- ------------------------------------------------------------
INSERT INTO user_imbarcazioni (user_id, mmsi) VALUES
(1,  247901234),  -- admin1  -> Eurocargo Ancona
(2,  247012345),  -- admin2  -> Falco Marino
(3,  247123456),  -- user1   -> Adriatica Uno
(3,  247234567),  -- user1   -> Conero Explorer
(3,  247567890),  -- user1   -> Riviera Blu
(4,  247345678),  -- user2   -> San Ciriaco
(4,  215456789),  -- user2   -> Marche Star
(5,  247789012),  -- user3   -> Don Bosco II
(5,  247890123),  -- user3   -> Bora Bora
(5,  247112233),  -- user3   -> Medusa
(6,  247113344),  -- user4   -> Stella del Mare
(6,  247114455),  -- user4   -> Vento di Levante
(7,  247115566),  -- user5   -> Porto Recanati
(7,  247116677),  -- user5   -> Sirena Adriatica
(8,  247117788),  -- user6   -> Orizzonte Blu
(8,  247118899),  -- user6   -> Punta Trave
(9,  247119900),  -- user7   -> Mare Nostrum
(9,  247120011),  -- user7   -> Costa Conero
(10, 247121122),  -- user8   -> Albatros Due
(10, 247122233);  -- user8   -> Tritone

-- ------------------------------------------------------------
--  geofence_imbarcazioni
-- ------------------------------------------------------------
INSERT INTO geofence_imbarcazioni (geoarea_id, mmsi) VALUES
-- Zona Marittima Nord Ancona (id=1)
(1, 247123456),  -- Adriatica Uno
(1, 247234567),  -- Conero Explorer
(1, 247901234),  -- Eurocargo Ancona
(1, 247113344),  -- Stella del Mare
(1, 247119900),  -- Mare Nostrum

-- Zona Marittima Est Porto (id=2)
(2, 247345678),  -- San Ciriaco
(2, 215456789),  -- Marche Star
(2, 247012345),  -- Falco Marino
(2, 247114455),  -- Vento di Levante
(2, 247120011),  -- Costa Conero

-- Area Offshore Conero Nord (id=3)
(3, 247567890),  -- Riviera Blu
(3, 247890123),  -- Bora Bora
(3, 247116677),  -- Sirena Adriatica
(3, 247118899),  -- Punta Trave

-- Area Offshore Portonovo (id=4)
(4, 247789012),  -- Don Bosco II
(4, 247890123),  -- Bora Bora
(4, 247112233),  -- Medusa
(4, 247117788),  -- Orizzonte Blu

-- Area Offshore Sirolo (id=5)
(5, 247567890),  -- Riviera Blu
(5, 247112233),  -- Medusa
(5, 247115566),  -- Porto Recanati
(5, 247122233),  -- Tritone

-- Area Offshore Numana (id=6)
(6, 247789012),  -- Don Bosco II
(6, 247112233),  -- Medusa
(6, 247121122),  -- Albatros Due

-- Adriatico Centrale 1 (id=7)
(7, 247123456),  -- Adriatica Uno
(7, 247345678),  -- San Ciriaco
(7, 215456789),  -- Marche Star
(7, 247901234),  -- Eurocargo Ancona
(7, 247113344),  -- Stella del Mare

-- Adriatico Centrale 2 (id=8)
(8, 247123456),  -- Adriatica Uno
(8, 215456789),  -- Marche Star
(8, 247901234),  -- Eurocargo Ancona
(8, 247119900),  -- Mare Nostrum

-- Canale di Fano (id=9)
(9, 247114455),  -- Vento di Levante
(9, 247117788),  -- Orizzonte Blu
(9, 247120011),  -- Costa Conero

-- Acque Territoriali Pesaro (id=10)
(10, 247115566), -- Porto Recanati
(10, 247118899), -- Punta Trave
(10, 247122233); -- Tritone

-- ------------------------------------------------------------
--  segnalazioni
-- DA RIVEDERE
-- ------------------------------------------------------------
INSERT INTO segnalazioni (mmsi, geoarea_id, stato, created_at) VALUES
(247123456, 1, 'RIENTRATA',  '2025-01-10 08:15:00'),  -- Adriatica Uno      in Zona Nord Ancona
(247234567, 1, 'IN CORSO',   '2025-01-15 10:30:00'),  -- Conero Explorer    in Zona Nord Ancona
(247345678, 2, 'RIENTRATA',  '2025-01-20 14:00:00'),  -- San Ciriaco        in Zona Est Porto
(215456789, 2, 'IN CORSO',   '2025-02-01 09:00:00'),  -- Marche Star        in Zona Est Porto
(247567890, 3, 'RIENTRATA',  '2025-02-05 16:45:00'),  -- Riviera Blu        in Offshore Conero Nord
(247890123, 3, 'IN CORSO',   '2025-02-10 11:20:00'),  -- Bora Bora          in Offshore Conero Nord
(247789012, 4, 'RIENTRATA',  '2025-02-14 07:30:00'),  -- Don Bosco II       in Offshore Portonovo
(247112233, 4, 'IN CORSO',   '2025-02-20 13:00:00'),  -- Medusa             in Offshore Portonovo
(247567890, 5, 'RIENTRATA',  '2025-03-01 09:15:00'),  -- Riviera Blu        in Offshore Sirolo
(247112233, 5, 'IN CORSO',   '2025-03-05 15:00:00'),  -- Medusa             in Offshore Sirolo
(247789012, 6, 'RIENTRATA',  '2025-03-10 08:00:00'),  -- Don Bosco II       in Offshore Numana
(247112233, 6, 'IN CORSO',   '2025-03-15 12:30:00'),  -- Medusa             in Offshore Numana
(247123456, 7, 'RIENTRATA',  '2025-03-20 10:00:00'),  -- Adriatica Uno      in Adriatico Centrale 1
(247345678, 7, 'IN CORSO',   '2025-03-25 14:45:00'),  -- San Ciriaco        in Adriatico Centrale 1
(215456789, 7, 'RIENTRATA',  '2025-04-01 09:30:00'),  -- Marche Star        in Adriatico Centrale 1
(247901234, 7, 'IN CORSO',   '2025-04-05 11:00:00'),  -- Eurocargo Ancona   in Adriatico Centrale 1
(247123456, 8, 'RIENTRATA',  '2025-04-10 08:45:00'),  -- Adriatica Uno      in Adriatico Centrale 2
(215456789, 8, 'IN CORSO',   '2025-04-15 13:15:00'),  -- Marche Star        in Adriatico Centrale 2
(247114455, 9, 'RIENTRATA',  '2025-04-20 10:30:00'),  -- Vento di Levante   in Canale di Fano
(247117788, 9, 'IN CORSO',   '2025-04-25 15:00:00'),  -- Orizzonte Blu      in Canale di Fano
(247115566, 10, 'RIENTRATA', '2025-05-01 09:00:00'),  -- Porto Recanati     in Acque Pesaro
(247118899, 10, 'IN CORSO',  '2025-05-05 11:30:00'),  -- Punta Trave        in Acque Pesaro
(247113344, 1,  'RIENTRATA', '2025-05-10 08:00:00'),  -- Stella del Mare    in Zona Nord Ancona
(247119900, 8,  'IN CORSO',  '2025-05-15 14:00:00'),  -- Mare Nostrum       in Adriatico Centrale 2
(247120011, 2,  'RIENTRATA', '2025-05-20 10:15:00');  -- Costa Conero       in Zona Est Porto

-- ------------------------------------------------------------
--  violazioni
-- DA RIVEDERE (VEDI LA CONDIZIONE DELL'ORA DOPO UNA VIOLAZIONE)
-- ------------------------------------------------------------
INSERT INTO violazioni (tipo, mmsi, geoarea_id, created_at) VALUES
('ACCESSO AREA NON AUTORIZZATA', 215456789, 2, '2025-01-30 17:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 2, '2025-01-31 05:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 2, '2025-01-31 17:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 2, '2025-01-31 17:25:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 2, '2025-02-01 03:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 2, '2025-02-01 09:00:00'),
('ECCESSO VELOCITA', 215456789, 7, '2025-03-30 17:30:00'),
('ECCESSO VELOCITA', 215456789, 7, '2025-03-31 05:30:00'),
('ECCESSO VELOCITA', 215456789, 7, '2025-03-31 17:30:00'),
('ECCESSO VELOCITA', 215456789, 7, '2025-04-01 03:30:00'),
('ECCESSO VELOCITA', 215456789, 7, '2025-04-01 09:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 8, '2025-04-13 21:15:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 8, '2025-04-14 09:15:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 8, '2025-04-14 21:15:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 8, '2025-04-15 07:15:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 8, '2025-04-15 13:15:00'),
('ACCESSO AREA NON AUTORIZZATA', 215456789, 9, '2025-06-05 07:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 4, '2025-02-18 21:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 4, '2025-02-19 09:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 4, '2025-02-19 21:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 4, '2025-02-20 07:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 4, '2025-02-20 13:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 5, '2025-03-03 23:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 5, '2025-03-04 11:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 5, '2025-03-04 23:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 5, '2025-03-04 23:25:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 5, '2025-03-05 09:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 5, '2025-03-05 15:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 6, '2025-03-13 20:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 6, '2025-03-14 08:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 6, '2025-03-14 20:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 6, '2025-03-15 06:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247112233, 6, '2025-03-15 12:30:00'),
('ECCESSO VELOCITA', 247113344, 1, '2025-05-08 16:00:00'),
('ECCESSO VELOCITA', 247113344, 1, '2025-05-09 04:00:00'),
('ECCESSO VELOCITA', 247113344, 1, '2025-05-09 16:00:00'),
('ECCESSO VELOCITA', 247113344, 1, '2025-05-10 02:00:00'),
('ECCESSO VELOCITA', 247113344, 1, '2025-05-10 08:00:00'),
('ECCESSO VELOCITA', 247114455, 9, '2025-04-18 18:30:00'),
('ECCESSO VELOCITA', 247114455, 9, '2025-04-19 06:30:00'),
('ECCESSO VELOCITA', 247114455, 9, '2025-04-19 18:30:00'),
('ECCESSO VELOCITA', 247114455, 9, '2025-04-19 18:55:00'),
('ECCESSO VELOCITA', 247114455, 9, '2025-04-20 04:30:00'),
('ECCESSO VELOCITA', 247114455, 9, '2025-04-20 10:30:00'),
('ECCESSO VELOCITA', 247115566, 10, '2025-04-29 17:00:00'),
('ECCESSO VELOCITA', 247115566, 10, '2025-04-30 05:00:00'),
('ECCESSO VELOCITA', 247115566, 10, '2025-04-30 17:00:00'),
('ECCESSO VELOCITA', 247115566, 10, '2025-05-01 03:00:00'),
('ECCESSO VELOCITA', 247115566, 10, '2025-05-01 09:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247116677, 3, '2025-06-08 16:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247116677, 3, '2025-06-08 19:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247117788, 9, '2025-04-23 23:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247117788, 9, '2025-04-24 11:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247117788, 9, '2025-04-24 23:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247117788, 9, '2025-04-25 09:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247117788, 9, '2025-04-25 15:00:00'),
('ECCESSO VELOCITA', 247117788, 9, '2025-06-12 08:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247118899, 10, '2025-05-03 19:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247118899, 10, '2025-05-04 07:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247118899, 10, '2025-05-04 19:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247118899, 10, '2025-05-04 19:55:00'),
('ACCESSO AREA NON AUTORIZZATA', 247118899, 10, '2025-05-05 05:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247118899, 10, '2025-05-05 11:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247119900, 8, '2025-05-13 22:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247119900, 8, '2025-05-14 10:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247119900, 8, '2025-05-14 22:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247119900, 8, '2025-05-15 08:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247119900, 8, '2025-05-15 14:00:00'),
('ECCESSO VELOCITA', 247120011, 2, '2025-05-18 18:15:00'),
('ECCESSO VELOCITA', 247120011, 2, '2025-05-19 06:15:00'),
('ECCESSO VELOCITA', 247120011, 2, '2025-05-19 18:15:00'),
('ECCESSO VELOCITA', 247120011, 2, '2025-05-19 18:40:00'),
('ECCESSO VELOCITA', 247120011, 2, '2025-05-20 04:15:00'),
('ECCESSO VELOCITA', 247120011, 2, '2025-05-20 10:15:00'),
('ECCESSO VELOCITA', 247121122, 6, '2025-06-10 10:00:00'),
('ECCESSO VELOCITA', 247123456, 1, '2025-01-08 16:15:00'),
('ECCESSO VELOCITA', 247123456, 1, '2025-01-09 04:15:00'),
('ECCESSO VELOCITA', 247123456, 1, '2025-01-09 16:15:00'),
('ECCESSO VELOCITA', 247123456, 1, '2025-01-09 16:40:00'),
('ECCESSO VELOCITA', 247123456, 1, '2025-01-10 02:15:00'),
('ECCESSO VELOCITA', 247123456, 1, '2025-01-10 08:15:00'),
('ECCESSO VELOCITA', 247123456, 7, '2025-03-18 18:00:00'),
('ECCESSO VELOCITA', 247123456, 7, '2025-03-19 06:00:00'),
('ECCESSO VELOCITA', 247123456, 7, '2025-03-19 18:00:00'),
('ECCESSO VELOCITA', 247123456, 7, '2025-03-19 18:25:00'),
('ECCESSO VELOCITA', 247123456, 7, '2025-03-20 04:00:00'),
('ECCESSO VELOCITA', 247123456, 7, '2025-03-20 10:00:00'),
('ECCESSO VELOCITA', 247123456, 8, '2025-04-08 16:45:00'),
('ECCESSO VELOCITA', 247123456, 8, '2025-04-09 04:45:00'),
('ECCESSO VELOCITA', 247123456, 8, '2025-04-09 16:45:00'),
('ECCESSO VELOCITA', 247123456, 8, '2025-04-10 02:45:00'),
('ECCESSO VELOCITA', 247123456, 8, '2025-04-10 08:45:00'),
('ACCESSO AREA NON AUTORIZZATA', 247234567, 1, '2025-01-13 18:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247234567, 1, '2025-01-14 06:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247234567, 1, '2025-01-14 18:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247234567, 1, '2025-01-15 04:30:00'),
('ACCESSO AREA NON AUTORIZZATA', 247234567, 1, '2025-01-15 10:30:00'),
('ECCESSO VELOCITA', 247345678, 2, '2025-01-18 22:00:00'),
('ECCESSO VELOCITA', 247345678, 2, '2025-01-19 10:00:00'),
('ECCESSO VELOCITA', 247345678, 2, '2025-01-19 22:00:00'),
('ECCESSO VELOCITA', 247345678, 2, '2025-01-20 08:00:00'),
('ECCESSO VELOCITA', 247345678, 2, '2025-01-20 14:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247345678, 7, '2025-03-23 22:45:00'),
('ACCESSO AREA NON AUTORIZZATA', 247345678, 7, '2025-03-24 10:45:00'),
('ACCESSO AREA NON AUTORIZZATA', 247345678, 7, '2025-03-24 22:45:00'),
('ACCESSO AREA NON AUTORIZZATA', 247345678, 7, '2025-03-25 08:45:00'),
('ACCESSO AREA NON AUTORIZZATA', 247345678, 7, '2025-03-25 14:45:00'),
('ECCESSO VELOCITA', 247567890, 3, '2025-02-04 00:45:00'),
('ECCESSO VELOCITA', 247567890, 3, '2025-02-04 12:45:00'),
('ECCESSO VELOCITA', 247567890, 3, '2025-02-05 00:45:00'),
('ECCESSO VELOCITA', 247567890, 3, '2025-02-05 10:45:00'),
('ECCESSO VELOCITA', 247567890, 3, '2025-02-05 16:45:00'),
('ECCESSO VELOCITA', 247567890, 5, '2025-02-27 17:15:00'),
('ECCESSO VELOCITA', 247567890, 5, '2025-02-28 05:15:00'),
('ECCESSO VELOCITA', 247567890, 5, '2025-02-28 17:15:00'),
('ECCESSO VELOCITA', 247567890, 5, '2025-03-01 03:15:00'),
('ECCESSO VELOCITA', 247567890, 5, '2025-03-01 09:15:00'),
('ECCESSO VELOCITA', 247789012, 4, '2025-02-12 15:30:00'),
('ECCESSO VELOCITA', 247789012, 4, '2025-02-13 03:30:00'),
('ECCESSO VELOCITA', 247789012, 4, '2025-02-13 15:30:00'),
('ECCESSO VELOCITA', 247789012, 4, '2025-02-13 15:55:00'),
('ECCESSO VELOCITA', 247789012, 4, '2025-02-14 01:30:00'),
('ECCESSO VELOCITA', 247789012, 4, '2025-02-14 07:30:00'),
('ECCESSO VELOCITA', 247789012, 6, '2025-03-08 16:00:00'),
('ECCESSO VELOCITA', 247789012, 6, '2025-03-09 04:00:00'),
('ECCESSO VELOCITA', 247789012, 6, '2025-03-09 16:00:00'),
('ECCESSO VELOCITA', 247789012, 6, '2025-03-10 02:00:00'),
('ECCESSO VELOCITA', 247789012, 6, '2025-03-10 08:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247890123, 3, '2025-02-08 19:20:00'),
('ACCESSO AREA NON AUTORIZZATA', 247890123, 3, '2025-02-09 07:20:00'),
('ACCESSO AREA NON AUTORIZZATA', 247890123, 3, '2025-02-09 19:20:00'),
('ACCESSO AREA NON AUTORIZZATA', 247890123, 3, '2025-02-10 05:20:00'),
('ACCESSO AREA NON AUTORIZZATA', 247890123, 3, '2025-02-10 11:20:00'),
('ECCESSO VELOCITA', 247901234, 1, '2025-06-02 09:00:00'),
('ECCESSO VELOCITA', 247901234, 1, '2025-06-02 12:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247901234, 7, '2025-04-03 19:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247901234, 7, '2025-04-04 07:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247901234, 7, '2025-04-04 19:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247901234, 7, '2025-04-04 19:25:00'),
('ACCESSO AREA NON AUTORIZZATA', 247901234, 7, '2025-04-05 05:00:00'),
('ACCESSO AREA NON AUTORIZZATA', 247901234, 7, '2025-04-05 11:00:00');