// Enumerativi degli errori e dei messaggi di successo dell'applicazione. Questi enum forniscono una struttura centralizzata per gestire i messaggi di errore e successo.
export const ERROR_LIST = {
    INTERNAL_ERROR:          { statusCode: 500, message: "Errore interno del server. Non è possibile procedere con la richiesta." },
    EMAIL_NOT_EXIST:         { statusCode: 404, message: "L'email fornita non è associata a nessun utente." },
    INCORRECT_PASSWORD:      { statusCode: 401, message: "La password inserita non è corretta." },
    INVALID_EMAIL:           { statusCode: 400, message: "L'email fornita non è in un formato valido (il formato deve essere test@dominio.com)." },
    INVALID_PASSWORD:        { statusCode: 400, message: "La password fornita non è in un formato valido." },
    INVALID_USERNAME:        { statusCode: 400, message: "Lo username fornito non è in un formato valido." },
    EMAIL_ALREADY_EXISTS:    { statusCode: 409, message: "L'email fornita è già esistente." },
    USERNAME_ALREADY_EXISTS: { statusCode: 409, message: "Lo username fornito è già esistente e associato ad un altro utente." },
    JWT_SECRET_MISSING:      { statusCode: 500, message: "Chiave privata JWT non configurata nel file env." },
    JWT_PUBLIC_MISSING:      { statusCode: 500, message: "Chiave pubblica JWT non configurata nel file env." },
    INVALID_JWT:             { statusCode: 401, message: "Il JWT fornito non è valido." },
    JWT_NOT_PROVIDED:        { statusCode: 401, message: "Token JWT non fornito." },
    USER_NOT_FOUND:          { statusCode: 404, message: "Utente non trovato." },
    NOT_ADMIN:               { statusCode: 403, message: "Accesso riservato agli amministratori." },
} as const;

// Tipo derivato automaticamente dalle chiavi, evita duplicazioni e mantiene tutto in un unico posto. Così basta aggiungere una nuova voce in ERROR_CONFIG e viene mappato automaticamente. keyof estrae tutte le chiavi dell'oggetto ERROR_CONFIG, le unisce in una union ("a" | "b" | ...), poi li usa come tipo (per esempio INTERNAL_ERROR diventa un tipo). Questo garantisce che AppErrorName sia sempre aggiornato con le chiavi effettive dell'oggetto ERROR_CONFIG.
export type AppErrorName = keyof typeof ERROR_LIST; // Sarebbe "INTERNAL_ERROR" | "EMAIL_NOT_EXIST" | "INCORRECT_PASSWORD" | ...

// Questo oggetto mappa ogni nome di errore a se stesso, in modo da poter usare AppErrorNames.INVALID_EMAIL come un enum invece di "INVALID_EMAIL" come stringa.
export const AppErrorNames = Object.fromEntries(
    Object.keys(ERROR_LIST).map(k => [k, k])
) as { [K in AppErrorName]: K };

export const SUCCESS_LIST = {
    USER_LOGGED_IN:  { statusCode: 200, message: "Login effettuato con successo." },
    USER_REGISTERED: { statusCode: 201, message: "Registrazione effettuata con successo." },
    USER_FOUND:      { statusCode: 200, message: "Utente trovato." },
    ROLE_UPDATED:    { statusCode: 200, message: "Il ruolo dell'utente è stato aggiornato." },
} as const;

export type AppSuccessName = keyof typeof SUCCESS_LIST;

export const AppSuccessNames = Object.fromEntries(
    Object.keys(SUCCESS_LIST).map(k => [k, k])
) as { [K in AppSuccessName]: K };