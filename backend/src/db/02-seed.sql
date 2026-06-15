-- seeding della tabella users

INSERT INTO db_app.users (username, email, password, is_admin) VALUES
('admin', 'admin@mail.com', '$2a$12$cAQPbJc2AT.8mK37uy0lhOviymjbOgUUlQgQ0iF2X3e7yNhpTTYiG', TRUE), -- password: Admin1
('admin2', 'admin2@mail.com', '$2a$12$86/uS4HNswlKLUYRef1WqePM4vdWJka2jx42DephW7l.BScs0ln/G', FALSE), -- password: Admin2
('user1', 'user1@mail.com', '$2a$12$r1opqg0/utZHmZRgTLGBCORK2ol8Xd1NupXNDRinLxfVikwQGtyw.', FALSE), -- password: User1
('user2', 'user2@mail.com', '$2a$12$bzIu9FlaQVMk4SF/B8uz7.lUwsW478Rwd2GWoszzBm4xmZ1n0iKg2', FALSE), -- password: User2
('user3', 'user3@mail.com', '$2a$12$kC7xu23bYH.kOruzvDc7x.UTbzwq8B9OLYBwEi7UTVyChLa7aq0jW', FALSE); -- password: User3
