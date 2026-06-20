// Enumerativi degli errori e dei messaggi di successo dell'applicazione. Questi enum forniscono una struttura centralizzata per gestire i messaggi di errore e successo.
export const ERROR_LIST = {
    DB_CONNECTION_ERROR:
    { statusCode: 500, message: "Errore interno del server. Non è possibile procedere con la richiesta." },
    ENV_VARIABLES_MISSING:
    { statusCode: 500, message: "Variabili d'ambiente del database mancanti. Controlla il file .env." },
    INTERNAL_ERROR:
    { statusCode: 500, message: "Errore interno del server. Non è possibile procedere con la richiesta." },
    EMAIL_NOT_EXIST:
    { statusCode: 404, message: "L'email fornita non è associata a nessun utente." },
    INCORRECT_PASSWORD:
    { statusCode: 401, message: "La password inserita non è corretta." },
    INVALID_EMAIL:
    { statusCode: 400, message: "L'email fornita non è in un formato valido (esempio formato valido: mail@dominio.com)." },
    INVALID_PASSWORD:
    { statusCode: 400, message: "La password fornita non è in un formato valido (Deve essere lunga tra 8 e 32 caratteri, comprendere almeno un numero e sono ammessi caratteri alfanumerici)." },
    INVALID_USERNAME:
    { statusCode: 400, message: "Lo username fornito non è in un formato valido." },
    INVALID_USERID:
    { statusCode: 400, message: "L'id utente fornito non è in un formato valido." },
    INCORRECT_DATA:
    { statusCode: 400, message: "I dati forniti non sono corretti o sono già stati usati." },
    EMAIL_ALREADY_EXISTS:
    { statusCode: 409, message: "L'email fornita è già esistente." },
    USERNAME_ALREADY_EXISTS: { statusCode: 409, message: "Lo username fornito è già esistente e associato ad un altro utente." },
    JWT_SECRET_MISSING:
    { statusCode: 500, message: "Chiave privata per JWT non configurata nel file env." },
    JWT_SECRET_DECODING_ERROR:
    { statusCode: 500, message: "Errore nella decodifica della chiave privata per JWT." },
    JWT_PUBLIC_MISSING:
    { statusCode: 500, message: "Chiave pubblica per JWT non configurata nel file env." },
    JWT_TOKEN_ADMIN_MISSING:
    { statusCode: 500, message: "Controlla JWT_TOKEN_ADMIN nelle variabili d'ambiente" },
    JWT_TOKEN_EMPTY: 
    { statusCode: 401, message: "Token di autenticazione vuoto." },
    INVALID_JWT:
    { statusCode: 401, message: "Il JWT fornito non è valido." },
    JWT_NOT_PROVIDED:
    { statusCode: 401, message: "Token JWT non fornito." },
    JWT_TOKEN_EXPIRED:
    { statusCode: 401, message: "Token di autenticazione scaduto." },
    JWT_TOKEN_INVALID:
    { statusCode: 401, message: "Token di autenticazione non valido o malformato." },
    USER_NOT_FOUND:
    { statusCode: 404, message: "Utente non trovato." },
    GEOAREA_NOT_FOUND:
    { statusCode: 404, message: "Geoarea non trovata." },
    IMBARCAZIONE_NOT_FOUND:
    { statusCode: 404, message: "Imbarcazione non trovata." },
    INVALID_MMSI:
    { statusCode: 400, message: "Il MMSI deve essere un numero di esattamente 9 cifre." },
    NOT_ADMIN:
    { statusCode: 403, message: "Accesso riservato agli amministratori." },
} as const;

// Tipo derivato automaticamente dalle chiavi, evita duplicazioni e mantiene tutto in un unico posto. Così basta aggiungere una nuova voce in ERROR_CONFIG e viene mappato automaticamente. keyof estrae tutte le chiavi dell'oggetto ERROR_CONFIG, le unisce in una union ("a" | "b" | ...), poi li usa come tipo (per esempio INTERNAL_ERROR diventa un tipo). Questo garantisce che AppErrorName sia sempre aggiornato con le chiavi effettive dell'oggetto ERROR_CONFIG.
export type AppErrorName = keyof typeof ERROR_LIST; // Equivale a "INTERNAL_ERROR" | "EMAIL_NOT_EXIST" | "INCORRECT_PASSWORD" | ...

// La funzione fromEntries crea un oggetto mappando ogni nome di errore a se stesso, in modo da poter usare AppErrorNames.INVALID_EMAIL come un enum/oggetto invece di "INVALID_EMAIL" come stringa.
export const AppErrorEnum = Object.fromEntries(
    Object.keys(ERROR_LIST).map(k => [k, k])
) as { [K in AppErrorName]: K };

export const SUCCESS_LIST = {
    USER_LOGGED_IN:
    { statusCode: 200, message: "Login effettuato con successo." },
    USER_REGISTERED:
    { statusCode: 201, message: "Registrazione effettuata con successo." },
    USER_FOUND:
    { statusCode: 200, message: "Utente trovato." },
    ROLE_UPDATED:
    { statusCode: 200, message: "Il ruolo dell'utente è stato aggiornato." },
    USER_DELETED:
    { statusCode: 200, message: "L'utente è stato eliminato con successo." },
    AREA_DELETED:
    { statusCode: 200, message: "L'area è stata eliminata con successo." },
    IMBARCAZIONE_DELETED:
    { statusCode: 200, message: "L'imbarcazione è stata eliminata con successo." },
    GEOAREA_CREATED:
    { statusCode: 201, message: "L'area è stata creata con successo." },
    IMBARCAZIONE_CREATED:
    { statusCode: 201, message: "L'imbarcazione è stata creata con successo." },
} as const;

export type AppSuccessName = keyof typeof SUCCESS_LIST;

export const AppSuccessEnum = Object.fromEntries(
    Object.keys(SUCCESS_LIST).map(k => [k, k])
) as { [K in AppSuccessName]: K };