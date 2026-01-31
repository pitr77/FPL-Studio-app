import React, { useMemo, useState } from 'react';
import { FPLPlayer, FPLTeam } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label, LabelList } from 'recharts';
import { Radar, Target, Zap, Info, Crosshair, Lightbulb, Activity, Users, Shield, Lock } from 'lucide-react';

interface DetailedStatsProps {
  players: FPLPlayer[];
  teams: FPLTeam[];
}

const DetailedStats: React.FC<DetailedStatsProps> = ({ players, teams }) => {
  const [defStatsTab, setDefStatsTab] = useState<'DEF' | 'GKP'>('DEF');

  // --- 1. Differential Hunter Data ---
  const differentialData = useMemo(() => {
    // Filter for active players with decent form to reduce noise
    return players
      .filter(p => parseFloat(p.form) > 2.0)
      .map(p => ({
        name: p.web_name,
        x: parseFloat(p.selected_by_percent), // Ownership
        y: parseFloat(p.form), // Form
        team: teams.find(t => t.id === p.team)?.short_name,
        price: p.now_cost / 10,
        id: p.id
      }));
  }, [players, teams]);

  // Sort by Form (Y) descending and take Top 10 for charts and tables
  const lowOwnershipData = useMemo(() => 
    differentialData
        .filter(d => d.x < 20)
        .sort((a, b) => b.y - a.y)
        .slice(0, 10)
  , [differentialData]);

  const highOwnershipData = useMemo(() => 
    differentialData
        .filter(d => d.x >= 20)
        .sort((a, b) => b.y - a.y)
        .slice(0, 10)
  , [differentialData]);

  // --- 2. Bonus Point Kings Data ---
  const bonusKings = useMemo(() => {
    return [...players]
      .sort((a, b) => b.bps - a.bps)
      .slice(0, 10);
  }, [players]);

  // --- 3. Defensive Contribution Data ---
  const defensiveKings = useMemo(() => {
     const typeId = defStatsTab === 'DEF' ? 2 : 1;
     
     return players
       .filter(p => p.element_type === typeId)
       .map(p => {
           // Calculate Defensive Points manually
           let defPoints = 0;
           
           // Clean Sheets: GKP/DEF = 4
           defPoints += (p.clean_sheets * 4);

           // Saves: 1 pt for every 3 saves
           defPoints += Math.floor(p.saves / 3);

           // Pen Saves: 5 pts
           defPoints += (p.penalties_saved * 5);

           return {
               ...p,
               defensive_points: defPoints
           };
       })
       .sort((a, b) => b.defensive_points - a.defensive_points)
       .slice(0, 10);
  }, [players, defStatsTab]);

  // --- 4. ICT Breakdown Data ---
  const ictData = useMemo(() => {
    return {
      influence: [...players].sort((a, b) => parseFloat(b.influence) - parseFloat(a.influence)).slice(0, 5),
      creativity: [...players].sort((a, b) => parseFloat(b.creativity) - parseFloat(a.creativity)).slice(0, 5),
      threat: [...players].sort((a, b) => parseFloat(b.threat) - parseFloat(a.threat)).slice(0, 5),
    };
  }, [players]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 p-3 border border-slate-700 rounded shadow-xl z-50">
          <p className="text-white font-bold">{data.name}</p>
          <p className="text-slate-400 text-xs">{data.team} • £{data.price}</p>
          <div className="mt-2 space-y-1 text-xs">
            <p className="text-blue-400">Ownership: {data.x}%</p>
            <p className="text-green-400">Form: {data.y}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const RenderTable = ({ data }: { data: typeof lowOwnershipData }) => (
    <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse text-sm">
            <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-700">
                    <th className="p-2 w-10 text-center">#</th>
                    <th className="p-2">Player</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Ownership</th>
                    <th className="p-2 text-right text-green-400">Form</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
                {data.map((p, i) => (
                    <tr key={p.id} className="hover:bg-slate-700/30">
                        <td className="p-2 text-center text-slate-500 font-mono">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-200">
                            {p.name} <span className="text-slate-500 font-normal text-xs">({p.team})</span>
                        </td>
                        <td className="p-2 text-right font-mono text-blue-300">£{p.price}</td>
                        <td className="p-2 text-right text-slate-300">{p.x}%</td>
                        <td className="p-2 text-right font-bold text-white">{p.y}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
           <Activity className="text-purple-400" /> Detailed Analyses
        </h2>
        <p className="text-slate-400">Deep dive into underlying statistics to find hidden edges.</p>
      </div>

      {/* SECTION 1: DIFFERENTIAL HUNTER */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start">
           <div className="flex-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                 <Crosshair className="text-red-400" /> The Differential Hunter
              </h3>
              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-slate-300">
                 <Info className="text-blue-400 shrink-0" size={18} />
                 <div>
                    <p className="font-bold text-white mb-1">What is this?</p>
                    <p>
                       This chart plots <strong>Ownership %</strong> (X-axis) against <strong>Current Form</strong> (Y-axis).
                    </p>
                    <p className="mt-2">
                       We are showing the <strong>Top 10 players</strong> in each category (Low vs High Ownership) based on form.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Graph 1: Low Ownership (< 20%) */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col">
               <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                   <h4 className="font-bold text-white flex items-center gap-2">
                       <Lightbulb className="text-yellow-400" size={18} /> 
                       Hidden Gems (&lt; 20%)
                   </h4>
                   <span className="text-xs text-slate-500">True Differentials</span>
               </div>
               
               <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                         <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="Ownership" 
                            unit="%" 
                            domain={[0, 20]} // Fixed domain for readability
                            stroke="#94a3b8"
                         >
                            <Label value="Ownership %" offset={-10} position="insideBottom" fill="#64748b" style={{ fontSize: '12px' }} />
                         </XAxis>
                         <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Form" 
                            stroke="#94a3b8" 
                            domain={['auto', 'auto']}
                         >
                            <Label value="Form" angle={-90} position="insideLeft" offset={10} fill="#64748b" style={{ fontSize: '12px' }} />
                         </YAxis>
                         <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} offset={30} />
                         <Scatter name="Players" data={lowOwnershipData} fill="#8884d8">
                            {lowOwnershipData.map((entry, index) => (
                              <Cell key={`cell-low-${index}`} fill={entry.y > 6 ? '#eab308' : '#818cf8'} />
                            ))}
                            <LabelList dataKey="name" position="top" offset={5} style={{ fontSize: '10px', fill: '#cbd5e1' }} />
                         </Scatter>
                      </ScatterChart>
                   </ResponsiveContainer>
               </div>
               
               {/* Table for Low Ownership */}
               <RenderTable data={lowOwnershipData} />
            </div>

            {/* Graph 2: High Ownership (>= 20%) */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col">
               <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                   <h4 className="font-bold text-white flex items-center gap-2">
                       <Users className="text-blue-400" size={18} /> 
                       The Template (&ge; 20%)
                   </h4>
                   <span className="text-xs text-slate-500">Popular Assets</span>
               </div>
               
               <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                         <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="Ownership" 
                            unit="%" 
                            domain={[20, 'auto']} 
                            stroke="#94a3b8"
                         >
                             <Label value="Ownership %" offset={-10} position="insideBottom" fill="#64748b" style={{ fontSize: '12px' }} />
                         </XAxis>
                         <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Form" 
                            stroke="#94a3b8" 
                            domain={['auto', 'auto']}
                         >
                            <Label value="Form" angle={-90} position="insideLeft" offset={10} fill="#64748b" style={{ fontSize: '12px' }} />
                         </YAxis>
                         <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} offset={30} />
                         <Scatter name="Players" data={highOwnershipData} fill="#8884d8">
                            {highOwnershipData.map((entry, index) => (
                              <Cell key={`cell-high-${index}`} fill={'#22c55e'} />
                            ))}
                            <LabelList dataKey="name" position="top" offset={5} style={{ fontSize: '10px', fill: '#cbd5e1' }} />
                         </Scatter>
                      </ScatterChart>
                   </ResponsiveContainer>
               </div>

               {/* Table for High Ownership */}
               <RenderTable data={highOwnershipData} />
            </div>
        </div>
      </div>

      {/* SECTION 2: DEFENSIVE CONTRIBUTION (UPDATED) */}
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Shield className="text-blue-400" /> Defensive Titans
         </h3>
         <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-slate-300">
            <Lock className="text-blue-400 shrink-0" size={18} />
            <div>
               <p className="font-bold text-white mb-1">True Defensive Points & BPS</p>
               <p>
                  This table calculates points earned purely from defensive actions: <strong>Clean Sheets</strong>, <strong>Saves</strong>, and <strong>Penalty Saves</strong>.
                  <br/>
                  We also show <strong>BPS</strong> (Bonus Points System), which reflects defensive contributions like Clearances, Blocks, and Interceptions.
               </p>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-2">
            <button 
                onClick={() => setDefStatsTab('DEF')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${defStatsTab === 'DEF' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
            >
                Defenders
            </button>
            <button 
                onClick={() => setDefStatsTab('GKP')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${defStatsTab === 'GKP' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
            >
                Goalkeepers
            </button>
         </div>

         <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                  <tr>
                     <th className="p-3">Rank</th>
                     <th className="p-3">Player</th>
                     <th className="p-3 text-right">Clean Sheets</th>
                     {defStatsTab === 'GKP' && <th className="p-3 text-right">Saves</th>}
                     <th className="p-3 text-right text-yellow-400">BPS</th>
                     <th className="p-3 text-right font-bold text-white">Def. Points</th>
                     <th className="p-3 text-right">Total Pts</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50 text-sm">
                  {defensiveKings.map((p, i) => (
                     <tr key={p.id} className="hover:bg-slate-700/30">
                        <td className="p-3 text-slate-500 font-mono">#{i+1}</td>
                        <td className="p-3 font-bold text-white">
                           {p.web_name} <span className="text-slate-500 text-xs font-normal">({teams.find(t=>t.id===p.team)?.short_name})</span>
                        </td>
                        <td className="p-3 text-right text-slate-300">{p.clean_sheets}</td>
                        {defStatsTab === 'GKP' && <td className="p-3 text-right text-slate-300">{p.saves}</td>}
                        <td className="p-3 text-right font-mono text-yellow-400/80">{p.bps}</td>
                        <td className="p-3 text-right font-mono text-blue-400 font-bold bg-blue-900/10">
                            {p.defensive_points}
                        </td>
                        <td className="p-3 text-right text-slate-500 text-xs">{p.total_points}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* SECTION 3: BONUS POINT KINGS */}
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Target className="text-yellow-400" /> Bonus Point Kings
         </h3>
         <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-slate-300">
            <Info className="text-blue-400 shrink-0" size={18} />
            <div>
               <p className="font-bold text-white mb-1">What is BPS?</p>
               <p>
                  The <strong>Bonus Points System (BPS)</strong> decides who gets the extra 3, 2, and 1 points after a match. 
                  Players high on this list are "magnets" for bonus points because they perform actions the algorithm loves 
                  (pass completion, interceptions, dribbles) even if they don't score.
               </p>
            </div>
         </div>

         <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                  <tr>
                     <th className="p-3">Rank</th>
                     <th className="p-3">Player</th>
                     <th className="p-3 text-right">BPS Total</th>
                     <th className="p-3 text-right">Points</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50 text-sm">
                  {bonusKings.map((p, i) => (
                     <tr key={p.id} className="hover:bg-slate-700/30">
                        <td className="p-3 text-slate-500 font-mono">#{i+1}</td>
                        <td className="p-3 font-bold text-white">
                           {p.web_name} <span className="text-slate-500 text-xs font-normal">({teams.find(t=>t.id===p.team)?.short_name})</span>
                        </td>
                        <td className="p-3 text-right font-mono text-yellow-400 font-bold">{p.bps}</td>
                        <td className="p-3 text-right text-slate-300">{p.total_points}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* SECTION 4: ICT BREAKDOWN */}
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Radar className="text-green-400" /> ICT Breakdown
         </h3>
         <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-slate-300">
            <Info className="text-blue-400 shrink-0" size={18} />
            <div>
               <p className="font-bold text-white mb-1">Understanding ICT</p>
               <p className="mb-1"><strong>Influence:</strong> Measures impact on the match outcome (Best for Captains).</p>
               <p className="mb-1"><strong>Creativity:</strong> Likelihood of delivering assists (Best for Midfielders).</p>
               <p><strong>Threat:</strong> Likelihood of scoring goals (Best for Strikers/Wingers).</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Influence */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
               <h4 className="text-slate-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                  <Lightbulb size={14} className="text-yellow-400" /> Top Influence
               </h4>
               <ul className="space-y-2">
                  {ictData.influence.map((p, i) => (
                     <li key={p.id} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                        <span className="text-sm font-bold text-white">{i+1}. {p.web_name}</span>
                        <span className="text-xs font-mono text-yellow-400">{p.influence}</span>
                     </li>
                  ))}
               </ul>
            </div>

            {/* Creativity */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
               <h4 className="text-slate-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-blue-400" /> Top Creativity
               </h4>
               <ul className="space-y-2">
                  {ictData.creativity.map((p, i) => (
                     <li key={p.id} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                        <span className="text-sm font-bold text-white">{i+1}. {p.web_name}</span>
                        <span className="text-xs font-mono text-blue-400">{p.creativity}</span>
                     </li>
                  ))}
               </ul>
            </div>

            {/* Threat */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
               <h4 className="text-slate-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">
                  <Target size={14} className="text-red-400" /> Top Threat
               </h4>
               <ul className="space-y-2">
                  {ictData.threat.map((p, i) => (
                     <li key={p.id} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                        <span className="text-sm font-bold text-white">{i+1}. {p.web_name}</span>
                        <span className="text-xs font-mono text-red-400">{p.threat}</span>
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>

    </div>
  );
};

export default DetailedStats;