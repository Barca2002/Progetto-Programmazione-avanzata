# Progetto Programmazione Avanzata - Gestione di imbarcazioni da pesca
## 🗃️ Indice

| Sezione | Descrizione |
|--------|-----------|
| [Obiettivo del progetto](#obiettivo-del-progetto) | Obiettivo principale del progetto e breve spiegazione delle funzionalità. |
| [Tecnologie usate per lo sviluppo](#tecnologie-usate-per-lo-sviluppo)| Lista di tecnologie e framework utilizzati per il developement.
| [Entità coinvolte](#entità-coinvolte)| Lista di tecnologie e framework utilizzati per il developement.
| [Diagramma dei casi d'Uso](#diagramma-dei-casi-duso) | Spiegazione funzionalità offerte dall'applicazione tramite diagrammi dei casi d'uso. |
| [Rotte e diagrammi di sequenza](#rotte-e-diagrammi-di-sequenza) | Panoramica delle rotte più importanti con diagrammi di sequenza. |
| [Design Pattern implementati](#design-pattern-implementati) | Pattern architetturali scelti durante lo sviluppo e le motivazioni. |
| [Installazione ed avvio dell'applicazione](#installazione-e-avvio) | Esecuzione dell'applicazione con Docker. |
| [Testing](#testing) | Testing tramite Postman e Jest. |
| [Autori](#autori) | Autori del progetto. |

## 🎯Obiettivo del progetto
L'obiettivo del progetto consiste nell'implementare un backend per la gestione di utenti, imbarcazioni e delle geofence aree, cioè dei perimetri virtuali associati ad aree geografiche del mondo reale.

## 🔥Tecnologie usate per lo sviluppo
Per lo sviluppo del progetto sono state utilizzate diverse tecnologie e librerie, ognuna con uno scopo ben preciso:

- <img src="./immagini/logos/Typescript_logo_2020.svg" width="30" height="30" style="vertical-align: middle;"> `TypeScript`: linguaggio principale utilizzato per lo sviluppo del backend. Grazie alla tipizzazione statica consente di ridurre gli errori durante lo sviluppo e rende il codice più leggibile e manutenibile.
- <img src="./immagini/logos/Bun_logo.svg" width="30" height="30" style="vertical-align: middle;"> `Bun`: runtime JavaScript utilizzato per l'esecuzione dell'applicazione e la compilazione del codice TypeScript. Offre prestazioni elevate e tempi di avvio sensibilmente inferiori rispetto ad altri runtime tradizionali.
- <img src="./immagini/logos/Nodemon_logo.svg" width="30" height="30" style="vertical-align: middle;"> `Nodemon`: strumento utilizzato durante la fase di sviluppo che riavvia automaticamente l'applicazione ogni volta che vengono rilevate modifiche ai file del progetto, velocizzando il ciclo di sviluppo.
- <img src="./immagini/logos/Postgresql_logo.svg" width="30" height="30" style="vertical-align: middle;">  `PostgreSQL` + <img src="./immagini/logos/Postgis_logo.png" width="30" height="30" style="vertical-align: middle;"> `PostGIS`: PostgreSQL è il database relazionale utilizzato per la persistenza dei dati, mentre l'estensione PostGIS aggiunge il supporto ai dati geografici e alle operazioni spaziali, indispensabili per la gestione delle geofence aree e delle coordinate delle imbarcazioni.
- <img src="./immagini/logos/JWT_logo.svg" width="30" height="30" style="vertical-align: middle;"> `JWT` (JSON Web Token): sistema di autenticazione adottato dal backend. Dopo il login viene generato un token firmato che identifica l'utente autenticato e consente di accedere alle rotte protette senza dover reinserire le credenziali ad ogni richiesta. L'algoritmo usato per la firma è RS256.
### Librerie principali
- <img src="./immagini/logos/Zod_logo.webp" width="30" height="30" style="vertical-align: middle;"> `Zod`: libreria utilizzata per la validazione dei dati ricevuti dalle richieste HTTP, garantendo che i parametri rispettino il formato previsto prima di essere elaborati dal server.
- <img src="./immagini/logos/Sequelize_logo.svg" width="30" height="30" style="vertical-align: middle;"> `Sequelize`: ORM impiegato per interagire con il database PostgreSQL tramite modelli TypeScript, semplificando la gestione delle query e delle relazioni tra le entità.
- <img src="./immagini/logos/Geojson_logo.png" width="30" height="30" style="vertical-align: middle;"> `GeoJSON`: libreria utilizzata per rappresentare e manipolare dati geografici secondo lo standard GeoJSON, impiegato per la definizione delle geofence aree.
- <img src="./immagini/logos/Turfjs_logo.svg" width="30" height="30" style="vertical-align: middle;"> `Turf.js`: libreria geospaziale utilizzata per eseguire calcoli geometrici, come la verifica della presenza di auto intersezioni in un poligono.
- <img src="./immagini/logos/Jest_logo.svg" width="30" height="30" style="vertical-align: middle;"> `Jest`: framework utilizzato per il testing automatico dell'applicazione. Consente di realizzare unit test e test di integrazione, verificando il corretto funzionamento delle funzionalità implementate e contribuendo a garantire l'affidabilità del backend durante lo sviluppo e le successive modifiche al codice.

## 👥Entità coinvolte

### 👤Utenti
Gli utenti sono composti dai seguenti campi:
- `user_id`: codice identificativo univoco assegnato al momento della registrazione.
- `username`: nome utente univoco.
- `email`: indirizzo email.
- `password`: password per accedere al proprio account.
- `tokens`: saldo dei token, utilizzati per effettuare le richieste.
- `created_at`: timestamp della registrazione dell'utente.
  
Gli utenti possono registrarsi fornendo un `username`, un'`email` ed una `password`. Dopo la registrazione, l'utente può loggarsi con le proprie credenziali ed effettuare richieste. Esistono due tipi di utente:
- utente `admin`, il quale può effettuare varie operazioni tra cui la creazione di imbarcazioni, di geofence aree, ricarica dei token degli utenti ed altro.
- utente `normale`, il quale può vedere il saldo dei propri token, invio dei dati di posizione delle proprie imbarcazioni, il quale richiede l'uso di `0.025` token per invio, vedere a quali geofence aree sono autorizzate ad accedere le proprie imbarcazioni, vedere se le proprie imbarcazioni si trovano o no dentro una specifica geoarea (in caso positivo anche il relativo tempo di permanenza) ed infine vedere quali, tra le proprie imbarcazioni, hanno delle segnalazioni.

### 🗺️Geofence aree
Le geofence aree sono composte dai seguenti campi:
- `geoarea_id`: codice identificatore univoco assegnato al momento della creazione. 
- `name`: un nome univoco
- `area`: un'area definita da un insieme di punti, i quali formano un poligono chiuso che non può auto intersecarsi.
- `max_speed`: un limite di velocità massimo consentito in quella geofence area (opzionale).
- `ultima_violazione_valida_id`: il codice identificativo dell'ultima violazione valida registrata in essa.
- `created_at`: timestamp della creazione della geofence area.

### 🛥️Imbarcazioni
Le imbarcazioni sono composte dai seguenti campi:
- `mmsi`: codice identificativo univoco dell'imbarcazione (*Maritime Mobile Service Identity*).
- `name`: nome univoco dell'imbarcazione.
- `type`: tipologia dell'imbarcazione. In questo progetto si gestiscono solo imbarcazioni da pesca.
- `descr`: descrizione dell'imbarcazione.
- `max_capacity`: capacità massima di persone dell'imbarcazione.
- `user_id`: identificativo dell'utente proprietario dell'imbarcazione.
- `created_at`: timestamp della registrazione dell'imbarcazione.

Ogni imbarcazione è associata ad un solo utente proprietario, mentre un utente può possedere più imbarcazioni. Le imbarcazioni possono essere autorizzate ad accedere a specifiche geofence aree, inviare periodicamente i propri dati di posizione ed essere coinvolte in violazioni e segnalazioni.

### 🔗Geofence-Imbarcazioni
L'associazione tra geofence aree ed imbarcazioni è realizzata mediante una tabella di relazione composta dai seguenti campi:
- `geoarea_id`: identificativo della geofence area.
- `mmsi`: identificativo dell'imbarcazione.

Questa relazione permette di definire quali imbarcazioni sono autorizzate ad accedere ad una determinata geofence area. Una geofence area può autorizzare più imbarcazioni, così come una stessa imbarcazione può essere autorizzata ad accedere a più geofence aree.

### 📡Dati inviati
I dati inviati rappresentano le informazioni di posizione trasmesse periodicamente dalle imbarcazioni e sono composti dai seguenti campi:
- `id`: codice identificativo univoco del dato inviato.
- `mmsi`: identificativo dell'imbarcazione che ha effettuato l'invio.
- `latitudine`: latitudine della posizione inviata.
- `longitudine`: longitudine della posizione inviata.
- `velocita_kmh`: velocità dell'imbarcazione espressa in km/h.
- `created_at`: istante dell'invio espresso in formato Unix Epoch.
- `stato`: stato operativo dell'imbarcazione.

Lo stato può assumere uno dei seguenti valori:
- `IN NAVIGAZIONE`
- `IN PESCA`
- `STAZIONARIA`

Ogni invio viene utilizzato dal sistema per verificare l'eventuale ingresso nelle geofence aree, il rispetto dei limiti di velocità e la presenza di eventuali violazioni.

### ⚠️Violazioni
Le violazioni registrano gli eventi nei quali un'imbarcazione non rispetta i vincoli imposti dal sistema e sono composte dai seguenti campi:
- `id`: codice identificativo univoco della violazione.
- `tipo`: tipologia della violazione.
- `mmsi`: identificativo dell'imbarcazione coinvolta.
- `geoarea_id`: identificativo della geofence area interessata.
- `conta_in_segnalazione`: indica se la violazione deve essere considerata per la generazione di una segnalazione. Un'imbarcazione può generare due violazioni nello stesso momento ed in questo caso se ne conta solo una.
- `created_at`: timestamp della registrazione della violazione.

Le violazioni possono essere di due tipi:
- `ECCESSO VELOCITÀ`, quando viene superato il limite di velocità previsto dalla geofence area.
- `ACCESSO AREA NON AUTORIZZATA`, quando un'imbarcazione entra in una geofence area senza essere autorizzata.

### 🚨Segnalazioni
Le segnalazioni rappresentano gli eventi generati dal sistema a seguito del verificarsi di violazioni ripetute all'interno di una geofence area e sono composte dai seguenti campi:
- `id`: codice identificativo univoco della segnalazione.
- `geoarea_id`: identificativo della geofence area interessata.
- `stato`: stato corrente della segnalazione.
- `created_at`: timestamp della creazione della segnalazione.

Una segnalazione può assumere uno dei seguenti stati:
- `IN CORSO`
- `RIENTRATA`

Ogni segnalazione può coinvolgere una o più imbarcazioni responsabili delle violazioni che ne hanno determinato la generazione. La generazione avviene se in un arco temporale di 2 giorni dall'ultima violazione valida, ci sono 6 o più violazioni. Invece, se dall'ultima violazione valida vi sono 5 o meno violazioni, l'ultima segnalazione per quella geofence area va in stato RIENTRATA. Se dall'ultima violazione valida viene registrata un'altra violazione che dista almeno 1 ora, allora questa sostituirà l'ultima violazione valida, spostando la finestra temporale.

### 🔗Imbarcazioni-Segnalazioni
L'associazione tra segnalazioni ed imbarcazioni è realizzata mediante una tabella composta dai seguenti campi:
- `id_segnalazione`: identificativo della segnalazione.
- `mmsi`: identificativo dell'imbarcazione coinvolta.

Questa relazione consente di associare ad una segnalazione tutte le imbarcazioni che hanno contribuito alla sua generazione.

### 📖Log spostamenti
Il logging degli spostamenti è fondamentale per memorizzare tutti gli ingressi e le uscite delle imbarcazioni dalle geofence aree autorizzate. Esso è rappresentato da una tabella composta dai seguenti campi:
- `id`: codice identificativo univoco del movimento registrato.
- `mmsi`: identificativo dell'imbarcazione.
- `geoarea_id`: identificativo della geofence area.
- `spostamento`: tipologia dello spostamento registrato.
- `created_at`: timestamp dell'evento.

Il campo `spostamento` può assumere i seguenti valori:
- `ENTRATA`
- `USCITA`

Il log degli spostamenti viene utilizzato per ricostruire la permanenza delle imbarcazioni all'interno delle geofence aree e per determinare il tempo trascorso al loro interno.

## 📝Diagramma dei casi d'uso
Il diagramma dei casi d'uso mostra 3 attori del sistema: Utente non autenticato, Utente autenticato e Admin. L'admin non ha accesso alle funzionalità dell'utente autenticato.

<img src="./immagini/Diagramma_casi_d_uso.png">

## 🌏Rotte e diagrammi di sequenza
### Elenco delle rotte

| Rotta | Metodo HTTP | Ruolo | Parametri | Descrizione |
| :--- | :--- | :---: | :--- | :--- |
| `/` | **GET** | - | - | Healthcheck |
| `/login` | **POST** | - | {email, password} | Effettua il login e restituisce il token JWT associato all'utente |
| `/register` | **POST** | - | {username, email, password} | Crea un nuovo utente |
| `/user/imbarcazione/send/status` | **POST** | Utente | {mmsi, longitudine, latitudine, velocita_kmh, stato} | Invia i dati di posizione di una propria imbarcazione (costo 0,025 token); calcola l'appartenenza a geofence aree, registra spostamenti in entrata/uscita, violazioni e segnalazioni |
| `/user/imbarcazioni/get/my/status`<br>`/geoareaid/:geoarea_id` | **GET** | Utente | `geoarea_id`  | Restituisce lo stato (DENTRO/FUORI) delle proprie imbarcazioni rispetto a una geofence area, con tempo di permanenza se DENTRO |
| `/user/imbarcazioni/geoaree/get/my` | **POST** | Utente | - | Restituisce tutte le geofence aree autorizzate associate alle proprie imbarcazioni |
| `/user/imbarcazioni/segnalazioni`<br>`/get/my` | **POST** | Utente | - | Restituisce tutte le segnalazioni associate alle proprie imbarcazioni |
| `/user/get/tokenbalance` | **POST** | Utente | - | Restituisce il saldo dei token dell'utente |
| `/admin/update/tokenbalance` | **PATCH** | Admin | {email, amount} | Ricarica il saldo dei token di un utente identificato tramite email |
| `/admin/get/tokenbalance/:id` | **GET** | Admin | `id` | Restituisce il credito residuo di un utente tramite il suo id |
| `/admin/imbarcazione/create` | **POST** | Admin | {mmsi, name, type, descr, max_capacity, user_id} | Crea una nuova imbarcazione associata a un utente |
| `/admin/imbarcazioni/geoaree/link` | **POST** | Admin | {mmsi, geoarea_ids[]},{...} | Associa una o più imbarcazioni a una o più geofence aree in un'unica richiesta |
| `/admin/imbarcazione/geoarea/unlink` | **POST** | Admin | {mmsi, geoarea_id} | Dissocia un'imbarcazione da una geofence area associata |
| `/admin/imbarcazioni/get/positions`<br>`/date` | **POST** | Admin | {mmsi, start_date, end_date?} | Restituisce le posizioni di un'imbarcazione in un intervallo temporale, in formato GeoJSON (end_date opzionale, default data corrente) |
| `/admin/imbarcazioni/status/geoareaid`<br>`/:geoareaid` | **GET** | Admin | `geoareaid` | Restituisce lo stato (DENTRO/FUORI) di tutte le imbarcazioni rispetto a una geofence area, con tempo di permanenza se DENTRO |
| `/admin/imbarcazioni/segnalazioni`<br>`/get/all` | **POST** | Admin | - | Restituisce tutte le imbarcazioni con segnalazioni, indicando per ognuna se RIENTRATA o IN CORSO |
| `/admin/imbarcazioni/geoaree/get/all` | **POST** | Admin | - | Restituisce tutte le imbarcazioni con le rispettive geofence aree associate |
| `/admin/geoarea/create` | **POST** | Admin | GeoJSON con `properties.name` (obbligatorio) e `properties.max_speed` (opzionale) | Crea una nuova geofence area |


Dato il gran numero di messaggi di errore, essi sono stati sostituiti con dei messaggi generici tipo <<Errore...>>.

### Rotta /register

Permette la registrazione di un utente inviando un username e un'email che non sia già stata registrata ed una password.  

<img src="./immagini/Rotta auth_register.png">

Possibili errori: `MISSING_EMAIL, INVALID_EMAIL, MISSING_PASSWORD, INVALID_PASSWORD, INCORRECT_DATA, INTERNAL_ERROR, MISSING_DATA, EMAIL_ALREADY_EXISTS, USERNAME_ALREADY_EXISTS, CREATE_ERROR`.

### Rotta /admin/imbarcazione/create

Permette di creare un'imbarcazione specificando il codice mmsi, il nome, il tipo, la descrizione, la capacità massima di persone che può trasportare e l'id dell'utente a cui associarla.

<img src="./immagini/Rotta admin_imbarcazione_create.png">

Possibili errori: `NOT_ADMIN, MISSING_MMSI, MISSING_AUTH_HEADER, INVALID_AUTH_HEADER, JWT_TOKEN_EMPTY, JWT_TOKEN_EXPIRED, JWT_TOKEN_INVALID, INVALID_MMSI, MISSING_NAME, INVALID_NAME, MISSING_TYPE_IMBARCAZIONE, INVALID_TYPE, MISSING_DESCR, INVALID_DESCR, MISSING_MAX_CAPACITY, INVALID_MAX_CAPACITY, MISSING_USER_ID, INVALID_USERID, INCORRECT_DATA, INTERNAL_ERROR, USER_NOT_FOUND, IMBARCAZIONE_ALREADY_EXISTS, CREATE_ERROR`.

### Rotta /user/sendStatus/

Permette agli utenti di inviare i dati di posizione delle proprie imbarcazioni, specificano un punto geografico tramite longitudine e longitudine, la velocità e lo stato in cui si trova (IN NAVIGAZIONE, IN PESCA, STAZIONARIA).
Data la complessità della rotta, il diagramma è stato diviso in due foto.

<img src="./immagini/Rotta user_sendStatus 1.png">
<img src="./immagini/Rotta user_sendStatus 2.png">

Possibili errori: `NOT_USER, MISSING_AUTH_HEADER, JWT_TOKEN_INVALID, INVALID_AUTH_HEADER, JWT_TOKEN_EMPTY, JWT_TOKEN_EXPIRED, JWT_TOKEN_INVALID,USER_NOT_FOUND, INSUFFICIENT_TOKEN_BALANCE, MISSING_MMSI, INVALID_MMSI, MISSING_LONGITUDINE, INVALID_LONGITUDINE_DECIMALS, INVALID_LONGITUDINE, MISSING_LATITUDINE, INVALID_LATITUDINE_DECIMALS, INVALID_LATITUDINE, MISSING_VELOCITA_KMH, INVALID_VELOCITA, MISSING_STATO, INVALID_STATO, INCORRECT_DATA, INTERNAL_ERROR, IMBARCAZIONE_NOT_FOUND, IMBARCAZIONE_OWNERSHIP_ERROR, CREATE_ERROR`.

### Rotta /admin/imbarcazioni/get/positions/date

Permette ad un admin di ottenere tutte le posizioni di tutte le imbarcazioni in un intervallo temporale specificato, tutto in formato GeoJSON. Se la data finale non è specificata, si considera la data odierna.

<img src="./immagini/Rotta admin_get_positions_date.png">

Possibili errori: `NOT_ADMIN, MISSING_AUTH_HEADER, INVALID_AUTH_HEADER, JWT_TOKEN_EMPTY, JWT_TOKEN_EXPIRED, JWT_TOKEN_INVALID, MISSING_START_DATE, INVALID_START_DATE, MISSING_END_DATE, MAX_END_DATE, INVALID_END_DATE, INCORRECT_DATA, INTERNAL_ERROR, IMBARCAZIONE_NOT_FOUND, INVALID_DATE_RANGE`.

### Rotta /admin/imbarcazioni/geoaree/link

Permette ad un admin di aggiungere una geofence area tra quelle autorizzate di un'imbarcazione.

<img src="./immagini/Rotta admin_imbarcazioni_geoaree_link.png">

Possibili errori: `NOT_ADMIN, MISSING_AUTH_HEADER, INVALID_AUTH_HEADER, JWT_TOKEN_EMPTY, JWT_TOKEN_EXPIRED, JWT_TOKEN_INVALID, INVALID_PARAMS, INCORRECT_DATA, INTERNAL_ERROR, IMBARCAZIONE_NOT_FOUND, GEOAREA_NOT_FOUND, INVALID_ASSOCIATION, CREATE_ERROR`.

### Rotta /admin/imbarcazioni/segnalazioni/get/all

Permette ad un admin di ottenere tutte le imbarcazioni con le relative segnalazioni, sia in corso che rientrate.

<img src="./immagini/Rotta admin_imbarcazioni_segnalazioni_get_all.png">

Possibili errori: `NOT_ADMIN, MISSING_AUTH_HEADER, INVALID_AUTH_HEADER, JWT_TOKEN_EMPTY, JWT_TOKEN_EXPIRED, JWT_TOKEN_INVALID, INTERNAL_ERROR, IMBARCAZIONI_NOT_FOUND`.

## 🧠Design pattern implementati

### Pattern Service Layer
Il pattern **Service Layer** è stato usato principalmente per separare la logica di business dalle operazioni dei controller e coordinare le operazioni. Essi si collocano in mezzo, quando un controller riceve una richiesta, delegano l'elaborazione ai Service. Essi implementano controlli sui dati e sulle regole di business prima che i risultati siano restituiti ai controller. Le operazioni basilari, come le get, find o create, sono "mascherate" dai Service, i quali ottengono i dati interagendo con i DAO e poi eseguono controlli per evitare stati pericolosi nell'applicazione.

### Pattern DAO - Data Access Object
Il pattern **DAO** fornisce un'astrazione per l'accesso ai dati del database, separando la logica di accesso ai dati da quella di business. La maggior parte delle entità dell'applicazione s'interfacciano con i DAO per reperire i loro dati dal database. I DAO implementano operazioni basilari come le CRUD o query con filtri semplici. Nel nostro caso, ogni DAO implementa un'interfaccia per le CRUD (eccetto l'operazione delete dato che non era necessaria).

### Pattern M(V)C - Model View Controller (senza View)

Il pattern M(V)C organizza l'applicazione in due strati logici separati, rendendo più organizzato il codice. Nella versione completa, cioè MVC, il Model rappresenta le informazioni e la logica dell'applicazione, la View si occupa di prendere l'input dell'utente e visualizzare i dati dinamicamente, il Controller permette ai due componenti precedenti di comunicare, fungendo da mediatore. Nella versione senza view, il Model e Controller comunicano tra loro senza interpellare componenti per il rendering delle informazioni.


### Chain of Responsibility - CoR
Il pattern **CoR** permette di passare una richiesta lungo una catena di gestori. In Express, solitamente si una una catena di middleware, i quali sono chiamati secondo un ordine sequenziale. Esso è utile per la validazione dell'input, se nella catena fallisce un controllo, si genera un errore, il quale interrompe la catena per effettuare un'azione di risposta. Questo permette di separare i compiti di ogni gestore, in modo da avere una separazione chiara dei compiti.

### Singleton pattern
Il pattern **Singleton** garantisce che una classe abbia solamente un'istanza in tutta l'applicazione. Spesso si vuole impedire che una classe abbia più istanze, in modo da garantire il controllo a risorse/metodi di una classe. Inoltre garantisce coerenza delle risorse condivise in caso di accessi multipli alla risorsa. Per esempio, se un modulo vuole accedere al database, esso vedrà sempre i dati aggiornati, senza aver bisogno di meccanismi di sincronizzazione perché c'è una sola connessione istanziata. Però il rischio di race condition rimane in caso di accesso simultaneo al singleton.

### Factory pattern
Il pattern **Factory** si occupa della creazione di oggetti, nascondendo la logica dietro un metodo/funzione e standardizzando il processo di creazione. Un client chiede alla factory (solitamente una classe statica), di generare un oggetto, specificandone il tipo e poi sarà la factory a decidere internamente quale oggetto istanziare e restituire. Gli oggetti generati seguono un'interfaccia, per esempio l'ErrorFactory genererà sempre oggetti di tipo Error, quindi essi avranno attributi come statusCode, statusName e message. In base al tipo di errore che chiediamo, l'oggetto restituito avrà attributi differenti.

## 🔧Installazione e avvio
Per installare ed avviare il progetto basta seguire questi semplici passi:

### 1) Clone della repository
Aprire il terminale, spostarsi nella cartella in cui scaricare l'applicazione e digitare il seguente comando:
```powershell
git clone https://github.com/Barca2002/Progetto-Programmazione-avanzata.git
```

### 2) Creazione variabili d'ambiente

Creare un file `.env` dentro la root del progetto con il seguente contenuto:
```env
APP_PORT=3000
TZ=Europe/Rome
DB_NAME=db_app
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=prog_pa
```
### 3) Generazione della chiave pubblica e privtata

Per procedere alla creazione della chiave pubblica e privata, assicurarsi di aver installato Node.js e poi eseguire il seguente comando dal terminale, posizionandosi nella root del progetto:

```powershell
cd ./Progetto-Programmazione-avanzata/
node ./backend/src/utils/GenerateCryptoKeys.ts
```

### 4) Avvio applicazione con Docker

Infine avviare Docker Desktop ed eseguire il seguente comando:

```powershell
docker compose up --build
```

Attendere l'avvio completo dell'applicazione prima di effettuare richieste.

## 🧪Testing

L'applicazione è stata testata sfruttando il framework Jest. Sono stati testati 3 middleware: `AuthMiddleware.ts, DatiInviatiMiddleware.ts` e `GeofenceareaMiddleware.ts`. Questo ha permesso di testare i loro schemi di validazione creati tramite Zod. In seguito sono riportati i risultati:

<img src="./immagini/test_jest.png">

Nella cartella `./backend/src/test` è possibile consultare i file di test per vedere le richieste effettuate. 

Infine, se si vogliono effettuare ulteriori test, si può sfruttare <img src="./immagini/logos/Postman_log.svg" width="20" height="20" style="vertical-align: middle;"> <a href="https://www.postman.com/">Postman</a> importando i file `ProgettoPA.postman_environment.json` e `Collection_ProgettoPA.postman_collection.json` presenti nella cartella `./postman`.

## 🤓Autori
[OperatoreNabla](https://github.com/SpectreCoded)\
[Barca2002](https://github.com/Barca2002)