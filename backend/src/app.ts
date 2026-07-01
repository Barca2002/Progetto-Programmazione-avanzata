import express, { Response, Request, NextFunction } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/AuthRoutes.js';
import { adminRouter } from './routes/AdminRoutes.js';
import { AppError } from './models/AppErrorModel.js';
import { DatabaseConnection } from './singleton/DBConnection.js';
import { User } from './models/UserModel.js';
import { Geofencearea } from './models/GeofenceareaModel.js';
import { Imbarcazione } from './models/ImbarcazioneModel.js';
import { inizializzaAssociazioni } from './utils/Associations.js';
import { Datiinviati } from './models/DatiInviatiModel.js';
import { userRouter } from './routes/UserRoutes.js';
import { Segnalazione } from './models/SegnalazioneModel.js';
import { LogSpostamenti } from './models/LogSpostamentiModel.js';
import { Violazione } from './models/ViolazioneModel.js';
import { ErrorFactory } from './factory/ErrorFactory.js';
import { AppErrorEnum } from './utils/StatusMessages.js';


dotenv.config();

const PORT = process.env.APP_PORT;

// Inizializzazione dei model tramite il singleton del database
User.inizializzaModel(DatabaseConnection.getInstance());
Geofencearea.inizializzaModel(DatabaseConnection.getInstance());
Imbarcazione.inizializzaModel(DatabaseConnection.getInstance());
Datiinviati.inizializzaModel(DatabaseConnection.getInstance());
Segnalazione.inizializzaModel(DatabaseConnection.getInstance());
LogSpostamenti.inizializzaModel(DatabaseConnection.getInstance());
Violazione.inizializzaModel(DatabaseConnection.getInstance());


inizializzaAssociazioni(); //serve per inizializzare le molti a molti

const app = express();

app.disable('x-powered-by'); //Nasconde agli attaccanti che il server usa Express
app.use(express.json());

app.get('/', (_req, res) => {
  res.send(`<h1>Servizio funzionante.
    Esegui l'accesso tramite la rotta "/auth/login".</h1>`);
});

// Rotte varie
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);


// Error handler delle rotte inesistenti (404). Express prova tutte le rotte e se non trova niente, chiama questo middleware, il quale genera questa eccezione e poi la manda all'error handler generale. Va messo prima dell'error handler generale, altrimenti userebbe quello di default di express, il quale include l'HTML.
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(ErrorFactory.getError(AppErrorEnum.ROUTE_NOT_FOUND));
});
// Error handler generale (middleware di errore definito dai parametri nella firma), viene chiamato quando un next(err) gli viene passato un errore. Se il next() non contiene nulla, continua nella CoR con i middleware normali (senza parametro err).
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return err.send(res);
  } else {
    console.log("Errore imprevisto: ");
    console.log(err);
    return res.status(500).json({
      statusCode: 500,
      status: 'error_generic',
      message: 'Errore interno del server.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

export default app;