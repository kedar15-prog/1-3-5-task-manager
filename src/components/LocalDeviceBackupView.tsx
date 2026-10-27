import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Smartphone, 
  HardDrive, 
  CheckCircle2, 
  FileCode, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Clock,
  ArrowDownToLine,
  HelpCircle,
  Package
} from 'lucide-react';
import { Task, AutoUpdateSettings, DayHistoryRecord, Note } from '../types/todo';
import { 
  downloadLocalDeviceBackup, 
  readLocalBackupFile, 
  generateAndroidApkPackageZip, 
  loadLocalSnapshots, 
  saveLocalSnapshot, 
  LocalDeviceSnapshot 
} from '../utils/backup';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface LocalDeviceBackupViewProps {
  tasks: Task[];
  notes?: Note[];
  settings: AutoUpdateSettings;
  historyRecords: Record<string, DayHistoryRecord>;
  onRestoreData: (
    restoredTasks: Task[],
    restoredSettings?: AutoUpdateSettings,
    restoredHistory?: Record<string, DayHistoryRecord>,
    restoredNotes?: Note[]
  ) => void;
}

export const LocalDeviceBackupView: React.FC<LocalDeviceBackupViewProps> = ({
  tasks,
  notes = [],
  settings,
  historyRecords,
  onRestoreData,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [snapshots, setSnapshots] = useState<LocalDeviceSnapshot[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    setSnapshots(loadLocalSnapshots());
  }, []);

  const handleCreateSnapshot = () => {
    const updated = saveLocalSnapshot(tasks, settings, historyRecords, notes);
    setSnapshots(updated);
    setStatusMessage({
      text: 'New snapshot saved to this device memory.',
      type: 'success',
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDownloadBackup = () => {
    downloadLocalDeviceBackup(tasks, settings, historyRecords, notes);
    setStatusMessage({
      text: 'Backup file (.json) downloaded directly to your phone/device storage.',
      type: 'success',
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { tasks: restoredTasks, settings: restoredSettings, history, notes: restoredNotes } = await readLocalBackupFile(file);
      onRestoreData(restoredTasks, restoredSettings, history, restoredNotes);
      setStatusMessage({
        text: `Restored ${restoredTasks.length} tasks and ${restoredNotes?.length || 0} notes from local backup!`,
        type: 'success',
      });
      // Save snapshot of state prior to restore
      setSnapshots(saveLocalSnapshot(tasks, settings, historyRecords, notes));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid backup file format.';
      setStatusMessage({
        text: `Restore failed: ${msg}`,
        type: 'error',
      });
    }

    // Reset input
    e.target.value = '';
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleRestoreSnapshot = (snap: LocalDeviceSnapshot) => {
    if (confirm(`Restore snapshot from ${snap.formattedTime} (${snap.taskCount} tasks, ${snap.notesCount || 0} notes)?`)) {
      onRestoreData(snap.data.tasks, snap.data.settings, snap.data.history, snap.data.notes);
      setStatusMessage({
        text: `Rolled back to device snapshot from ${snap.formattedTime}.`,
        type: 'success',
      });
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleDownloadApkProjectZip = async () => {
    setIsGeneratingZip(true);
    try {
      const blob = await generateAndroidApkPackageZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '135-focus-android-apk-package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        text: 'Android APK project package (.zip) downloaded! Extract and run ./build-apk.sh or assemble with Android Studio to generate app-debug.apk.',
        type: 'success',
      });
    } catch (err) {
      setStatusMessage({
        text: 'Failed to generate APK package zip.',
        type: 'error',
      });
    } finally {
      setIsGeneratingZip(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Status Notice */}
      {statusMessage && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border text-xs flex items-center gap-2.5 shadow-xs transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Device Storage Status Bar */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Local Device Storage &amp; APK Center
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Offline Persistent
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{tasks.length} total tasks</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateSnapshot}
              className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Save Local Snapshot</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: Local Device Backup & Restore */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Backup to Local Device Storage</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Save a timestamped backup copy directly into your phone's Downloads or Files folder. No cloud account or external login needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Action A: Download Backup File */}
          <button
            onClick={handleDownloadBackup}
            className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-left flex items-start gap-3.5 group min-h-[56px]"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-950 block">
                Download Backup File (.json)
              </span>
              <span className="text-[11px] text-indigo-900/70 mt-0.5 block">
                Exports all 1-3-5 daily tasks, master backlog, timer stats, and rollover rules to your phone.
              </span>
            </div>
          </button>

          {/* Action B: Restore Backup File */}
          <label className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition-colors text-left flex items-start gap-3.5 cursor-pointer group min-h-[56px]">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Restore from Local Device
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Select a previously saved backup file from your phone storage to restore your workspace.
              </span>
            </div>
            <input
              type="file"
              accept=".json,.bak"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Snapshots Rollback History */}
        {snapshots.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>Automatic Device Snapshots ({snapshots.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Click any snapshot to roll back</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {snapshots.map(snap => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{snap.formattedTime}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono tabular-nums text-slate-500">{snap.taskCount} tasks</span>
                  </div>

                  <button
                    onClick={() => handleRestoreSnapshot(snap)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Android APK File Format & Mobile Installation */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Android APK File Format &amp; Phone Installation
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Install on your Android smartphone either as a native WebAPK or compile into a standalone debug APK file.
          </p>
        </div>

        {/* Visual App Logo Status Card */}
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/pwa-192x192.png"
              alt="1-3-5 Daily Focus App Logo"
              className="w-14 h-14 rounded-2xl shadow-md border border-indigo-200 shrink-0 bg-indigo-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-950">
                  Official Application Logo
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 mt-0.5">
                Full-bleed 1·3·5 Dial Icon (192px, 512px, Maskable, Apple Touch Icon)
              </p>
            </div>
          </div>

          <div className="text-[11px] text-indigo-900/70 max-w-sm sm:text-right">
            <span>If installed previously with a default letter: remove the previous shortcut and tap <strong>Install WebAPK</strong> below to register the new logo.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Method 1: WebAPK Direct Native Install */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Method 1 (Recommended)
                </span>
                <span className="text-[11px] text-emerald-800 font-medium">Native WebAPK</span>
              </div>
              <h4 className="text-sm font-semibold text-emerald-950 mt-1">
                Direct Android WebAPK Install
              </h4>
              <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                Android OS natively packages installable web apps into a signed <strong>WebAPK</strong> file upon installation. It adds an official launcher icon to your phone's app drawer, home screen, and works 100% offline.
              </p>
            </div>

            <div>
              {isInstalled ? (
                <div className="p-2.5 bg-emerald-100/80 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>App is already installed as WebAPK on this device!</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={install}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install WebAPK on Android Phone</span>
                </button>
              ) : isIOS ? (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px]"
                >
                  <span>Install on iPhone / iPad (Safari)</span>
                </button>
              ) : (
                <div className="p-2.5 bg-white border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <span>To install: Open browser menu (⋮) on Android and tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</span>
                </div>
              )}
            </div>
          </div>

          {/* Method 2: Android Studio / Capacitor APK Package (.zip) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Method 2
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Standalone .apk</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-1">
                Download Android APK Project (.zip)
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Contains complete Android project files (<code className="text-slate-800 font-mono">AndroidManifest.xml</code>, Capacitor config, icons, and <code className="text-slate-800 font-mono">./build-apk.sh</code>). Compiles directly into <code className="text-slate-800 font-mono">app-debug.apk</code> via Gradle!
              </p>
            </div>

            <button
              onClick={handleDownloadApkProjectZip}
              disabled={isGeneratingZip}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px]"
            >
              {isGeneratingZip ? (
                <span>Packing ZIP Archive...</span>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  <span>Download APK Build Project (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step-by-Step Instructions Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>How to Install &amp; Build APK for Android:</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
            <li>
              <strong>Instant WebAPK:</strong> Tap <strong>"Install WebAPK on Android Phone"</strong> above. Android Play Services automatically builds the APK package.
            </li>
            <li>
              <strong>Offline Sideload APK:</strong> Extract the downloaded project zip, run <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">./gradlew assembleDebug</code> in the <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">android/</code> directory to get <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">app-debug.apk</code>.
            </li>
            <li>
              <strong>PWABuilder Cloud APK:</strong> You can also paste your applet URL into{' '}
              <a
                href="https://www.pwabuilder.com/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline font-medium inline-flex items-center gap-0.5"
              >
                PWABuilder.com <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              to receive a signed production APK or Google Play AAB instantly.
            </li>
          </ol>
        </div>
      </section>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Install on iPhone / iPad</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              1. Tap the <strong>Share</strong> button in the Safari bottom toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Tap <strong>Add</strong> in the top right corner.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
