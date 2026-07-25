import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './server/config/db.js';
import corsConfig from './server/config/cors.js';
import apiRoutes from './server/routes/api.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '.env')
});

// Résoudre le chemin du fichier .env en fonction de l'environnement
const envFilePath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

// Charger les variables d'environnement à partir du fichier
// En production sur Render, les variables sont injectées directement
// dans l'environnement — l'absence du fichier .env.production est normale.
const result = dotenv.config({
  path: path.resolve(__dirname, envFilePath),
  override: true
});

if (result.error && process.env.NODE_ENV !== 'production') {
    console.error('Erreur lors du chargement du fichier .env :', result.error);
    process.exit(1);
}

const app = express();

const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', isProd ? 1 : false);

app.disable('x-powered-by');
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb', parameterLimit: 100 }));
app.use(cookieParser());
app.use(cors(corsConfig));

const apiLimiter = rateLimit({
  skip: () => !isProd,
  windowMs: 15 * 60 * 1000,
  max: isProd ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, merci de réessayer plus tard.' },
});

/* Limite serrée sur les points d'entrée d'authentification : sans cela,
   le quota général (200-1000 req/15 min) laisserait passer une attaque
   par force brute sur les mots de passe. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.' },
});
 
app.use('/api', apiLimiter);
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/password'], authLimiter);
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime().toFixed(2),
    node: process.version,
    env: process.env.NODE_ENV,
    memory: process.memoryUsage().rss
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  /* Un 401/403/409 est une décision métier attendue (mauvais mot de passe,
     rôle insuffisant, double inscription) : on ne pollue pas les logs avec
     une pile d'appels. Seules les vraies pannes sont tracées. */
  if (status >= 500) console.error(err.stack || err);
  else console.warn(`${req.method} ${req.originalUrl} → ${status} : ${err.message}`);
 
  res.status(status).json({ error: isProd && status >= 500 ? 'Erreur interne du serveur' : err.message });
});

const PORT = Number(process.env.PORT) || 5001;
// const isMainModule = process.argv[1] && process.argv[1].endsWith('server.js');
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

const requiredEnv = ["JWT_SECRET", "DATABASE_URL", "AUTH_COOKIE_NAME"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is missing`);
  }
});

let server;
let connectDb;

const startServer = async () => {
  try {
    connectDb = await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/health`)
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

if (isMainModule) {
  startServer();
}

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing server...");
  if (server || connectDb) {
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
    
    await mongoose.disconnect();
  } else {
    process.exit(0);
  }
});
