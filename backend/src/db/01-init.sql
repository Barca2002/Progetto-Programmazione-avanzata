-- Creazione e selezione del database
DROP DATABASE IF EXISTS db_app;
CREATE DATABASE IF NOT EXISTS db_app;
USE db_app;

-- Eliminazione tabella users se esiste
DROP TABLE IF EXISTS users;

-- Creazione tabella degli utenti (users)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    -- La chiave univoca, a differenza di quella primaria, permette valori nulli e duplicati (la combinazione deve essere univoca), ma garantisce che i valori non siano ripetuti all'interno della colonna specificata.
    UNIQUE KEY users_username_key (username),
    UNIQUE KEY users_email_key (email)
);