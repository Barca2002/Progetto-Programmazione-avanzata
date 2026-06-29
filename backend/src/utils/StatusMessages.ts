import { MAX_POINTS } from "../middlewares/GeofenceareaMiddleware.js";
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
        { statusCode: 400, message: "La password fornita non è in un formato valido (Deve essere lunga tra 8 e 32 caratteri, comprendere almeno un numero e sono ammessi caratteri speciali)." },
    INVALID_USERNAME:
        { statusCode: 400, message: "Lo username fornito non è in un formato valido." },
    INVALID_NAME:
        { statusCode: 400, message: "Il nome non è in un formato valido." },
    INVALID_TYPE:
        { statusCode: 400, message: "Il tipo non è in un formato valido." },
    INVALID_ASSOCIATION:
        { statusCode: 400, message: "Un associazione è già presente" },
    INVALID_USERID:
        { statusCode: 400, message: "L'id utente fornito non è in un formato valido." },
    INCORRECT_DATA:
        { statusCode: 400, message: "I dati forniti non sono corretti o sono già stati usati." },
    EMAIL_ALREADY_EXISTS:
        { statusCode: 409, message: "L'email fornita è già esistente." },
    USERNAME_ALREADY_EXISTS: { statusCode: 409, message: "Lo username fornito è già esistente e associato ad un altro utente." },
    JWT_SECRET_MISSING:
        { statusCode: 500, message: "Chiave privata per JWT non configurata nel file env." },
    JWT_VERIFY_ERROR:
        { statusCode: 500, message: "Errore nella verifica del token JWT." },
    JWT_PUBLIC_MISSING:
        { statusCode: 500, message: "Chiave pubblica per JWT non configurata nel file env." },
    JWT_TOKEN_ADMIN_MISSING:
        { statusCode: 500, message: "Controlla JWT_TOKEN_ADMIN nelle variabili d'ambiente" },
    JWT_TOKEN_EMPTY:
        { statusCode: 401, message: "Token JWT vuoto." },
    JWT_NOT_PROVIDED:
        { statusCode: 401, message: "Token JWT non fornito." },
    JWT_TOKEN_EXPIRED:
        { statusCode: 401, message: "Token JWT scaduto." },
    JWT_TOKEN_INVALID:
        { statusCode: 401, message: "Token JWT non valido o malformato." },
    USER_NOT_FOUND:
        { statusCode: 404, message: "Utente non trovato." },
    USERNAME_NOT_FOUND:
        { statusCode: 404, message: "Username non trovato." },
    DATO_NOT_FOUND:
        { statusCode: 404, message: "Dato non trovato" },
    GEOAREA_NOT_FOUND:
        { statusCode: 404, message: "Geoarea non trovata." },
    ASSOCIAZIONE_NOT_FOUND:
        { statusCode: 404, message: "L'associazione inserita non è stata trovata, ricontrolla i dati inseriti" },
    IMBARCAZIONE_ALREADY_ASSOCIATED:
        { statusCode: 409, message: "L'imbarcazione è già associata ad un utente, ricontrolla i dati inseriti" },
    IMBARCAZIONE_NOT_FOUND:
        { statusCode: 404, message: "Imbarcazione non trovata." },
    INVALID_MMSI:
        { statusCode: 400, message: "Il MMSI deve essere un numero di esattamente 9 cifre." },
    NOT_ADMIN:
        { statusCode: 403, message: "Accesso riservato agli amministratori." },
    INVALID_LATITUDINE:
        { statusCode: 400, message: "La latitudine deve essere un numero compreso tra -90 e 90." },
    INVALID_LONGITUDINE:
        { statusCode: 400, message: "La longitudine deve essere un numero compreso tra -180 e 180." },
    INVALID_STATO:
        { statusCode: 400, message: "Lo stato deve essere uno tra: IN NAVIGAZIONE, IN PESCA, STAZIONARIA." },
    INVALID_VELOCITA:
        { statusCode: 400, message: "La velocità deve essere un numero positivo e non superiore a 200 km/h." },
    MAX_SPEED_LIMIT:
        { statusCode: 400, message: "La velocità deve essere inferiore a quella max oppure la geoarea non ha una velocità massima" },
    DELETE_ERROR:
        { statusCode: 400, message: "Errore nella cancellazione." },
    CREATE_ERROR:
        { statusCode: 400, message: "Errore nella creazione." },
    UPDATE_ERROR:
        { statusCode: 400, message: "Errore nell'aggiornamento." },
    FIND_ERROR:
        { statusCode: 400, message: "Errore nell'aggiornamento." },
    TOO_MANY_POINTS:
        { statusCode: 401, message: `Inviati troppi punti per la geofence area (max ${MAX_POINTS}).` }, // Usa string interpolation per inserire la variabile nell'errore
    TOO_LITTLE_POINTS:
        { statusCode: 401, message: "Inviati troppi pochi punti per la geofence area (min 4)." },
    INVALID_GEOJSON_FORMAT:
        { statusCode: 401, message: "I dati forniti non rispettano il formato GeoJSON. Inoltre, nel campo 'properties' si deve definire il campo 'name' ed opzionalmente l'attributo 'max_speed', con un valore compreso tra 1 e 200." },
    INCORRECT_COORDS:
        { statusCode: 401, message: "Le coordinate fornite non rispettano i vincoli richiesti (il primo punto)." },
    OVERLAPPING_POLYGON:
        { statusCode: 401, message: "Le coordinate fornite costruiscono un poligono che si sovrappone." },
    GEOAREA_ALREADY_EXISTS:
        { statusCode: 401, message: "Le coordinate fornite già rappresentano una geoarea o il nome è già stato usato." },
    INVALID_TOKEN_AMOUNT:
        { statusCode: 401, message: "La quantità di token specificata non è ammessa (min 0.025, max 100)." },
    MISSING_AUTH_HEADER:
        { statusCode: 401, message: "L'Authentication Header non è presente." },
    INVALID_AUTH_HEADER:
        { statusCode: 401, message: "L'Authentication Header è invalido. Deve iniziare con 'Bearer '." },
    INSUFFICIENT_TOKEN_BALANCE:
        { statusCode: 401, message: "Saldo token non sufficiente per effettuare la richiesta." },
    LOG_NOT_FOUND:
        { statusCode: 404, message: "Log dello spostamento non trovato." },
    INVALID_GEOAREA_ID:
        { statusCode: 400, message: "L'id della geoarea specificato non è valido." },
    SEGNALAZIONE_NOT_FOUND:
        { statusCode: 404, message: "Nessuna segnalazione trovata." },
    VIOLAZIONE_NOT_FOUND:
        { statusCode: 404, message: "Nessuna violazione trovata." },
    INVALID_STATO_VIOLAZIONE:
        { statusCode: 400, message: "Stato della violazione non ammesso." },
    INVALID_DATE_RANGE:
        { statusCode: 400, message: "Le date inserite non sono nel formato adeguato" },
    INVALID_START_DATE:
        { statusCode: 400, message: "Le data di inizio non è nel formato adeguato" },
    INVALID_END_DATE:
        { statusCode: 400, message: "Le data di fine non è nel formato adeguato" },
    IMBARCAZIONE_OWNERSHIP_ERROR:
        { statusCode: 400, message: "L'imbarcazione non risulta associata all'utente corrente." },
    TOKEN_SPEND_ERROR:
        { statusCode: 400, message: "Errore diminuzione token." },
    LAST_POSITION_ERROR:
        { statusCode: 400, message: "Ultima posizione non trovata." },
    ROUTE_NOT_FOUND:
        { statusCode: 404, message: "Rotta non trovata." },

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
    IMBARCAZIONI_GEOFENCES_FOUND:
        { statusCode: 200, message: "Imbarcazioni con geofence associate recuperate con successo." },
    IMBARCAZIONI_SEGNALAZIONI_FOUND:
        { statusCode: 200, message: "Imbarcazioni con segnalazioni recuperate con successo." },
    GEOAREA_CREATED:
        { statusCode: 201, message: "L'area è stata creata con successo." },
    VIOLAZIONE_CREATED:
        { statusCode: 201, message: "La violazione è stata creata con successo." },
    SEGNALAZIONE_CREATED:
        { statusCode: 201, message: "La segnalazione è stata creata con successo." },
    IMBARCAZIONE_CREATED:
        { statusCode: 201, message: "L'imbarcazione è stata creata con successo." },
    GEOAREAS_LINKED:
        { statusCode: 200, message: "Geoaree associate alle imbarcazioni con successo." },
    SEND_DATA:
        { statusCode: 201, message: "Dati inviati con successo." },
    TOKEN_BALANCE_UPDATED:
        { statusCode: 201, message: "Saldo token aggiornato correttamente." },
    LOG_SPOSTAMENTI_FOUND:
        { statusCode: 201, message: "Log spostamenti trovati correttamente" },
    POSIZIONI_FOUND:
        { statusCode: 201, message: "Posizioni trovate correttamente" },
} as const;

export type AppSuccessName = keyof typeof SUCCESS_LIST;

export const AppSuccessEnum = Object.fromEntries(
    Object.keys(SUCCESS_LIST).map(k => [k, k])
) as { [K in AppSuccessName]: K };