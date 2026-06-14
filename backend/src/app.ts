import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

//check connessione + hot reload nella fase di dev
const PORT = process.env.LISTEN_PORT;

const app = express();

app.get('/check', (req, res) => {
  res.json({
    ok: true, message: "Hello Express + Docker + Hot Reload"
  });
});


app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
//////