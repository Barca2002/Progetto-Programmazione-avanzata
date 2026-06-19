import express, { Response, Request, NextFunction } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/AuthRoutes.js';
import { testRouter } from './routes/TestRoutes.js';
import { userRoutes } from './routes/UserRoutes.js';
import { AppError } from './models/AppErrorModel.js';
import { Sequelize } from 'sequelize';
import { DatabaseConnection } from './singleton/DBConnection.js';
import { User } from './models/UserModel.js';

dotenv.config();

const PORT = process.env.LISTEN_PORT;
const db: Sequelize = DatabaseConnection.connect();

User.inizializzaModel(db);

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<h1>Servizio funzionante.
    Esegui l'accesso tramite la rotta "/auth/login".</h1>`);
});

// ROUTES
app.use("/test", testRouter);
app.use("/auth", authRouter);
app.use("/user", userRoutes);

// Error handler, va messo alla fine di tutte le rotte
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