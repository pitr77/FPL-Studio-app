import React, { useState } from 'react';
import { BootstrapStatic, FPLFixture } from '../types';
import PeriodAnalysis from './PeriodAnalysis';
import TransferPicks from './TransferPicks';
import TeamAnalysis from './TeamAnalysis';
import Fixtures from './Fixtures';
import PlayerStats from './PlayerStats';
import LeagueTable from './LeagueTable';
import DetailedStats from './DetailedStats';
import { Split } from 'lucide-react';

interface CompareModeProps {
  data: BootstrapStatic;
  fixtures: FPLFixture[];
}

const VIEWS: Record<string, string> = {
  PERIOD: 'Period Analysis',
  TRANSFER: 'Transfer Picks',
  TEAM: 'Team Analysis',
  FIXTURES: 'Fixtures',
  STATS: 'Player Stats',
  TABLE: 'League Table',
  DETAILED: 'Detailed Stats'
};

const CompareMode: React.FC<CompareModeProps> = ({ data, fixtures }) => {
  const [leftView, setLeftView] = useState<string>('PERIOD');
  const [rightView, setRightView] = useState<string>('TRANSFER');

  const renderComponent = (viewKey: string) => {
    switch (viewKey) {
      case 'PERIOD':
        return <PeriodAnalysis players={data.elements} teams={data.teams} events={data.events} />;
      case 'TRANSFER':
        return <TransferPicks players={data.elements} teams={data.teams} fixtures={fixtures} events={data.events} />;
      case 'TEAM':
        return <TeamAnalysis teams={data.teams} fixtures={fixtures} />;
      case 'FIXTURES':
        return <Fixtures fixtures={fixtures} teams={data.teams} events={data.events} players={data.elements} />;
      case 'STATS':
        return <PlayerStats players={data.elements} teams={data.teams} />;
      case 'TABLE':
        return <LeagueTable teams={data.teams} fixtures={fixtures} />;
      case 'DETAILED':
        return <DetailedStats players={data.elements} teams={data.teams} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Split className="text-purple-400" /> Compare Mode
            </h2>
            <p className="text-slate-400 text-xs">View two tools side-by-side for deeper analysis.</p>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        
        {/* Left Pane */}
        <div className="flex flex-col bg-slate-900/30 rounded-xl border border-slate-700/50 overflow-hidden">
           <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">Left Panel</label>
              <select
                value={leftView}
                onChange={(e) => setLeftView(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-white text-xs font-bold rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none w-48"
              >
                {Object.entries(VIEWS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
           </div>
           <div className="flex-1 overflow-y-auto p-2 custom-scrollbar relative">
                {/* Scale content slightly down if needed, but standard responsive should work */}
                <div className="min-w-[350px]">
                    {renderComponent(leftView)}
                </div>
           </div>
        </div>

        {/* Right Pane */}
        <div className="flex flex-col bg-slate-900/30 rounded-xl border border-slate-700/50 overflow-hidden">
           <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Right Panel</label>
              <select
                value={rightView}
                onChange={(e) => setRightView(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-white text-xs font-bold rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none w-48"
              >
                {Object.entries(VIEWS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
           </div>
           <div className="flex-1 overflow-y-auto p-2 custom-scrollbar relative">
                <div className="min-w-[350px]">
                    {renderComponent(rightView)}
                </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CompareMode;