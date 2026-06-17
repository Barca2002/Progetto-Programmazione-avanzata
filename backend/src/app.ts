import express, { Response, Request, NextFunction } from 'express';
import dotenv from 'dotenv';

import { authRouter } from './routes/AuthRoutes.js';
import { UserRoutes } from './routes/UserRoutes.js';
import { AppError } from './models/AppErrorModel.js';

dotenv.config();

const PORT = process.env.LISTEN_PORT;

const app = express();

app.use(express.json());

// TEST ROUTE
app.get('/check', (req, res) => {
  res.send({
    ok: true,
    message: "Test rotta /check"
  });
});

// ROUTES
app.use("/auth", authRouter);
app.use("/user", UserRoutes);

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