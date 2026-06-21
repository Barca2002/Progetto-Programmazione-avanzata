import express, { Response, Request, NextFunction } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/AuthRoutes.js';
import { testRouter } from './routes/TestRoutes.js';
import { adminRoutes } from './routes/AdminRoutes.js';
import { AppError } from './models/AppErrorModel.js';
import { Sequelize } from 'sequelize';
import { DatabaseConnection } from './singleton/DBConnection.js';
import { User } from './models/UserModel.js';
import { Geofencearea } from './models/GeofenceareaModel.js';
import { geofenceareaRoutes } from './routes/GeofenceareaRoutes.js';
import { Imbarcazione } from './models/ImbarcazioneModel.js';
import { imbarcazioneRoutes } from './routes/ImbarcazioneRoutes.js';
import { inizializzaAssociazioni } from './models/TableAssociationsModel.js';
import { GeofenceImbarcazioni } from './models/GeofenceImbarcazioni.js';
import { Datiinviati } from './models/DatiInviatiModel.js';
import { userRoutes } from './routes/UserRoutes.js';

dotenv.config();

const PORT = process.env.APP_PORT;
const db: Sequelize = DatabaseConnection.connect();

// Inizializzazione del model User
User.inizializzaModel(db);
Geofencearea.inizializzaModel(db);
Imbarcazione.inizializzaModel(db);
GeofenceImbarcazioni.inizializzaModel(db);
Datiinviati.inizializzaModel(db);

inizializzaAssociazioni(); //serve per inizializzare le molti a molti

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<h1>Servizio funzionante.
    Esegui l'accesso tramite la rotta "/auth/login".</h1>`);
});

// Rotte varie
app.use("/test", testRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRoutes);
app.use("/geoarea", geofenceareaRoutes);
app.use("/imbarcazione", imbarcazioneRoutes);
app.use("/user", userRoutes);


// Error handler generale, viene chiamato quando un next() gli viene passato un errore. Se il next() non contiene nulla, continua nella CoR
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    err.send(res);
  } else {
    console.log("Errore imprevisto: " + err);
    return res.status(500).json({
      status: 'error_generic',
      message: 'Errore interno del server.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

export default app;