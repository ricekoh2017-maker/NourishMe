import React from 'react';
import { Bell, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { PushNotificationRecord } from '../types/airQuality';

interface TopBarProps {
  activeTab: 'overview' | 'map' | 'pollutants' | 'activities' | 'settings';
  setActiveTab: (tab: 'overview' | 'map' | 'pollutants' | 'activities' | 'settings') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  hasCriticalAlert: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  onOpenSettings,
  hasCriticalAlert
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-cyan-900/40">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                SG AirAlert
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 single-line clean text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'overview'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'hover:text-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'map'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'hover:text-slate-100'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => setActiveTab('pollutants')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'pollutants'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'hover:text-slate-100'
            }`}
          >
            All Pollutants
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'activities'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'hover:text-slate-100'
            }`}
          >
            Outdoor Viability
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'settings'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'hover:text-slate-100'
            }`}
          >
            Alert Rules
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNotifications}
            className={`relative p-2 rounded-xl border transition-all flex items-center justify-center ${
              hasCriticalAlert
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
            title="View Air Alerts & Push Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 active:scale-95 transition-all shadow-sm shadow-cyan-500/20 whitespace-nowrap flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Configure Push Alerts</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-900 bg-slate-950 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-1 px-2 font-medium ${activeTab === 'overview' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`py-1 px-2 font-medium ${activeTab === 'map' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          Map
        </button>
        <button
          onClick={() => setActiveTab('pollutants')}
          className={`py-1 px-2 font-medium ${activeTab === 'pollutants' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          Pollutants
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`py-1 px-2 font-medium ${activeTab === 'activities' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          Activities
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-1 px-2 font-medium ${activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          Alerts
        </button>
      </div>
    </header>
  );
};
