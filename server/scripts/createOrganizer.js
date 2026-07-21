/* ------------------------------------------------------------------ */
/*  Amorçage du premier organisateur.                                  */
/*                                                                     */
/*  Le rôle organisateur ne s'obtient que par cooptation : il faut donc */
/*  un premier compte créé hors ligne, ici. Ensuite, cet organisateur   */
/*  crée les suivants depuis son espace.                               */
/*                                                                     */
/*  Usage :                                                            */
/*    npm run create-organizer -- --email a@b.c --name "Nom" \         */
/*                                --password "motdepasse" \            */
/*                                [--organization "Club"]              */
/* ------------------------------------------------------------------ */
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as authService from '../services/authService.js';

const root = process.cwd();
const mode = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
for (const file of ['.env', mode]) dotenv.config({ path: path.resolve(root, file) });

/* Analyse minimaliste de --clé valeur. */
const parseArgs = (argv) => {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = value;
      i += 1;
    }
  }
  return out;
};

const args = parseArgs(process.argv.slice(2));

const email = args.email ?? process.env.BOOTSTRAP_ORGANIZER_EMAIL;
const full_name = args.name ?? process.env.BOOTSTRAP_ORGANIZER_NAME;
const password = args.password ?? process.env.BOOTSTRAP_ORGANIZER_PASSWORD;
const organization = args.organization ?? process.env.BOOTSTRAP_ORGANIZER_ORG ?? null;

if (!email || !full_name || !password) {
  console.error(
    'Arguments manquants.\n\n' +
      '  npm run create-organizer -- --email a@b.c --name "Nom Complet" --password "motdepasse" [--organization "Club"]\n'
  );
  process.exit(1);
}

const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
if (!uri) {
  console.error('DATABASE_URL/MONGO_URI introuvable : vérifiez votre fichier .env.');
  process.exit(1);
}

try {
  await mongoose.connect(uri);

  const user = await authService.bootstrapOrganizer({ email, full_name, password, organization });

  console.log('\n✅ Organisateur créé');
  console.log(`   nom    : ${user.full_name}`);
  console.log(`   e-mail : ${user.email}`);
  if (user.organization) console.log(`   entité : ${user.organization}`);
  console.log('\nConnectez-vous avec ce compte, puis créez les autres organisateurs depuis votre espace.\n');
} catch (err) {
  console.error(`\n❌ ${err.message}\n`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
