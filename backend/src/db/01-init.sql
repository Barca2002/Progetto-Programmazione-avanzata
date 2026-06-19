-- Abilita l'estensione PostGIS
-- Alcuni tipi utili sono GEOMETRY() E GEOGRAPHY(), il secondo permette di memorizzare la latitudine e longitudine.
CREATE EXTENSION IF NOT EXISTS postgis;

-- Eliminazione tabella users se esiste
DROP TABLE IF EXISTS users;

-- Creazione tabella degli utenti
CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY, -- è l'equivalente di autoincrement di mysql
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_email_key UNIQUE (email)
);

-- Creazione delle geofence areas
CREATE TABLE geofence_areas (
    area_id INT GENERATED ALWAYS AS IDENTITY,
    area_name VARCHAR(255) NOT NULL,
    area GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (area_id)
);

CREATE TABLE imbarcazioni (
    mmsi INT GENERATED ALWAYS AS IDENTITY,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (mmsi)
);