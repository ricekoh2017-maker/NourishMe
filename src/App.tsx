/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  RegionId,
  RegionAirQualityData,
  ScenarioPreset,
  AlertConfig,
  PushNotificationRecord,
  HotspotSurveillance
} from './types/airQuality';
import {
  fetchLivePsiData,
  createPresetData,
  evaluateThresholdsAndNotify,
  DEFAULT_ALERT_CONFIG,
  DataFetchResult
} from './services/airQualityService';
import { playNotificationChime } from './services/notificationAudio';
import { TopBar } from './components/TopBar';
import { HeroHeader } from './components/HeroHeader';
import { ScenarioBar } from './components/ScenarioBar';
import { ActiveAlertBanner } from './components/ActiveAlertBanner';
import { MetricCards } from './components/MetricCards';
import { SingaporeMap } from './components/SingaporeMap';
import { HealthAdvisoryPanel } from './components/HealthAdvisoryPanel';
import { PollutantsBreakdown } from './components/PollutantsBreakdown';
import { OutdoorActivityPlanner } from './components/OutdoorActivityPlanner';
import { HistoricalTrendChart } from './components/HistoricalTrendChart';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { WeatherDispersalBanner } from './components/WeatherDispersalBanner';
import {
  ShieldAlert,
  Activity,
  Layers,
  MapPin,
  Calendar,
  Info,
  ExternalLink,
  FileDown
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'pollutants' | 'activities' | 'settings'>('overview');
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('national');
  const [activeMetric, setActiveMetric] = useState<'psi' | 'pm25'>('psi');

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  // Data & Presets
  const [currentPreset, setCurrentPreset] = useState<ScenarioPreset>('live');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [airData, setAirData] = useState<DataFetchResult>(() => createPresetData('moderate'));

  // Configuration & Notifications with LocalStorage persistence
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(() => {
    try {
      const saved = localStorage.getItem('sg_air_alert_config');
      return saved ? JSON.parse(saved) : DEFAULT_ALERT_CONFIG;
    } catch {
      return DEFAULT_ALERT_CONFIG;
    }
  });

  const [notifications, setNotifications] = useState<PushNotificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sg_air_alert_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: AlertConfig) => {
    setAlertConfig(newConfig);
    try {
      localStorage.setItem('sg_air_alert_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('LocalStorage error saving config:', e);
    }
  };

  // Save notifications to localStorage
  const updateNotifications = (newList: PushNotificationRecord[]) => {
    setNotifications(newList);
    try {
      localStorage.setItem('sg_air_alert_history', JSON.stringify(newList));
    } catch (e) {
      console.warn('LocalStorage error saving notifications:', e);
    }
  };

  // Evaluate alerts and notifications
  const runAlertEvaluation = useCallback(async (data: DataFetchResult, config: AlertConfig) => {
    const newAlerts = await evaluateThresholdsAndNotify(data, config, notifications);
    if (newAlerts.length > 0) {
      setBannerDismissed(false);
      updateNotifications([...newAlerts, ...notifications]);
    }
  }, [notifications]);

  // Load Data
  const loadData = useCallback(async (preset: ScenarioPreset) => {
    setIsLoading(true);
    try {
      if (preset === 'live') {
        const live = await fetchLivePsiData();
        setAirData(live);
        await runAlertEvaluation(live, alertConfig);
      } else {
        const sim = createPresetData(preset);
        setAirData(sim);
        await runAlertEvaluation(sim, alertConfig);
      }
    } catch (err) {
      console.error('Failed to load air data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [alertConfig, runAlertEvaluation]);

  // Initial mount load
  useEffect(() => {
    loadData(currentPreset);
  }, []);

  // Preset switcher
  const handleSelectPreset = (preset: ScenarioPreset) => {
    setCurrentPreset(preset);
    loadData(preset);
  };

  // Trigger Instant Spike Test
  const handleTriggerInstantSpike = () => {
    const spikeData = createPresetData('rapid_spike');
    setAirData(spikeData);
    setCurrentPreset('rapid_spike');
    setBannerDismissed(false);

    // Create immediate explicit test alert
    const testAlert: PushNotificationRecord = {
      id: `spike-test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: '🚨 Rapid Haze Spike Alert: West & South Sectors',
      body: `PSI surged to 155 in West Singapore (PM2.5: 118 µg/m³), breaching your threshold of ${alertConfig.psiThreshold} PSI. Healthy persons should reduce prolonged outdoor exertion.`,
      severity: 'critical',
      region: 'west',
      metric: 'PSI',
      currentValue: 155,
      threshold: alertConfig.psiThreshold,
      read: false,
      sentViaBrowser: false
    };

    if (alertConfig.soundEnabled) {
      playNotificationChime('critical');
    }

    if (alertConfig.browserPushEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(testAlert.title, {
            body: testAlert.body,
            tag: 'air-spike-test'
          });
          testAlert.sentViaBrowser = true;
        } catch (e) {
          console.warn('Native notification failed:', e);
        }
      }
    }

    updateNotifications([testAlert, ...notifications]);
  };

  // Trigger manual test notification from modal
  const handleTriggerManualTest = () => {
    const currentReg = airData.regions[selectedRegion] || airData.national;
    const testAlert: PushNotificationRecord = {
      id: `manual-test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: '🔔 AirAlert Test Verification',
      body: `System test notification: ${currentReg.name} current 24-hr PSI is ${currentReg.readings.psi24h} (${currentReg.band.label}), 1-hr PM2.5 is ${currentReg.readings.pm25_1h} µg/m³. Alert engine operational.`,
      severity: 'moderate',
      region: selectedRegion,
      metric: 'PSI',
      currentValue: currentReg.readings.psi24h,
      threshold: alertConfig.psiThreshold,
      read: false,
      sentViaBrowser: false
    };

    if (alertConfig.soundEnabled) {
      playNotificationChime('moderate');
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(testAlert.title, {
          body: testAlert.body,
          tag: 'air-manual-test'
        });
        testAlert.sentViaBrowser = true;
      } catch (e) {
        console.warn('Notification send failed:', e);
      }
    }

    updateNotifications([testAlert, ...notifications]);
  };

  // Notification management
  const handleDismissNotification = (id: string) => {
    updateNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    updateNotifications([]);
  };

  const handleMarkAllAsRead = () => {
    updateNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasCriticalAlert = notifications.some(n => !n.read && n.severity === 'critical');

  const selectedData = airData.regions[selectedRegion] || airData.national;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Bar following Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={tab => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCriticalAlert={hasCriticalAlert}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Scenario & Live Status Bar */}
        <ScenarioBar
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
          onRefresh={() => loadData(currentPreset)}
          isLoading={isLoading}
          dataSource={airData.source}
          timestamp={airData.timestamp}
          onTriggerInstantSpike={handleTriggerInstantSpike}
        />

        {/* Active Emergency Threshold Banner (if air quality is unhealthy) */}
        {!bannerDismissed && (
          <ActiveAlertBanner
            regions={airData.regions}
            threshold={alertConfig.psiThreshold}
            onOpenAdvisory={() => setActiveTab('overview')}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* NEA 2-Hour Weather & Haze Washout Forecast */}
        <WeatherDispersalBanner summary={airData.weatherSummary} />

        {/* Tab 1: Overview (Hero, Metric Cards, Interactive Map, Advisory, Trend) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <HeroHeader
              nationalData={airData.national}
              hotspots={airData.hotspots}
              onOpenMap={() => setActiveTab('map')}
              onConfigureAlerts={() => setIsSettingsOpen(true)}
            />

            {/* Core Metrics Strip */}
            <MetricCards
              regions={airData.regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              hotspots={airData.hotspots}
              activeMetric={activeMetric}
            />

            {/* Map & Sector Details 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Vector Map */}
              <div className="lg:col-span-7">
                <SingaporeMap
                  regions={airData.regions}
                  selectedRegion={selectedRegion}
                  onSelectRegion={setSelectedRegion}
                  activeMetric={activeMetric}
                  onMetricChange={setActiveMetric}
                  hotspots={airData.hotspots}
                />
              </div>

              {/* Right Column: Health Advisory & Sector Guidance */}
              <div className="lg:col-span-5 space-y-6">
                <HealthAdvisoryPanel currentData={selectedData} />
              </div>
            </div>

            {/* 24-Hour Trend Chart */}
            <HistoricalTrendChart
              history={airData.history}
              selectedRegion={selectedRegion}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Map View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                Singapore Interactive Air Quality & Wind Vector Map
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing Singapore's 5 geographical monitoring sectors, wind currents, and regional smoke corridors
              </p>
            </div>

            <SingaporeMap
              regions={airData.regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              activeMetric={activeMetric}
              onMetricChange={setActiveMetric}
              hotspots={airData.hotspots}
            />

            <MetricCards
              regions={airData.regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              hotspots={airData.hotspots}
              activeMetric={activeMetric}
            />
          </div>
        )}

        {/* Tab 3: Detailed Pollutants Table & Spectrum */}
        {activeTab === 'pollutants' && (
          <div className="space-y-6">
            <PollutantsBreakdown
              regions={airData.regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          </div>
        )}

        {/* Tab 4: Outdoor Activity Viability Planner */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <OutdoorActivityPlanner
              regions={airData.regions}
              onSelectRegion={reg => {
                setSelectedRegion(reg);
                setActiveTab('overview');
              }}
            />
          </div>
        )}
      </main>

      {/* Push Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onClearAll={handleClearAllNotifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onOpenSettings={() => {
          setIsNotificationDrawerOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Alert Rules & Push Configuration Modal */}
      <AlertSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={alertConfig}
        onSaveConfig={handleSaveConfig}
        onTriggerTestAlert={handleTriggerManualTest}
      />

      {/* Clean Editorial Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/60 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SG AirAlert</span>
            <span>·</span>
            <span>Data sourced via National Environment Agency (NEA) & data.gov.sg</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 flex-wrap">
            <span>MOH Health Advisory Standards</span>
            <span>·</span>
            <span>Serverless Backend Ready</span>
            <span>·</span>
            <a
              href="/SG_AirAlert_Prompts_16Oct2026.docx"
              download="SG_AirAlert_Prompts_16Oct2026.docx"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Word Doc (.docx)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
