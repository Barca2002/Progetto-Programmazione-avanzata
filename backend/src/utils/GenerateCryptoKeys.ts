import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

function generateCryptoKeys(): void {
  console.log('[Script] Generazione della coppia di chiavi RSA.');

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

  const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
  const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

  const envPath = path.join(process.cwd(), '.env');

  const envBlock = `
# --- JWT RSA KEYS GENERATED AT ${new Date().toISOString()} ---
JWT_PRIVATE_KEY="${privateKeyBase64}"
JWT_PUBLIC_KEY="${publicKeyBase64}"
`;

  try {
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