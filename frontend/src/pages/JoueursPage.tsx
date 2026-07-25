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
    <div className="mx-auto w-full max-w-[120em] px-[3.2em] py-[3.6em]" style={{ color: INK }}>
      <div className="mb-[2.8em]">
        <h1 className="text-[3.2em] font-extrabold tracking-[-0.02em]">JOUEURS</h1>
        <p className="mt-[0.6em] text-[1.4em] text-gray-500">
          Tous les joueurs inscrits aux tournois de la plateforme.
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-[2em] flex items-center gap-[1em] rounded-[1.2em] border border-gray-200 bg-white px-[1.6em] py-[1.2em] shadow-[0_0.2em_0.8em_-0.4em_rgba(17,17,20,0.1)]">
        <Search className="h-[1.6em] w-[1.6em] shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un joueur ou un club…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-[1.3em] outline-none placeholder:text-gray-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-[1.2em] text-gray-400 hover:text-gray-700">✕</button>
        )}
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-[2em] flex gap-[2.4em]">
          <div className="flex items-center gap-[0.7em] text-[1.3em] text-gray-500">
            <Users className="h-[1.4em] w-[1.4em]" style={{ color: GOLD }} />
            <span><strong className="font-bold" style={{ color: INK }}>{players.length}</strong> joueurs</span>
          </div>
          <div className="flex items-center gap-[0.7em] text-[1.3em] text-gray-500">
            <Trophy className="h-[1.4em] w-[1.4em]" style={{ color: GOLD }} />
            <span><strong className="font-bold" style={{ color: INK }}>{tournaments.length}</strong> tournois</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-[1.4em] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-[11em] rounded-[1.6em]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-[20em] items-center justify-center rounded-[1.6em] border border-dashed border-gray-200 text-[1.4em] text-gray-400">
          {search ? 'Aucun résultat' : 'Aucun joueur pour le moment'}
        </div>
      ) : (
        <div className="grid gap-[1.4em] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <div
              key={`${p.id}-${p.tournament?.id}`}
              className="flex flex-col gap-[1em] rounded-[1.6em] border border-black/5 bg-white p-[1.8em] shadow-[0_0.4em_1.6em_-0.8em_rgba(17,17,20,0.12)]"
            >
              <div className="flex items-center gap-[1em]">
                <div
                  className="flex h-[4em] w-[4em] shrink-0 items-center justify-center rounded-full text-[1.4em] font-extrabold text-white"
                  style={{ backgroundColor: INK }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[1.4em] font-extrabold">{p.name}</p>
                  {p.club && (
                    <p className="flex items-center gap-[0.4em] truncate text-[1.1em] text-gray-500">
                      <MapPin className="h-[1em] w-[1em] shrink-0" style={{ color: GOLD }} />
                      {p.club}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-[1em] text-[1.15em]">
                <span className="font-mono font-bold" style={{ color: GOLD }}>
                  {p.rating > 0 ? `Elo ${p.rating}` : 'Non classé'}
                </span>
                {p.tournament && (
                  <span className="truncate text-right text-[0.95em] text-gray-400">{p.tournament.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
