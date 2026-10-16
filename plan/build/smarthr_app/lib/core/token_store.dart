import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

/// Tokens and identity, in the platform keystore. Never SharedPreferences —
/// a refresh token is a thirty-day key to someone's account.
class TokenStore {
  static const _access = 'access_token';
  static const _refresh = 'refresh_token';
  static const _user = 'user_id';
  static const _device = 'device_id';

  final FlutterSecureStorage _s = const FlutterSecureStorage();
  String? _accessCache;
  bool isDemo = false;

  Future<String?> get access async => _accessCache ??= await _s.read(key: _access);
  Future<String?> get refresh => _s.read(key: _refresh);
  Future<String?> get userId => _s.read(key: _user);

  Future<void> saveTokens({required String access, required String refresh}) async {
    _accessCache = access;
    await _s.write(key: _access, value: access);
    await _s.write(key: _refresh, value: refresh);
  }

  Future<void> saveUserId(String id) => _s.write(key: _user, value: id);

  Future<void> clear() async {
    _accessCache = null;
    await _s.delete(key: _access);
    await _s.delete(key: _refresh);
    await _s.delete(key: _user);
  }

  /// Stable per install. Lets the server tell a user's phones apart.
  Future<String> deviceId() async {
    var id = await _s.read(key: _device);
    if (id == null) {
      id = const Uuid().v4();
      await _s.write(key: _device, value: id);
    }
    return id;
  }
}
