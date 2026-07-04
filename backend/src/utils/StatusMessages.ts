

import { MAX_EMAIL_LENGTH } from "./GlobalConstants.js";
import { MAX_DECIMALS, MAX_NAME_LENGTH, MAX_POINTS, MAX_SPEED_ALLOWED, MIN_NAME_LENGTH } from "./GlobalConstants.js";
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
        { statusCode: 400, message: `L'email fornita non è in un formato valido (esempio formato valido: mail@dominio.com). Sono ammessi massimo ${MAX_EMAIL_LENGTH} caratteri.` },
    INVALID_PASSWORD:
        { statusCode: 400, message: "La password fornita non è in un formato valido (Deve essere lunga tra 8 e 32 caratteri, comprendere almeno un numero e sono ammessi caratteri speciali)." },
    INVALID_USERNAME:
        { statusCode: 400, message: "Lo username fornito non è in un formato valido." },
    INVALID_NAME:
        { statusCode: 400, message: "Il nome non è in un formato valido. Sono ammessi massimo 100 caratteri." },
    INVALID_TYPE:
        { statusCode: 400, message: "Il tipo non è in un formato valido." },
    INVALID_DESCR:
        { statusCode: 400, message: "La descrizione non è in un formato valido. Sono ammessi massimo 500 caratteri." },
    INVALID_MAX_CAPACITY:
        { statusCode: 400, message: "La capacità massima non è in un formato valido. Deve essere un numero intero positivo e non superiore a 1000." },
    INVALID_USERID:
        { statusCode: 400, message: "L'id utente fornito non è in un formato valido. Deve essere un numero intero positivo." },
    INVALID_TYPE_FEATURECOLLECTION:
        { statusCode: 400, message: "Il primo parametro 'type' non è in un formato valido. Deve contenere la stringa 'FeatureCollection'." },
    INVALID_TYPE_FEATURE:
        { statusCode: 400, message: "Il secondo parametro 'type' non è in un formato valido. Deve contenere la stringa 'Feature'." },
    INVALID_GEOMETRY_TYPE:
        { statusCode: 400, message: "Il terzo parametro 'type' non è in un formato valido. Deve contenere un poligono, quindi la stringa 'Polygon'." },
    INVALID_FEATURE_ARRAY:
        { statusCode: 400, message: "Il parametro 'features' non è in un formato valido. Deve contenere un array di Features con 'properties' e 'geometry'." },
    INVALID_PROPERTIES:
        { statusCode: 400, message: "Il parametro 'properties' non è in un formato valido. Deve contenere i parametri 'name' e 'max_speed'." },
    INVALID_NAME_PARAM:
        { statusCode: 400, message: `Il parametro 'name' non è in un formato valido (numero di caratteri ammessi è minimo ${MIN_NAME_LENGTH} e massimo ${MAX_NAME_LENGTH}).` },
    INVALID_MAX_SPEED:
        { statusCode: 400, message: `La velocità massima non è in un formato valido o supera il limite massimo consentito (${MAX_SPEED_ALLOWED} km/h).` },
    INVALID_GEOMETRY:
        { statusCode: 400, message: "Il parametro 'geometry' invalido, deve contenere i parametri 'type' e 'coordinates'." },
    INVALID_POSITION_VALUES:
        { statusCode: 400, message: "Le posizioni devono contenere esattamente 2 valori (longitudine e latitudine)." },
    INVALID_LONGITUDINE_VALUE:
        { statusCode: 400, message: "Manca il valore della longitudine in una posizione." },
    INVALID_LATITUDINE_VALUE:
        { statusCode: 400, message: "Manca il valore della longitudine in una posizione." },
    INVALID_LONGITUDINE:
        { statusCode: 400, message: "La longitudine deve essere un numero da -180 a 180." },
    INVALID_LATITUDINE:
        { statusCode: 400, message: "La longitudine deve essere un numero da -90 a 90." },
    INVALID_COORDINATES:
        { statusCode: 400, message: "Le coordinate fornite non sono in un formato valido. Devono contenere un array di posizioni e seguire il seguente formato: [[ [long, lat], [long, lat], ...]]." },
    INVALID_ASSOCIATION:
        { statusCode: 400, message: "Un associazione è già presente" },
    INCORRECT_DATA:
        { statusCode: 400, message: "I dati forniti non sono corretti." },
    TOKEN_EDIT_NOT_ALLOWED:
        { statusCode: 400, message: "Non è possibile modificare il saldo dei token con questa rotta." },
    CREATEDAT_EDIT_NOT_ALLOWED:
    { statusCode: 400, message: "Non è possibile modificare il campo created_at." },
    EMAIL_ALREADY_EXISTS:
        { statusCode: 400, message: "L'email fornita è già esistente." },
    USERNAME_ALREADY_EXISTS: { statusCode: 409, message: "Lo username fornito è già esistente e associato ad un altro utente." },
    JWT_SECRET_MISSING:
        { statusCode: 500, message: "Chiave privata per JWT non configurata nel file env." },
    JWT_VERIFY_ERROR:
        { statusCode: 500, message: "Errore nella verifica del token JWT." },
    JWT_PUBLIC_MISSING:
        { statusCode: 500, message: "Chiave pubblica per JWT non configurata nel file env." },
    JWT_PUBLIC_DECODE_ERROR:
        { statusCode: 500, message: "Errore nella decodifica della chiave pubblica. per i token JWT." },
    JWT_TOKEN_ADMIN_MISSING:
        { statusCode: 500, message: "Controlla JWT_TOKEN_ADMIN nelle variabili d'ambiente" },
    JWT_TOKEN_EMPTY:
        { statusCode: 401, message: "Il Token JWT è vuoto." },
    JWT_NOT_PROVIDED:
        { statusCode: 401, message: "Token JWT non presente nella richiesta." },
    JWT_TOKEN_EXPIRED:
        { statusCode: 401, message: "Il Token JWT è scaduto." },
    JWT_TOKEN_INVALID:
        { statusCode: 401, message: "Il Token JWT è non valido o malformato." },
    JWT_TOKEN_KEY_ERROR:
        { statusCode: 500, message: "Errore durante il reperimento della chiave per la generazione dei token JWT." },
    USER_NOT_FOUND:
        { statusCode: 404, message: "Utente non trovato." },
    USERNAME_NOT_FOUND:
        { statusCode: 404, message: "Username non trovato." },
    MISSING_USERNAME:
        { statusCode: 400, message: "Parametro 'username' mancante nella richiesta." },
    MISSING_EMAIL: 
        { statusCode: 400, message: "Parametro 'email' mancante nella richiesta." },
    MISSING_PASSWORD:
        { statusCode: 400, message: "Parametro 'password' mancante nella richiesta." },
    MISSING_MMSI:
        { statusCode: 400, message: "Parametro 'mmsi' mancante nella richiesta." },
    MISSING_TYPE_FEATURECOLLECTION:
        { statusCode: 400, message: "Parametro 'type' mancante nella richiesta." },
    MISSING_TYPE_FEATURE:
        { statusCode: 400, message: "Parametro 'type' di 'features' mancante nella richiesta." },
    MISSING_GEOMETRY_TYPE:
        { statusCode: 400, message: "Parametro 'type' di 'geometry' mancante nella richiesta." },
    MISSING_TYPE_IMBARCAZIONE:
        { statusCode: 400, message: "Parametro 'type' mancante nella richiesta." },
    MISSING_NAME:
        { statusCode: 400, message: "Parametro 'name' mancante nella richiesta." },
    MISSING_DESCR:
        { statusCode: 400, message: "Parametro 'descr' mancante nella richiesta." },
    MISSING_MAX_CAPACITY:
        { statusCode: 400, message: "Parametro 'max_capacity' mancante nella richiesta." },
    MISSING_USER_ID:
        { statusCode: 400, message: "Parametro 'user_id' mancante nella richiesta." },
    MISSING_START_DATE:
        { statusCode: 400, message: "Parametro 'start_date' mancante nella richiesta." },
    MISSING_END_DATE:
        { statusCode: 400, message: "Parametro 'end_date' mancante nella richiesta." },
    MISSING_LONGITUDINE:
        { statusCode: 400, message: "Parametro 'longitudine' mancante nella richiesta." },
    MISSING_LATITUDINE:
        { statusCode: 400, message: "Parametro 'latitudine' mancante nella richiesta." },
    MISSING_VELOCITA_KMH:
        { statusCode: 400, message: "Parametro 'velocita_kmh' mancante nella richiesta." },
    MISSING_STATO:
        { statusCode: 400, message: "Parametro 'stato' mancante nella richiesta." },
    MISSING_FEATURES:
        { statusCode: 400, message: "Parametro 'features' mancante nella richiesta." },
    MISSING_PROPERTIES:
        { statusCode: 400, message: "Parametro 'properties' mancante nella richiesta." },
    MISSING_MAX_SPEED:
        { statusCode: 400, message: "Parametro 'max_speed' mancante nella richiesta." },
    MISSING_GEOMETRY:
        { statusCode: 400, message: "Parametro 'geometry' mancante nella richiesta." },
    MISSING_COORDINATES:
        { statusCode: 400, message: "Parametro 'coordinates' mancante nella richiesta." },
    MISSING_NEW_TOKEN_AMOUNT:
        { statusCode: 400, message: "Parametro 'newTokenAmount' mancante nella richiesta."},
    MISSING_DATA:
        {statusCode: 400, message: "Dati mancanti nella richiesta."},
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
    IMBARCAZIONI_NOT_FOUND:
        { statusCode: 404, message: "Imbarcazioni non trovate." },
    INVALID_MMSI:
        { statusCode: 400, message: "Il MMSI deve essere un numero di esattamente 9 cifre." },
    NOT_ADMIN:
        { statusCode: 401, message: "Accesso riservato agli amministratori." },
    INVALID_LATITUDINE_RANGE:
        { statusCode: 400, message: `La latitudine deve essere un numero compreso tra -90 e 90.` },
    INVALID_LONGITUDINE_RANGE:
        { statusCode: 400, message: `La longitudine deve essere un numero compreso tra -180 e 180.` },
    INVALID_LATITUDINE_DECIMALS:
        { statusCode: 400, message: `La latitudine può contenere al massimo ${MAX_DECIMALS} cifre dopo la virgola` },
    INVALID_LONGITUDINE_DECIMALS:
        { statusCode: 400, message: `La longitudine può contenere al massimo ${MAX_DECIMALS} cifre dopo la virgola` },
    INVALID_STATO:
        { statusCode: 400, message: "Lo stato deve essere uno tra: IN NAVIGAZIONE, IN PESCA, STAZIONARIA." },
    INVALID_VELOCITA:
        { statusCode: 400, message: `La velocità deve essere un numero intero positivo e non superiore a ${MAX_SPEED_ALLOWED} km/h.` },
    DELETE_ERROR:
        { statusCode: 400, message: "Errore nella cancellazione." },
    CREATE_ERROR:
        { statusCode: 400, message: "Errore nella creazione." },
    UPDATE_ERROR:
        { statusCode: 400, message: "Errore nell'aggiornamento." },
    FIND_ERROR:
        { statusCode: 400, message: "Errore nell'aggiornamento." },
    TOO_MANY_POINTS:
        { statusCode: 400, message: `Inviati troppi punti per la geofence area (max ${MAX_POINTS}).` }, // Usa string interpolation per inserire la variabile nell'errore
    TOO_LITTLE_POINTS:
        { statusCode: 400, message: "Inviati troppi pochi punti per la geofence area (min 4)." },
    INVALID_GEOJSON_FORMAT:
        { statusCode: 400, message: "I dati forniti non rispettano il formato GeoJSON. Inoltre, nel campo 'properties' si deve definire il campo 'name' ed opzionalmente l'attributo 'max_speed', con un valore compreso tra 1 e 200." },
    INCORRECT_COORDS:
        { statusCode: 400, message: "Le coordinate fornite non rispettano i vincoli richiesti." },
    OVERLAPPING_POLYGON:
        { statusCode: 400, message: "Le coordinate fornite costruiscono un poligono che si sovrappone." },
    GEOAREA_ALREADY_EXISTS:
        { statusCode: 400, message: "Le coordinate fornite già rappresentano una geoarea o il nome è già stato usato." },
    INVALID_NEW_TOKEN_AMOUNT:
        { statusCode: 400, message: "La quantità di token specificata non è ammessa (min 0.025, max 100)." },
    MISSING_AUTH_HEADER:
        { statusCode: 401, message: "L'Authentication Header non è presente." },
    INVALID_AUTH_HEADER:
        { statusCode: 400, message: "L'Authentication Header è invalido. Deve iniziare con 'Bearer '." },
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
        { statusCode: 400, message: "Le date inserite non sono valide, la data iniziale deve essere minore della data finale." },
    INVALID_START_DATE:
        { statusCode: 400, message: "Le data di inizio non è nel formato richiesto (gg-mm-yyyy)." },
    INVALID_END_DATE:
        { statusCode: 400, message: "Le data di fine non è nel formato richiesto (gg-mm-yyyy)." },
    IMBARCAZIONE_OWNERSHIP_ERROR:
        { statusCode: 400, message: "L'imbarcazione non risulta associata all'utente corrente." },
    TOKEN_SPEND_ERROR:
        { statusCode: 400, message: "Errore diminuzione token." },
    LAST_POSITION_ERROR:
        { statusCode: 400, message: "Ultima posizione non trovata." },
    ROUTE_NOT_FOUND:
        { statusCode: 404, message: "Rotta non trovata." },
    INVALID_PARAMS:
        { statusCode: 400, message: "I parametri forniti non sono corretti." },
    IMBARCAZIONE_ALREADY_EXISTS:
        { statusCode: 400, message: "L'imbarcazione già esiste." },
    VALIDATION_ERROR:
        { statusCode: 400, message: "Errore durante la validazione della richiesta." },
    ADD_IMBARCAZIONI_TO_SEGNALAZIONE_ERROR:
        { statusCode: 400, message: "Errore durante l'aggiunta delle imbarcazioni alla segnalazione." },

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
    SEND_STATUS_OK:
        { statusCode: 200, message: "Dati sullo status inviati con successo." },
    TOKEN_BALANCE_UPDATED:
        { statusCode: 200, message: "Saldo token aggiornato correttamente." },
    LOG_SPOSTAMENTI_FOUND:
        { statusCode: 200, message: "Log spostamenti trovati correttamente" },
    POSIZIONI_FOUND:
        { statusCode: 200, message: "Posizioni trovate correttamente" },
    STATUS_FOUND:
        { statusCode: 200, message: "Status dell'imbarcazione per la geoarea trovato" },
    REQUEST_SUCCESS:
        { statusCode: 200, message: "Richiesta completata con successo." },
} as const;

export type AppSuccessName = keyof typeof SUCCESS_LIST;

export const AppSuccessEnum = Object.fromEntries(
    Object.keys(SUCCESS_LIST).map(k => [k, k])
) as { [K in AppSuccessName]: K };