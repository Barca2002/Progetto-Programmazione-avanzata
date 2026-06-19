
-- seeding della tabella users

INSERT INTO users (username, email, password, is_admin) VALUES
('admin1', 'admin1@mail.com', '$2a$12$2bDNGhP/5n6QaX0.Wqck8uq6bl6t4YLoRDxL5gp4fcNF6Kb/iMVoW', TRUE), -- password: Admin123
('admin2', 'admin2@mail.com', '$2a$12$NpQxcovOve2mXsqywHW2MeW.hK0MgOqbCUSzM4jb4Gdo4LtUfz.Ji', TRUE), -- password: Admin234
('user1', 'user1@mail.com', '$2a$12$p9iYrTGX7ZXNDrliMdpsZuK7sHXmQSeAXFZw6Y7OVLZj4fLSRwdkC', FALSE), -- password: User1234
('user2', 'user2@mail.com', '$2a$12$JZqS1wa2UpFVRxXemEKWC.l6q6oULEg7DAVmD7kiPqRrGfgjj37uG', FALSE), -- password: User2345
('user3', 'user3@mail.com', '$2a$12$2LeoNCaTB6wUlgsf.uegCeYcWWSjJxNKLD1JfdvrdZ5Um7tYVBKkO', FALSE); -- password: User3456

INSERT INTO geofence_areas (area_name, area) VALUES ('Porto di Ancona',ST_GeomFromText('Polygon((13.4376526 43.6587193, 13.4431458 43.5911385, 13.5255432 43.5364220, 13.6016236 43.5742078, 13.6384277 43.6044534, 13.6132965 43.6340863, 13.5951690 43.6735363, 13.4376526 43.6587193))', 4326));