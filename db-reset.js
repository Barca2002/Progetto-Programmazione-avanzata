/* global process */ //Commento per non considerare questo file enel lint 

// Questo script serve per resettare il database eseguendo gli script SQL di inizializzazione e popolazione. Viene eseguito con il comando "npm run db:reset" definito nel package.json.
// --------------------- DA RIMUOVERE IL PRODUZIONE -----------------
import { execSync } from "node:child_process";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();
// -i serve per poter inserire l'input nel container. Il comando mysql viene eseguito all'interno del container e l'input del comando è il contenuto del file SQL che viene letto con fs.readFileSync.
execSync(`docker exec -i postgres psql -U ${process.env.DB_USER} -d ${process.env.DB_NAME}`, {
  input: fs.readFileSync("backend/src/db/init.sql")
});