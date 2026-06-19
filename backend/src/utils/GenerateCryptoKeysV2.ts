import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

// ----------------------------------------------------
// Per eseguire lo script, usare npm run generate-keys
// Le chiavi vengono appese nel file .env
// ----------------------------------------------------

function generateCryptoKeys(): void {
  console.log('[Script] Generazione della coppia di chiavi RSA.');

  // Genera la coppia di chiavi asimmetriche, lunghezza 4096
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

  // Converte le chiavi in stringhe Base64 per il file .env, evitando problemi di a capo
  const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
  const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

  // Identifica il path del file .env nella root del progetto
  const envPath = path.join(process.cwd(), '.env');

  // Costruisce il blocco di testo da appendere
  const envBlock = `
# --- JWT RSA KEYS GENERATED AT ${new Date().toISOString()} ---
JWT_PRIVATE_KEY="${privateKeyBase64}"
JWT_PUBLIC_KEY="${publicKeyBase64}"
`;

  try {
    // Appende il blocco al file .env (lo crea se non esiste)
    fs.appendFileSync(envPath, envBlock, 'utf8');
    
    console.log('[Success] Chiavi generate e salvate nel file .env con successo!');
    console.log('[Script] JWT_PRIVATE_KEY (Da tenere SEGRETA - Usata per firmare)');
    console.log('[Script] JWT_PUBLIC_KEY (Può essere pubblica - Usata per verificare)');
  } catch (error) {
    console.error(`[Err] Errore nella scrittura del file .env: ${error}`);
    process.exit(1);
  }
}

generateCryptoKeys();