# SmartHR — employee app (Flutter)

Mark in and out, at the branch or remotely, with every punch safe on the phone
before it is sent. Talks to the Next.js API in `smarthr-web`.

This first release: sign in, today's dial, office or remote punch with location,
the offline queue, and a profile screen. Leave, payslips and the rest come next,
against endpoints that do not exist yet.

---

## 1. Generate the platform folders

This repo holds `lib/`, `test/` and `pubspec.yaml`. The Android and iOS folders
are generated, so create them once:

```bash
cd smarthr_app
flutter create --org lk.lumiai --project-name smarthr_app --platforms android,ios .
flutter pub get
```

`flutter create .` only adds missing files — it will not overwrite `lib/`.

## 2. Permissions

**Android** — `android/app/src/main/AndroidManifest.xml`, inside `<manifest>` above `<application>`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

For local development over plain HTTP, add this attribute to `<application>`.
**Remove it before a release build** — production is HTTPS only:

```xml
android:usesCleartextTraffic="true"
```

**iOS** — `ios/Runner/Info.plist`, inside the top `<dict>`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>SmartHR records where you are when you start and end a work session, so your employer has a record of where the day was worked. Location is not tracked between those two moments.</string>
```

Use that same sentence in the Play Store data-safety form. It is also true.

## 3. Run it against your laptop

Start the web project first (`npm run dev` in `smarthr-web`), then:

```bash
# Android emulator — 10.0.2.2 is the emulator's name for your laptop
flutter run --dart-define=API_BASE=http://10.0.2.2:3000/api/v1

# A real phone on the same Wi-Fi — use your laptop's LAN address
flutter run --dart-define=API_BASE=http://192.168.1.20:3000/api/v1
```

For a real phone, `npm run dev` must listen beyond localhost:
`npx next dev -H 0.0.0.0`.

Sign in as **kamal@abc.lk** with the seed password. He has a registered remote
address in Nugegoda, so try both an office and a remote punch.

**Testing locations on the emulator:** the ⋯ menu → Location lets you set a
point. Colombo HQ is `6.9271, 79.8612`; anything more than 150 m away is refused
for an office punch and accepted for a remote one.

## 4. Tests

```bash
flutter test
flutter analyze
```

## 5. Release build

```bash
flutter build appbundle --dart-define=API_BASE=https://app.yourdomain.lk/api/v1
```

Ship Android first. Most of your first clients' staff are on Android, and iOS
needs a Mac and a longer review. Do not let iOS hold up the first release.

---

## How a punch travels

```
tap → location fix (required) → written to the phone's SQLite queue
    → POST /attendance/sync  → server records it once, keyed on clientId
    → removed from the queue → dial redraws from the server's answer
```

If there is no signal, it stops after the queue. `connectivity_plus` uploads it
when signal returns, and so does reopening the app. A retry after a timeout
cannot create a double punch: the phone reuses the same `clientId`, and the
server answers a repeat with the original result.

The queue is scoped to the signed-in user. Signing out with punches still
queued warns first, and they upload the next time that same person signs in on
that phone.

## Not in this release

- Face check at mark-in (ML Kit, on-device) — next, after the core flow is proven
- Background upload with the app closed (`workmanager`)
- Push notifications (Firebase)
- Leave, payslips, overtime reasons, roster, expenses
- Generated models from `openapi.json` — hand-written while there are four endpoints
