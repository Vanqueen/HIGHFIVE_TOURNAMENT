import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { setOrigin } from './setOrigin.js';
import Origins from './corsOrigin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const mode = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

for (const envFile of ['.env', mode]) {
  dotenv.config({ path: path.resolve(rootDir, envFile) });
}

const normalizeOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const getFrontendPort = () => {
  const raw = process.env.VITE_PORT || process.env.FRONTEND_PORT || 5173;
  const port = Number(raw);
  return Number.isFinite(port) && port > 0 ? port : 5173;
};

const getCorsOrigins = () => {
  const configuredOrigins = normalizeOrigins(process.env.CORS_ORIGIN);
  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN est requis en production. Ajoutez-le dans les variables Render.');
  }

  const port = getFrontendPort();
  console.log(`⚠️  CORS_ORIGIN non défini : autorisation par défaut pour localhost:${port}`);
  return [`http://localhost:${port}`, `http://127.0.0.1:${port}`, process.env.CORS_ORIGIN].filter(Boolean);
};

const allowedOrigins = Origins ? Origins : getCorsOrigins();

const corsConfig = {
  origin: setOrigin(allowedOrigins),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

export { corsConfig, getCorsOrigins, getFrontendPort };
export default corsConfig;
