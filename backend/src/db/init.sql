-- Abilita l'estensione PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS log_spostamenti;
DROP TABLE IF EXISTS violazioni;
DROP TABLE IF EXISTS dati_inviati;      
DROP TABLE IF EXISTS segnalazioni;
DROP TABLE IF EXISTS geofence_imbarcazioni;
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
    tokens     NUMERIC(6,3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_email_key    UNIQUE (email),
    CONSTRAINT chk_token      CHECK (tokens >= 0)
);

-- ------------------------------------------------------------
--  TABELLA: imbarcazioni
-- ------------------------------------------------------------
CREATE TABLE imbarcazioni (
    mmsi          INT          PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    type          VARCHAR(50)  NOT NULL,
    descr         VARCHAR(255) NOT NULL,
    max_capacity  INT          NOT NULL,
    user_id       INT          NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT imbarcazioni_name_key UNIQUE (name),
    CONSTRAINT fk_imbarcazioni_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL 
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

-- ------------------------------------------------------------
--  TABELLA: log_spostamenti
-- ------------------------------------------------------------
CREATE TABLE log_spostamenti (
    id        INT GENERATED ALWAYS AS IDENTITY,
    mmsi           INT             NOT NULL,
    geoarea_id     INT             NOT NULL,
    spostamento    VARCHAR(10)     NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    CONSTRAINT fk_mmsi FOREIGN KEY (mmsi) REFERENCES imbarcazioni(mmsi) ON DELETE CASCADE,
    CONSTRAINT fk_geoid FOREIGN KEY (geoarea_id) REFERENCES geofence_areas(geoarea_id) ON DELETE CASCADE,
    CONSTRAINT chk_spostamento CHECK (spostamento IN ('USCITA', 'ENTRATA'))
);


-- ============================================================
--  SEEDING
-- ============================================================

-- ------------------------------------------------------------
--  users
-- ------------------------------------------------------------
INSERT INTO users (username, email, password, is_admin, tokens) VALUES
('admin1', 'admin1@mail.com', '$2a$12$2bDNGhP/5n6QaX0.Wqck8uq6bl6t4YLoRDxL5gp4fcNF6Kb/iMVoW', TRUE, 100),   
('admin2', 'admin2@mail.com', '$2a$12$NpQxcovOve2mXsqywHW2MeW.hK0MgOqbCUSzM4jb4Gdo4LtUfz.Ji', TRUE, 100),   
('user1',  'user1@mail.com',  '$2a$12$p9iYrTGX7ZXNDrliMdpsZuK7sHXmQSeAXFZw6Y7OVLZj4fLSRwdkC', FALSE, 2),  
('user2',  'user2@mail.com',  '$2a$12$JZqS1wa2UpFVRxXemEKWC.l6q6oULEg7DAVmD7kiPqRrGfgjj37uG', FALSE, 0.5),  
('user3',  'user3@mail.com',  '$2a$12$2LeoNCaTB6wUlgsf.uegCeYcWWSjJxNKLD1JfdvrdZ5Um7tYVBKkO', FALSE, 5),  
('user4',  'user4@mail.com',  '$2a$12$2bDNGhP/5n6QaX0.Wqck8uq6bl6t4YLoRDxL5gp4fcNF6Kb/iMVoW', FALSE, 5),  
('user5',  'user5@mail.com',  '$2a$12$NpQxcovOve2mXsqywHW2MeW.hK0MgOqbCUSzM4jb4Gdo4LtUfz.Ji', FALSE, 5),  
('user6',  'user6@mail.com',  '$2a$12$p9iYrTGX7ZXNDrliMdpsZuK7sHXmQSeAXFZw6Y7OVLZj4fLSRwdkC', FALSE, 10),  
('user7',  'user7@mail.com',  '$2a$12$JZqS1wa2UpFVRxXemEKWC.l6q6oULEg7DAVmD7kiPqRrGfgjj37uG', FALSE, 1),  
('user8',  'user8@mail.com',  '$2a$12$2LeoNCaTB6wUlgsf.uegCeYcWWSjJxNKLD1JfdvrdZ5Um7tYVBKkO', FALSE, 1);  

-- ------------------------------------------------------------
--  imbarcazioni
-- ------------------------------------------------------------
INSERT INTO imbarcazioni (mmsi, name, type, descr, max_capacity, user_id) VALUES
(247123456, 'Adriatica Uno','peschereccio_strascico','Peschereccio a strascico oceanico per pesce bianco', 10, 3),
(247234567, 'Conero Explorer','peschereccio_circuizione', 'Peschereccio a circuizione per pesce azzurro',10, 3),
(247345678, 'San Ciriaco','nave_fattoria','Nave fattoria per congelamento e lavorazione pesce',40, 4),
(215456789, 'Marche Star','trasporto_pescato','Nave da trasporto e logistica del pescato',6, 4),
(247567890, 'Riviera Blu','pesca_artigianale','Barca per pesca artigianale costiera',12, 3),
(247789012, 'Don Bosco II','palamitaro','Palamitaro per la pesca d’altura di tonno e spada',10, 5),
(247890123, 'Bora Bora','reti_da_posta','Imbarcazione da pesca con reti da posta',10, 5),
(247901234, 'Eurocargo Ancona','trasporto_pescato','Nave trasporto per rifornimento mercati ittici',25, 1),
(247012345, 'Falco Marino','vigilanza_pesca','Unità di vigilanza e controllo attività ittiche',25, 2),
(247112233, 'Medusa','ricerca_ittica','Nave per la ricerca e monitoraggio degli stock ittici',40, 5),
(247113344, 'Stella del Mare','peschereccio_strascico','Peschereccio a strascico costiero per fondali bassi',15, 6),
(247114455, 'Vento di Levante','lampara','Lampara per la pesca notturna del pesce azzurro',9, 6),
(247115566, 'Porto Recanati','vongolara_turbosoffiante', 'Turbosoffiante per la pesca di molluschi e vongole',10, 7),
(247116677, 'Sirena Adriatica','pesca_artigianale','Imbarcazione locale per la piccola pesca costiera',14, 4),
(247117788, 'Orizzonte Blu','peschereccio_strascico','Peschereccio per la pesca a strascico adriatica',22, 8),
(247118899, 'Punta Trave','pesca_nasse','Barca specializzata nella pesca con trappole e nasse',8, 8),
(247119900, 'Mare Nostrum','nave_fattoria','Nave da grande pesca con impianti di surgelazione',21, 9),
(247120011, 'Costa Conero','palamitaro','Palamitaro d’altura per grandi pelagici',1800, 9),
(247121122, 'Albatros Due','assistenza_pesca','Unità di assistenza e soccorso alla flotta peschereccia',18, 5),
(247122233, 'Tritone','ricerca_ittica','Nave per lo studio biologico delle risorse marine',   20, 10);

-- ------------------------------------------------------------
--  geofence_areas
-- ------------------------------------------------------------
INSERT INTO geofence_areas (name, area, max_speed) VALUES
('Zona Marittima Nord Ancona', ST_GeomFromText('POLYGON((13.4700 43.7000, 13.5500 43.7000, 13.5600 43.6700, 13.4900 43.6600, 13.4700 43.7000))', 4326), 20),
('Zona Marittima Est Porto', ST_GeomFromText('POLYGON((13.5600 43.6600, 13.6400 43.6600, 13.6500 43.6300, 13.5800 43.6200, 13.5600 43.6600))', 4326), 20),
('Area Offshore Conero Nord', ST_GeomFromText('POLYGON((13.6200 43.6000, 13.7000 43.6000, 13.7100 43.5600, 13.6400 43.5500, 13.6200 43.6000))', 4326), 50),
('Area Offshore Portonovo', ST_GeomFromText('POLYGON((13.6500 43.5600, 13.7300 43.5600, 13.7400 43.5200, 13.6700 43.5100, 13.6500 43.5600))', 4326), 50),
('Area Offshore Sirolo', ST_GeomFromText('POLYGON((13.6800 43.5200, 13.7600 43.5200, 13.7700 43.4800, 13.7000 43.4700, 13.6800 43.5200))', 4326), 50),
('Area Offshore Numana', ST_GeomFromText('POLYGON((13.7000 43.4700, 13.7900 43.4700, 13.8000 43.4300, 13.7200 43.4200, 13.7000 43.4700))', 4326), 50),
('Adriatico Centrale 1', ST_GeomFromText('POLYGON((13.8000 43.6500, 13.9500 43.6500, 13.9500 43.5000, 13.8000 43.5000, 13.8000 43.6500))', 4326), NULL),
('Adriatico Centrale 2', ST_GeomFromText('POLYGON((13.8500 43.4800, 14.0000 43.4800, 14.0000 43.3500, 13.8500 43.3500, 13.8500 43.4800))', 4326), NULL),
('Canale di Fano', ST_GeomFromText('POLYGON((13.8000 43.8500, 13.9500 43.8500, 13.9500 43.7500, 13.8000 43.7500, 13.8000 43.8500))', 4326), NULL),
('Acque Territoriali Pesaro', ST_GeomFromText('POLYGON((12.8000 43.9500, 13.0000 43.9500, 13.0000 43.8500, 12.8000 43.8500, 12.8000 43.9500))', 4326), NULL);

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

-- ------------------------------------------------------------
--  log_spostamenti
-- ------------------------------------------------------------
INSERT INTO log_spostamenti (mmsi, geoarea_id, spostamento, created_at) VALUES
(247123456, 1, 'ENTRATA', '2026-06-20 06:00:00'),
(247123456, 1, 'USCITA',  '2026-06-20 18:30:00'),
(247123456, 1, 'ENTRATA', '2026-06-21 05:45:00'),
(247123456, 1, 'USCITA',  '2026-06-21 19:15:00'),
(247123456, 1, 'ENTRATA', '2026-06-22 06:10:00'),
(247234567, 2, 'ENTRATA', '2026-06-20 08:00:00'),
(247234567, 2, 'USCITA',  '2026-06-20 12:00:00'),
(247234567, 2, 'ENTRATA', '2026-06-21 08:15:00'),
(247234567, 2, 'USCITA',  '2026-06-21 13:00:00'),
(247234567, 2, 'ENTRATA', '2026-06-22 07:45:00');