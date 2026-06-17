import express, { Response, Request, NextFunction } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/AuthRoutes.js';
import { testRouter } from './routes/TestRoutes.js';
import { UserRoutes } from './routes/UserRoutes.js';
import { AppError } from './models/AppErrorModel.js';

dotenv.config();

const PORT = process.env.LISTEN_PORT;

const app = express();

app.get('/', (req, res) => {
  res.send(`<h1>Servizio funzionante.
    Esegui l'accesso tramite la rotta "/auth/login".</h1>`);
});

// ROUTES
app.use("/test", testRouter);

// Import rotta di autenticazione
app.use("/auth", authRouter);

app.use("/user", UserRoutes);

// Error handler, va messo alla fine di tutte le rotte
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    err.send(res); 
  }else{
    // Nel caso di un errore imprevisto, restituisce un messaggio generico di errore interno del server (status 500).
    console.log("Errore imprevisto: " + err);
    return res.status(500).json({
    status: 'error_generic',
    message: 'Errore interno del server'
  });
  }
// ERROR HANDLER (DEVE ESSERE L'ULTIMO)
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode).json({
    error: err.statusCodeString,
    message: err.message,
  });
});


app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

export default app;