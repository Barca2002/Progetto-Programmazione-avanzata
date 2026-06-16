import express from 'express';
import { Response, Request, NextFunction } from "express";
import dotenv from 'dotenv';
// PROBLEMA CON GLI IMPORTS, NON RIESCE A TROVARLI PER QUALCHE MOTIVO!
import { authRouter } from './routes/AuthRoutes.js';
import { AppError } from './models/AppErrorModel.js';

dotenv.config();

const PORT = process.env.LISTEN_PORT;

const app = express();

app.get('/check', (req, res) => {
  res.send({
    ok: true, message: "Test rotta /check"
  });
});

// Import rotta di test
app.use("/auth", authRouter);

// Error handler, va messo alla fine di tutte le rotte
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
