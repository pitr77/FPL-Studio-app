import React, { useState } from 'react';
import { FPLPlayer, FPLTeam, FPLEvent } from '../types';
import { getPlayerSummary } from '../services/fplService';
import { CalendarRange, RefreshCw, AlertCircle, Info } from 'lucide-react';

interface PeriodAnalysisProps {
  players: FPLPlayer[];
  teams: FPLTeam[];
  events: FPLEvent[];
}

interface AggregatedStats {
  id: number;
  web_name: string;
  team: string;
  element_type: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
  total_points: number;
  ownership: string;
}

const PeriodAnalysis: React.FC<PeriodAnalysisProps> = ({ players, teams, events }) => {
  const [fromGw, setFromGw] = useState<number>(1);
  const [toGw, setToGw] = useState<number>(events.find(e => e.is_current)?.id || 38);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AggregatedStats[]>([]);

  const gameweeks = events.map(e => e.id);

  const handleAnalyze = async () => {
    if (fromGw > toGw) {
      setError("Start Gameweek must be before End Gameweek.");
      return;
    }
    setLoading(true);
    setError(null);
    setData([]);

    try {
      // To avoid overloading the proxy/API, we only fetch detailed stats for the Top 50 players
      // sorted by total_points. In a real app with a backend, we would fetch all.
      const topPlayers = [...players]
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 50);

      // Create an array of promises to fetch data in parallel (with caution)
      const promises = topPlayers.map(async (player) => {
        try {
          const summary = await getPlayerSummary(player.id);
          
          // Filter history for the selected range
          const relevantHistory = summary.history.filter(
            h => h.round >= fromGw && h.round <= toGw
          );

          // Aggregate stats
          const agg = relevantHistory.reduce((acc, match) => ({
            goals: acc.goals + match.goals_scored,
            assists: acc.assists + match.assists,
            clean_sheets: acc.clean_sheets + match.clean_sheets,
            bonus: acc.bonus + match.bonus,
            total_points: acc.total_points + match.total_points
          }), { goals: 0, assists: 0, clean_sheets: 0, bonus: 0, total_points: 0 });

          return {
            id: player.id,
            web_name: player.web_name,
            team: teams.find(t => t.id === player.team)?.short_name || "UNK",
            element_type: player.element_type,
            ownership: player.selected_by_percent,
            ...agg
          };
        } catch (err) {
          console.warn(`Failed to fetch history for ${player.web_name}`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      
      // Filter out failed requests and sort by points
      const validResults = results
        .filter((r): r is AggregatedStats => r !== null)
        .sort((a, b) => b.total_points - a.total_points);

      setData(validResults);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch player data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <CalendarRange className="text-purple-400" /> Period Analysis
            </h2>
            <p className="text-slate-400 text-sm">
              Analyze player performance over a specific range of Gameweeks.
              <br />
              <span className="text-xs opacity-70">*Currently limited to the Top 50 active players to optimize performance.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase">From GW</label>
              <select 
                value={fromGw}
                onChange={(e) => setFromGw(Number(e.target.value))}
                className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 w-24 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {gameweeks.map(gw => <option key={gw} value={gw}>{gw}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase">To GW</label>
              <select 
                value={toGw}
                onChange={(e) => setToGw(Number(e.target.value))}
                className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 w-24 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {gameweeks.map(gw => <option key={gw} value={gw}>{gw}</option>)}
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Analyze Period'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 p-3 rounded flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      {data.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
             <h3 className="font-bold text-white">Top-scoring players, GW{fromGw}-{toGw}</h3>
             <span className="text-xs text-slate-500">Scroll across for more</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Player</th>
                  <th className="p-4 text-right">Ownership</th>
                  <th className="p-4 text-right">G+A</th>
                  <th className="p-4 text-right">Clean Sheets*</th>
                  <th className="p-4 text-right">Bonus</th>
                  <th className="p-4 text-right font-bold text-white">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {data.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{p.web_name}</div>
                      <div className="text-xs text-slate-500">{p.team}</div>
                    </td>
                    <td className="p-4 text-right font-mono text-blue-300">{p.ownership}%</td>
                    <td className="p-4 text-right font-mono text-slate-300">{p.goals + p.assists}</td>
                    <td className="p-4 text-right font-mono text-slate-300">
                        {/* Only meaningful for DEF/GKP/MID usually, but we show raw count */}
                        {p.element_type === 4 ? 'N/A' : p.clean_sheets}
                    </td>
                    <td className="p-4 text-right font-mono text-yellow-400">{p.bonus}</td>
                    <td className="p-4 text-right font-bold text-green-400 text-base">{p.total_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-900/30 text-xs text-slate-500 flex items-center gap-2">
             <Info size={14} />
             *Defenders earn four points per clean sheet, while midfielders earn one point.
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodAnalysis;