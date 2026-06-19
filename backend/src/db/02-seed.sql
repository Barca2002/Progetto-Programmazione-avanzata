
-- seeding della tabella users

INSERT INTO users (username, email, password, is_admin) VALUES
('admin1', 'admin1@mail.com', '$2a$12$2bDNGhP/5n6QaX0.Wqck8uq6bl6t4YLoRDxL5gp4fcNF6Kb/iMVoW', TRUE), -- password: Admin123
('admin2', 'admin2@mail.com', '$2a$12$NpQxcovOve2mXsqywHW2MeW.hK0MgOqbCUSzM4jb4Gdo4LtUfz.Ji', TRUE), -- password: Admin234
('user1', 'user1@mail.com', '$2a$12$p9iYrTGX7ZXNDrliMdpsZuK7sHXmQSeAXFZw6Y7OVLZj4fLSRwdkC', FALSE), -- password: User1234
('user2', 'user2@mail.com', '$2a$12$JZqS1wa2UpFVRxXemEKWC.l6q6oULEg7DAVmD7kiPqRrGfgjj37uG', FALSE), -- password: User2345
('user3', 'user3@mail.com', '$2a$12$2LeoNCaTB6wUlgsf.uegCeYcWWSjJxNKLD1JfdvrdZ5Um7tYVBKkO', FALSE); -- password: User3456

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