import React from 'react';
import { PushNotificationRecord } from '../types/airQuality';
import { REGIONS_METADATA } from '../data/singaporeAirConstants';
import {
  Bell,
  X,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Flame,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationRecord[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onMarkAllAsRead: () => void;
  onOpenSettings: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onDismiss,
  onClearAll,
  onMarkAllAsRead,
  onOpenSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Air Quality Alerts Log
                </h3>
                <p className="text-xs text-slate-400">
                  {notifications.length} alerts triggered
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

          {/* Quick Actions Row */}
          {notifications.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={onMarkAllAsRead}
                className="hover:text-cyan-400 transition-colors"
              >
                Mark all as read
              </button>
              <button
                onClick={onClearAll}
                className="hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all history</span>
              </button>
            </div>
          )}

          {/* Alerts Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500/70 mb-3" />
                <h4 className="text-sm font-semibold text-white">
                  No Active Air Threshold Breaches
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  All Singapore sectors are currently operating within your healthy air quality thresholds.
                </p>
                <button
                  onClick={onOpenSettings}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Configure Alert Rules
                </button>
              </div>
            ) : (
              notifications.map(item => {
                const formattedDate = new Date(item.timestamp).toLocaleTimeString('en-SG', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.severity === 'critical'
                        ? 'bg-rose-950/40 border-rose-800/70'
                        : 'bg-amber-950/40 border-amber-800/70'
                    } ${!item.read ? 'ring-1 ring-amber-500/40' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 shrink-0 ${
                            item.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-white">
                          {item.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onDismiss(item.id)}
                        className="text-slate-500 hover:text-slate-300"
                        title="Dismiss alert"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {item.body}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="font-mono">
                        <span className="text-white font-bold">{item.metric}: {item.currentValue}</span>
                        <span className="text-slate-500"> (Limit: {item.threshold})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.sentViaBrowser && (
                          <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50">
                            Push Sent
                          </span>
                        )}
                        <span>{formattedDate} SGT</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              NEA Real-time Alert System
            </span>
            <button
              onClick={onOpenSettings}
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage Rules</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
