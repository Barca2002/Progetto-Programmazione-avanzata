// Questo script serve per resettare il database eseguendo gli script SQL di inizializzazione e popolazione. Viene eseguito con il comando "npm run db:reset" definito nel package.json.
// --------------------- DA RIMUOVERE IL PRODUZIONE -----------------
import { execSync } from "child_process";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
// -i server per poter inserire l'input nel container. -e definisce una variabile d'ambiente (MYSQL_PWD) che viene usata per autenticarsi al database. Il comando mysql viene eseguito all'interno del container e l'input del comando è il contenuto del file SQL che viene letto con fs.readFileSync.
execSync(`docker exec -i mysql mysql -u root -p${process.env.MYSQL_ROOT_PASSWORD}`, {
  input: fs.readFileSync("backend/src/db/01-init.sql")
});

execSync(`docker exec -i mysql mysql -u root -p${process.env.MYSQL_ROOT_PASSWORD}`, {
  input: fs.readFileSync("backend/src/db/02-seed.sql")
});