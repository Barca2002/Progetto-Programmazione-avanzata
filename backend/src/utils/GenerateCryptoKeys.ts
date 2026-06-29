import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
// ----------------------------------------------------
// Per eseguire lo script, usare npm run generate-keys
// ----------------------------------------------------

function generateCryptoKeys(): void {
  console.log('[Script] Generazione della coppia di chiavi RSA');

  // Path partendo dalla root del progetto
  const dirPath = 'keys';

  // Verifica se la directory esiste, altrimenti la crea
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`[Success] Directory creata: ${dirPath}`);
    } catch (error) {
      console.error(`[Err] Errore nella creazione della directory: ${error}`);
      process.exit(1);
    }
  }

  // Genera la coppia di chiavi asimmetriche, lunghezza 2048
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Salva i file al path specificato
  try {
    fs.writeFileSync(path.join(dirPath, 'jwtRS256.key'), privateKey);
    fs.writeFileSync(path.join(dirPath, 'jwtRS256.key.pub'), publicKey);
    console.log('[Success] Chiavi generate con successo, path: ' + dirPath);
    console.log('[Script] jwtRS256.key (Da tenere SEGRETA - Usata per firmare)');
    console.log('[Script] jwtRS256.key.pub (Può essere pubblica - Usata per verificare)');
  } catch (error) {
    console.error(`[Err] Errore nella scrittura dei file: ${error}`);
    process.exit(1);
  }
}

generateCryptoKeys();