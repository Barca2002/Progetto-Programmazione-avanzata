import express from 'express';
import { Response, Request, NextFunction } from "express";
import dotenv from 'dotenv';
import { authRouter } from './routes/AuthRoutes.js';
import { AppError } from './models/AppErrorModel.js';

dotenv.config();

const PORT = process.env.LISTEN_PORT;

const app = express();

app.get('/', (req, res) => {
  res.send({
    ok: true, message: "Servizio funzionante"
  });
});

// Import rotta di test
app.use("/auth", authRouter);

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
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

export default app;
