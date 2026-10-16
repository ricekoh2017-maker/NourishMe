import React, { useState, useEffect } from 'react';
import { AlertConfig, RegionId } from '../types/airQuality';
import { REGIONS_METADATA } from '../data/singaporeAirConstants';
import { playNotificationChime } from '../services/notificationAudio';
import {
  Bell,
  Volume2,
  VolumeX,
  Sliders,
  Check,
  AlertTriangle,
  Send,
  X,
  Server,
  Code,
  ShieldCheck
} from 'lucide-react';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertConfig;
  onSaveConfig: (newConfig: AlertConfig) => void;
  onTriggerTestAlert: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerTestAlert
}) => {
  const [localConfig, setLocalConfig] = useState<AlertConfig>(config);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [showServerlessDocs, setShowServerlessDocs] = useState<boolean>(false);
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  useEffect(() => {
    setLocalConfig(config);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleRequestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermissionState(result);
        if (result === 'granted') {
          const updated = { ...localConfig, browserPushEnabled: true };
          setLocalConfig(updated);
          onSaveConfig(updated);
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const handleTestAudio = () => {
    playNotificationChime('unhealthy');
  };

  const handleTestNotification = () => {
    onTriggerTestAlert();
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Air Quality Alert & Push Notification Rules
              </h3>
              <p className="text-xs text-slate-400">
                Custom trigger thresholds, browser push notifications & sound alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: Browser Web Push Notifications */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <span>Browser Web Push Notifications</span>
                  {permissionState === 'granted' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 rounded">
                      Permission Granted
                    </span>
                  ) : permissionState === 'denied' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-700/60 rounded">
                      Permission Blocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-700/60 rounded">
                      Permission Required
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Receive instant system alerts when PSI or PM2.5 crosses into unhealthy levels, even if this tab is in the background.
                </p>
              </div>

              {permissionState !== 'granted' && (
                <button
                  onClick={handleRequestPushPermission}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap shrink-0 transition-colors"
                >
                  Enable Push
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={localConfig.enabled}
                  onChange={e => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Enable Alert Processing Engine</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={localConfig.soundEnabled}
                  onChange={e => setLocalConfig({ ...localConfig, soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Audio Alert Chimes</span>
              </label>

              {localConfig.soundEnabled && (
                <button
                  onClick={handleTestAudio}
                  className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  Test Sound
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Threshold Sliders */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Trigger Thresholds
            </h4>

            {/* PSI Slider */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  24-Hour PSI Alert Trigger
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {localConfig.psiThreshold} PSI
                  <span className="text-[11px] text-slate-400 font-sans ml-1">
                    ({localConfig.psiThreshold <= 100 ? 'Moderate' : localConfig.psiThreshold <= 200 ? 'Unhealthy' : 'Very Unhealthy'})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={localConfig.psiThreshold}
                onChange={e => setLocalConfig({ ...localConfig, psiThreshold: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50 (Good)</span>
                <span className="text-amber-500">100 (Unhealthy - Recommended)</span>
                <span>200 (Very Unhealthy)</span>
              </div>
            </div>

            {/* 1-hr PM2.5 Slider */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  1-Hour PM2.5 Alert Trigger (Sports & Cardio)
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {localConfig.pm25Threshold} µg/m³
                  <span className="text-[11px] text-slate-400 font-sans ml-1">
                    ({localConfig.pm25Threshold <= 55 ? 'Normal' : 'Elevated'})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="150"
                step="5"
                value={localConfig.pm25Threshold}
                onChange={e => setLocalConfig({ ...localConfig, pm25Threshold: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>25 (Clean)</span>
                <span className="text-amber-500">55 (Elevated Band II - Recommended)</span>
                <span>150 (High Band III)</span>
              </div>
            </div>

            {/* Region selector */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-white">
                Monitored Singapore Region
              </label>
              <select
                value={localConfig.targetRegion}
                onChange={e => setLocalConfig({ ...localConfig, targetRegion: e.target.value as RegionId | 'all' })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Singapore Regions (Islandwide Trigger)</option>
                <option value="north">North Region (Woodlands, Yishun, Sembawang)</option>
                <option value="south">South Region (Marina Bay, Sentosa, Tanjong Pagar)</option>
                <option value="east">East Region (Tampines, Bedok, Changi, Pasir Ris)</option>
                <option value="west">West Region (Jurong, Tuas, Clementi, Bukit Batok)</option>
                <option value="central">Central Region (Bishan, Ang Mo Kio, Novena, Bukit Timah)</option>
              </select>
            </div>
          </div>

          {/* Section 3: Serverless Backend Hookup Guide */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowServerlessDocs(!showServerlessDocs)}
              className="w-full px-4 py-3 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between text-xs text-left text-slate-300 font-semibold"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Future Serverless Backend Integration Architecture</span>
              </div>
              <span className="text-[11px] text-cyan-400">
                {showServerlessDocs ? 'Collapse' : 'View API Spec'}
              </span>
            </button>

            {showServerlessDocs && (
              <div className="p-4 bg-slate-950 text-xs text-slate-400 space-y-3 border-t border-slate-800">
                <p>
                  This frontend is ready to integrate with your upcoming serverless backend (e.g. Cloudflare Workers, AWS Lambda, or Google Cloud Functions):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>
                    <strong className="text-white">WebPush Subscription:</strong> Export <code className="text-cyan-300 font-mono">pushSubscription</code> via <code className="text-cyan-300 font-mono">registration.pushManager.subscribe()</code> using VAPID keys.
                  </li>
                  <li>
                    <strong className="text-white">Cron Ingestion:</strong> Backend polls <code className="text-cyan-300 font-mono">https://api.data.gov.sg/v1/environment/psi</code> every 10 minutes.
                  </li>
                  <li>
                    <strong className="text-white">Dispatch:</strong> When PSI ≥ {localConfig.psiThreshold}, send push payload via WebPush or FCM to registered client tokens.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={handleTestNotification}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>{testNotificationSent ? 'Sent Test Alert!' : 'Send Test Notification'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm"
            >
              Save Alert Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
