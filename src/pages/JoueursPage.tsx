import { useEffect, useState } from 'react';
import { Users, Search, MapPin, Trophy } from 'lucide-react';
import { api } from '../lib/api';
import { useTournaments } from '../hooks/useTournaments';
import type { Player, Tournament } from '../types';
import { INK, GOLD } from '../components/landing/tokens';

interface PlayerWithTournament extends Player {
  tournament?: Tournament;
}

export function JoueursPage() {
  const { tournaments } = useTournaments();
  const [players, setPlayers] = useState<PlayerWithTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tournaments.length === 0) return;
    Promise.all(
      tournaments.map((t) =>
        api.players.list(t.id).then((list) =>
          (list ?? []).map((p) => ({ ...p, tournament: t }))
        )
      )
    ).then((results) => {
      const seen = new Set<string>();
      const unique = results.flat().filter((p) => {
        const key = p.user_id ?? `${p.name}__${p.club ?? ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setPlayers(unique.sort((a, b) => b.rating - a.rating));
      setLoading(false);
    });
  }, [tournaments]);

  const filtered = players.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.club ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" style={{ color: INK }}>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">JOUEURS</h1>
        <p className="mt-2 text-sm text-gray-500">Tous les joueurs inscrits aux tournois de la plateforme.</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un joueur ou un club…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-700">✕</button>
        )}
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-5 flex gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" style={{ color: GOLD }} />
            <span><strong className="font-bold" style={{ color: INK }}>{players.length}</strong> joueurs</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Trophy className="h-4 w-4" style={{ color: GOLD }} />
            <span><strong className="font-bold" style={{ color: INK }}>{tournaments.length}</strong> tournois</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
          {search ? 'Aucun résultat' : 'Aucun joueur pour le moment'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <div
              key={`${p.id}-${p.tournament?.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                  style={{ backgroundColor: INK }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{p.name}</p>
                  {p.club && (
                    <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" style={{ color: GOLD }} />
                      {p.club}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
                <span className="font-mono font-bold" style={{ color: GOLD }}>
                  {p.rating > 0 ? `Elo ${p.rating}` : 'Non classé'}
                </span>
                {p.tournament && (
                  <span className="truncate text-right text-gray-400">{p.tournament.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
