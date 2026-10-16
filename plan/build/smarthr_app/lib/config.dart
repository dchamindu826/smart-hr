/// Where the API lives. Set per build, never hardcoded to production:
///
///   flutter run --dart-define=API_BASE=http://10.0.2.2:3000/api/v1       (Android emulator → your laptop)
///   flutter run --dart-define=API_BASE=http://192.168.1.20:3000/api/v1   (real phone on the same Wi-Fi)
///   flutter build apk --dart-define=API_BASE=https://app.yourdomain.lk/api/v1
const String _envBase = String.fromEnvironment('API_BASE');

/// Where the API lives. Points directly to the live server.
String get apiBase {
  if (_envBase.isNotEmpty && !_envBase.contains('10.0.2.2')) {
    return _envBase;
  }
  return 'https://smarthr.lumi-automation.com/api/v1';
}
