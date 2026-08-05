import type { MatchData } from "@/lib/types";

function participantName(
  p: { teamName: string | null; user: { name: string } } | null,
): string {
  if (!p) return "—";
  return p.teamName || p.user.name;
}

export function Bracket({ matches }: { matches: MatchData[] }) {
  if (matches.length === 0) return null;

  const rounds = new Map<number, MatchData[]>();
  for (const match of matches) {
    const list = rounds.get(match.round) ?? [];
    list.push(match);
    rounds.set(match.round, list);
  }
  const roundNumbers = [...rounds.keys()].sort((a, b) => a - b);
  const maxRound = roundNumbers[roundNumbers.length - 1];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {roundNumbers.map((round) => (
          <div key={round} className="flex flex-col justify-around gap-4 min-w-[220px]">
            <p
              className="text-xs uppercase tracking-widest font-bold text-center"
              style={{ color: "var(--org-text-muted)" }}
            >
              {roundLabel(round, maxRound)}
            </p>
            {rounds
              .get(round)!
              .sort((a, b) => a.position - b.position)
              .map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: MatchData }) {
  return (
    <div className="org-surface rounded-md overflow-hidden text-sm">
      <Row
        name={participantName(match.participantA)}
        score={match.scoreA}
        winner={match.winnerId !== null && match.winnerId === match.participantA?.id}
      />
      <div
        style={{
          height: 1,
          background: "color-mix(in srgb, var(--org-text) 10%, transparent)",
        }}
      />
      <Row
        name={participantName(match.participantB)}
        score={match.scoreB}
        winner={match.winnerId !== null && match.winnerId === match.participantB?.id}
      />
    </div>
  );
}

function Row({
  name,
  score,
  winner,
}: {
  name: string;
  score: number | null;
  winner: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 gap-4"
      style={winner ? { color: "var(--org-accent)", fontWeight: 800 } : undefined}
    >
      <span className="truncate">{name}</span>
      <span className="tabular-nums font-bold">{score ?? ""}</span>
    </div>
  );
}

function roundLabel(round: number, maxRound: number): string {
  const fromEnd = maxRound - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinales";
  if (fromEnd === 2) return "Cuartos";
  return `Ronda ${round}`;
}
