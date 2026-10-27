import JSZip from 'jszip';
import { Task, AutoUpdateSettings, DayHistoryRecord, Note } from '../types/todo';
import { getTodayKey } from './dates';

export interface LocalDeviceSnapshot {
  id: string;
  timestamp: string;
  formattedTime: string;
  taskCount: number;
  dailyCount: number;
  backlogCount: number;
  notesCount?: number;
  data: {
    tasks: Task[];
    settings: AutoUpdateSettings;
    history: Record<string, DayHistoryRecord>;
    notes?: Note[];
  };
}

const SNAPSHOT_KEY = 'one_three_five_device_snapshots_v1';

export function loadLocalSnapshots(): LocalDeviceSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalSnapshot(
  tasks: Task[],
  settings: AutoUpdateSettings,
  history: Record<string, DayHistoryRecord>,
  notes: Note[] = []
): LocalDeviceSnapshot[] {
  try {
    const snapshots = loadLocalSnapshots();
    const now = new Date();
    const dailyCount = tasks.filter(t => t.inDailyList).length;
    const backlogCount = tasks.filter(t => !t.inDailyList).length;

    const newSnapshot: LocalDeviceSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      taskCount: tasks.length,
      dailyCount,
      backlogCount,
      notesCount: notes.length,
      data: {
        tasks,
        settings,
        history,
        notes,
      },
    };

    // Keep last 8 snapshots
    const updated = [newSnapshot, ...snapshots.slice(0, 7)];
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Downloads a complete JSON backup file to the user's mobile device or computer
 */
export function downloadLocalDeviceBackup(
  tasks: Task[],
  settings: AutoUpdateSettings,
  history: Record<string, DayHistoryRecord>,
  notes: Note[] = []
): void {
  const now = new Date();
  const dateStr = getTodayKey();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  const backupPayload = {
    app: '1-3-5 Daily Focus & Task Timer',
    version: '1.3.0',
    exportDate: now.toISOString(),
    schema: '1-3-5-standard-v1',
    deviceBackup: true,
    data: {
      tasks,
      settings,
      history,
      notes,
    },
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `135-Focus-Backup-${dateStr}-${timeStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates a local backup file from device storage
 */
export async function readLocalBackupFile(file: File): Promise<{
  tasks: Task[];
  settings?: AutoUpdateSettings;
  history?: Record<string, DayHistoryRecord>;
  notes?: Note[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let tasks: Task[] = [];
        let settings: AutoUpdateSettings | undefined;
        let history: Record<string, DayHistoryRecord> | undefined;
        let notes: Note[] | undefined;

        if (parsed.data && Array.isArray(parsed.data.tasks)) {
          tasks = parsed.data.tasks;
          settings = parsed.data.settings;
          history = parsed.data.history;
          notes = Array.isArray(parsed.data.notes) ? parsed.data.notes : [];
        } else if (Array.isArray(parsed.tasks)) {
          tasks = parsed.tasks;
          settings = parsed.settings;
          history = parsed.historyRecords || parsed.history;
          notes = Array.isArray(parsed.notes) ? parsed.notes : [];
        } else if (Array.isArray(parsed)) {
          tasks = parsed;
        } else {
          throw new Error('Unrecognized backup file structure.');
        }

        resolve({ tasks, settings, history, notes });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file from local device.'));
    reader.readAsText(file);
  });
}

/**
 * Generates an Android APK Project Bundle (.zip) ready to build with Capacitor / Android Studio / Gradle
 */
export async function generateAndroidApkPackageZip(): Promise<Blob> {
  const zip = new JSZip();

  // 1. Root instructions README.md
  zip.file(
    'README_ANDROID_APK.md',
    `# 1-3-5 Focus - Android APK Build Instructions

This package contains everything needed to compile an installable Android APK file (.apk) for your phone.

## Option 1: Direct WebAPK Install (No Compilation Needed)
1. Open this app in Google Chrome on your Android phone.
2. Tap the browser menu (3 dots) or the in-app "Install App" button.
3. Tap "Add to Home Screen" / "Install".
4. Android will automatically compile and install a signed native WebAPK with its own launcher icon, splash screen, and standalone execution.

---

## Option 2: Build Native APK with Capacitor & Android Studio
Prerequisites: Node.js (v18+) and Android Studio / JDK 17 installed.

### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 2: Initialize Android Project
\`\`\`bash
npx cap add android
npx cap sync
\`\`\`

### Step 3: Compile APK
\`\`\`bash
# Build Debug APK (installs immediately on any Android phone via USB or download)
cd android
./gradlew assembleDebug
\`\`\`

Your APK file will be ready at:
\`android/app/build/outputs/apk/debug/app-debug.apk\`

Transfer \`app-debug.apk\` to your Android phone and tap to install!
`
  );

  // 2. capacitor.config.json
  zip.file(
    'capacitor.config.json',
    JSON.stringify(
      {
        appId: 'com.focustodo.onethreefive',
        appName: '1-3-5 Focus',
        webDir: 'dist',
        bundledWebRuntime: false,
        server: {
          androidScheme: 'https',
        },
        android: {
          buildOptions: {
            keystorePath: null,
            releaseType: 'APK',
          },
        },
      },
      null,
      2
    )
  );

  // 3. AndroidManifest.xml template
  zip.file(
    'android/app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.focustodo.onethreefive">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="1-3-5 Focus"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="1-3-5 Focus"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>
    </application>
</manifest>`
  );

  // 4. Quick Build shell script
  zip.file(
    'build-apk.sh',
    `#!/usr/bin/env bash
echo "Building 1-3-5 Focus Android APK..."
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
echo "APK Build Complete!"
echo "APK location: android/app/build/outputs/apk/debug/app-debug.apk"
`
  );

  // 5. Build bat script for Windows
  zip.file(
    'build-apk.bat',
    `@echo off
echo Building 1-3-5 Focus Android APK...
call npm run build
call npx cap sync android
cd android
call gradlew.bat assembleDebug
echo APK Build Complete!
echo APK location: android\\app\\build\\outputs\\apk\\debug\\app-debug.apk
pause
`
  );

  // 6. Embed App Logo Assets directly into zip
  try {
    const iconRes = await fetch('/pwa-512x512.png');
    if (iconRes.ok) {
      const iconBlob = await iconRes.blob();
      zip.file('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', iconBlob);
      zip.file('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', iconBlob);
      zip.file('public/pwa-512x512.png', iconBlob);
    }
    const icon192Res = await fetch('/pwa-192x192.png');
    if (icon192Res.ok) {
      const icon192Blob = await icon192Res.blob();
      zip.file('android/app/src/main/res/mipmap-mdpi/ic_launcher.png', icon192Blob);
      zip.file('android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', icon192Blob);
      zip.file('public/pwa-192x192.png', icon192Blob);
    }
  } catch {
    // Non-blocking fallback
  }

  return await zip.generateAsync({ type: 'blob' });
}
