/* ------------------------------------------------------------------ */
/*  Jeu de démonstration — entièrement réversible.                     */
/*                                                                     */
/*  Tout ce qui est créé ici porte une marque : les tournois ont une    */
/*  description préfixée [DEMO], les comptes sont en @demo.vipp.local. */
/*  `--clear` supprime exactement ces documents, rien d'autre.         */
/*                                                                     */
/*  Usage :                                                            */
/*    npm run seed:demo            crée le jeu de démonstration        */
/*    npm run seed:demo -- --clear le supprime                         */
/* ------------------------------------------------------------------ */
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Tournament from '../models/Tournament.js';
import Player from '../models/Player.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import * as authService from '../services/authService.js';

const root = process.cwd();
const mode = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
for (const file of ['.env', mode]) dotenv.config({ path: path.resolve(root, file) });

const MARK = '[DEMO]';
const DEMO_DOMAIN = '@demo.vipp.local';
const DEMO_PLAYER_EMAIL = `joueur${DEMO_DOMAIN}`;
const DEMO_PLAYER_PASSWORD = 'demo12345';

const NAMES = [
  ['Camille Rousset', 'Échiquier de Lyon', 1982],
  ['Théo Marchand', 'Cavalier Grenoblois', 1874],
  ['Inès Bouvier', 'Tour de Chambéry', 1815],
  ['Malik Sarr', 'Échiquier de Lyon', 1790],
  ['Léa Fontaine', 'Fou de Valence', 1743],
  ['Hugo Delaunay', 'Cavalier Grenoblois', 1688],
  ['Sofia Bianchi', 'Tour de Chambéry', 1602],
  ['Noé Perrin', 'Fou de Valence', 1521],
];

const clear = process.argv.includes('--clear');

const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
if (!uri) {
  console.error('DATABASE_URL/MONGO_URI introuvable : vérifiez votre fichier .env.');
  process.exit(1);
}

await mongoose.connect(uri);

/* ------------------------------ purge ------------------------------ */
const purge = async () => {
  const tournaments = await Tournament.find({ description: new RegExp(`^\\${MARK}`) }).select('_id');
  const ids = tournaments.map((t) => t._id);
  const matches = await Match.deleteMany({ tournament_id: { $in: ids } });
  const players = await Player.deleteMany({ tournament_id: { $in: ids } });
  const removed = await Tournament.deleteMany({ _id: { $in: ids } });
  const users = await User.deleteMany({ email: new RegExp(`${DEMO_DOMAIN.replace('.', '\\.')}$`) });
  return { tournaments: removed.deletedCount, players: players.deletedCount, matches: matches.deletedCount, users: users.deletedCount };
};

if (clear) {
  const stats = await purge();
  console.log(
    `\n🧹 Démo supprimée → tournois: ${stats.tournaments}, joueurs: ${stats.players}, ` +
      `parties: ${stats.matches}, comptes: ${stats.users}\n`
  );
  await mongoose.disconnect();
  process.exit(0);
}

/* On repart d'une base propre pour rester idempotent. */
await purge();

const organizer = await User.findOne({ role: 'organizer' }).sort({ created_at: 1 });
if (!organizer) {
  console.error(
    "\n❌ Aucun organisateur en base. Créez-en un d'abord :\n" +
      '   npm run create-organizer -- --email vous@exemple.com --name "Votre Nom" --password "motdepasse"\n'
  );
  await mongoose.disconnect();
  process.exit(1);
}

/* Compte joueur de démonstration, pour visiter l'espace joueur. */
const demoPlayer = await authService.register({
  email: DEMO_PLAYER_EMAIL,
  password: DEMO_PLAYER_PASSWORD,
  full_name: 'Camille Rousset',
  club: 'Échiquier de Lyon',
});

/* --------------------------- fabrication --------------------------- */

/* Résultats déterministes et plausibles : le mieux classé de la table
   l'emporte, avec des nulles régulières et quelques surprises. `variant`
   décale la série d'un tournoi à l'autre pour éviter deux grilles
   identiques. Aucun aléa : le jeu de démo est reproductible. */
const decide = (index, round, variant, strongerIsWhite) => {
  if ((index + round * 2 + variant) % 3 === 0) return 'draw';
  const upset = (index + round + variant) % 7 === 0;
  const strongerWins = !upset;
  return strongerWins === strongerIsWhite ? 'white' : 'black';
};

const buildTournament = async ({ name, location, start_date, status, total_rounds, current_round, playersCount, playedRounds, pendingInCurrent, variant = 0 }) => {
  const tournament = await Tournament.create({
    organizer_id: organizer._id,
    name,
    location,
    description: `${MARK} Jeu de démonstration — supprimable avec npm run seed:demo -- --clear`,
    start_date,
    status,
    total_rounds,
    current_round,
  });

  const roster = NAMES.slice(0, playersCount);
  const players = await Player.insertMany(
    roster.map(([playerName, club, rating], i) => ({
      tournament_id: tournament._id,
      /* Le premier joueur est rattaché au compte de démonstration : c'est
         lui qu'on verra dans l'espace joueur. */
      user_id: i === 0 ? demoPlayer.id : null,
      name: playerName,
      email: i === 0 ? DEMO_PLAYER_EMAIL : null,
      club,
      rating,
      seed_number: i + 1,
      points: 0,
    }))
  );

  const points = new Map(players.map((p) => [p.id.toString(), 0]));
  const matches = [];

  for (let round = 1; round <= playedRounds; round += 1) {
    for (let i = 0; i < players.length - 1; i += 2) {
      /* L'alternance des couleurs d'une ronde à l'autre reproduit la règle
         du système suisse. */
      const swap = round % 2 === 0;
      const white = swap ? players[i + 1] : players[i];
      const black = swap ? players[i] : players[i + 1];

      const isCurrent = round === current_round;
      const stillOpen = isCurrent && i / 2 < pendingInCurrent;
      /* Le mieux classé de la table est players[i] : il a les blancs
         quand la ronde n'inverse pas les couleurs. */
      const result = stillOpen ? 'pending' : decide(i, round, variant, !swap);

      if (result === 'white') points.set(white.id.toString(), points.get(white.id.toString()) + 1);
      if (result === 'black') points.set(black.id.toString(), points.get(black.id.toString()) + 1);
      if (result === 'draw') {
        points.set(white.id.toString(), points.get(white.id.toString()) + 0.5);
        points.set(black.id.toString(), points.get(black.id.toString()) + 0.5);
      }

      matches.push({
        tournament_id: tournament._id,
        round,
        white_player_id: white._id,
        black_player_id: black._id,
        board_number: i / 2 + 1,
        result,
      });
    }
  }

  if (matches.length) await Match.insertMany(matches);
  for (const [id, total] of points) await Player.findByIdAndUpdate(id, { points: total });

  return { tournament, players: players.length, matches: matches.length };
};

const built = [];

/* Ronde 4 entamée, 2 résultats manquants → tâche « résultats à saisir »
   et, côté joueur, un appariement en attente. */
built.push(
  await buildTournament({
    name: 'Open d’hiver de Lyon',
    location: 'Lyon',
    start_date: '2026-08-14',
    status: 'in_progress',
    total_rounds: 7,
    current_round: 4,
    playersCount: 8,
    playedRounds: 4,
    pendingInCurrent: 2,
  })
);

/* Ronde 3 complète → tâche « lancer la ronde 4 ». */
built.push(
  await buildTournament({
    name: 'Mémorial Tal',
    location: 'Genève',
    start_date: '2026-07-03',
    status: 'in_progress',
    total_rounds: 5,
    current_round: 3,
    playersCount: 6,
    playedRounds: 3,
    pendingInCurrent: 0,
    variant: 1,
  })
);

/* Inscriptions ouvertes → tâche « prêt à démarrer », et visible depuis
   l'espace joueur dans « Tournois ouverts ». */
built.push(
  await buildTournament({
    name: 'Coupe VIPP Digital',
    location: 'Annecy',
    start_date: '2026-09-26',
    status: 'registration',
    total_rounds: 9,
    current_round: 0,
    playersCount: 4,
    playedRounds: 0,
    pendingInCurrent: 0,
  })
);

/* ---------------------------------------------------------------- */
/*  Tournoi à phase finale : poule jouée jusqu'au bout, arbre lancé.  */
/*  Une demi-finale est tranchée, l'autre attend son résultat — de    */
/*  quoi voir l'arbre se remplir en direct.                          */
/* ---------------------------------------------------------------- */

/* Ordre des têtes de série dans l'arbre : identique à seedOrder() du
   moteur, réécrit ici pour que le script reste autonome. */
const seedOrder = (size) => {
  let order = [1, 2];
  while (order.length < size) {
    const doubled = order.length * 2;
    const next = [];
    for (const seed of order) next.push(seed, doubled + 1 - seed);
    order = next;
  }
  return order;
};

const QUALIFIERS = 4;

const playoff = await buildTournament({
  name: 'Trophée VIPP Digital',
  location: 'Lyon',
  start_date: '2026-08-28',
  status: 'in_progress',
  total_rounds: 3,
  current_round: 3,
  playersCount: 8,
  playedRounds: 3,
  pendingInCurrent: 0,
  variant: 2,
});

await Tournament.findByIdAndUpdate(playoff.tournament._id, {
  format: 'swiss_playoff',
  qualifiers: QUALIFIERS,
  phase: 'playoff',
  playoff_round: 1,
});

/* Classement de la poule : points, puis Elo — la règle du moteur. */
const pool = await Player.find({ tournament_id: playoff.tournament._id });
const ranked = [...pool].sort(
  (a, b) => b.points - a.points || b.rating - a.rating || a.name.localeCompare(b.name)
);
const qualified = ranked.slice(0, QUALIFIERS);
const order = seedOrder(QUALIFIERS);

const semis = [];
for (let i = 0; i < order.length; i += 2) {
  semis.push({
    tournament_id: playoff.tournament._id,
    phase: 'playoff',
    round: 1,
    white_player_id: qualified[order[i] - 1]._id,
    black_player_id: qualified[order[i + 1] - 1]._id,
    board_number: i / 2 + 1,
    /* La première demi-finale est jouée, la seconde attend : l'arbre
       montre ainsi un qualifié déjà monté et une case à déterminer. */
    result: i === 0 ? 'white' : 'pending',
  });
}
await Match.insertMany(semis);

built.push({ tournament: playoff.tournament, players: pool.length, matches: playoff.matches + semis.length });

console.log('\n✅ Jeu de démonstration créé');
for (const b of built) {
  console.log(`   ${b.tournament.name} — ${b.players} joueurs, ${b.matches} parties`);
}
console.log(`\n   Organisateur : ${organizer.email} (votre compte existant)`);
console.log(`   Joueur démo  : ${DEMO_PLAYER_EMAIL} / ${DEMO_PLAYER_PASSWORD}`);
console.log('\n   Pour tout retirer : npm run seed:demo -- --clear\n');

await mongoose.disconnect();
