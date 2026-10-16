import 'package:flutter/foundation.dart';

import '../attendance/models.dart';
import '../core/api_client.dart';
import '../core/api_exception.dart';
import '../core/token_store.dart';

enum AuthStatus { unknown, signedOut, signedIn }

class AuthController extends ChangeNotifier {
  AuthController(this._api, this._tokens);

  final ApiClient _api;
  final TokenStore _tokens;

  AuthStatus status = AuthStatus.unknown;
  Me? me;
  String? userId;

  /// On launch. Offline is not signed out: someone at a gate with no signal
  /// must still be able to mark in, and the punch waits in the queue.
  Future<void> restore() async {
    userId = await _tokens.userId;
    if (await _tokens.refresh == null || userId == null) {
      status = AuthStatus.signedOut;
      notifyListeners();
      return;
    }
    try {
      me = Me.fromJson(await _api.get('/me'));
      status = AuthStatus.signedIn;
    } on ApiException catch (e) {
      if (e.isNetwork) {
        status = AuthStatus.signedIn;
      } else {
        await _tokens.clear();
        status = AuthStatus.signedOut;
      }
    }
    notifyListeners();
  }

  /// Throws ApiException; the login screen shows its message.
  Future<void> login({required String email, required String password, String? company}) async {
    final data = await _api.post(
      '/auth/login',
      {
        'email': email.trim(),
        'password': password,
        if (company != null && company.trim().isNotEmpty) 'company': company.trim(),
        'deviceId': await _tokens.deviceId(),
      },
      auth: false,
    );
    await _tokens.saveTokens(
      access: data['accessToken'] as String,
      refresh: data['refreshToken'] as String,
    );
    final user = Map<String, dynamic>.from(data['user'] as Map);
    userId = user['id'] as String;
    await _tokens.saveUserId(userId!);

    me = Me.fromJson(await _api.get('/me'));
    status = AuthStatus.signedIn;
    notifyListeners();
  }

  void loginDemo() {
    _tokens.isDemo = true;
    userId = 'demo-kamal-perera';
    me = const Me(
      userId: 'demo-kamal-perera',
      email: 'kamal.p@abcholdings.lk',
      role: 'EMPLOYEE',
      tenantName: 'ABC Holdings',
      employeeName: 'Kamal Perera',
      empNo: 'EMP-2024-042',
      designation: 'Senior Software Engineer',
      branchName: 'Colombo HQ',
      departmentName: 'Engineering',
      epfMemberNo: '84920/ABC',
      remoteLabel: 'Home · Mount Lavinia',
    );
    status = AuthStatus.signedIn;
    notifyListeners();
  }

  Future<void> logout() async {
    _tokens.isDemo = false;
    final rt = await _tokens.refresh;
    if (rt != null) {
      try {
        await _api.post('/auth/logout', {'refreshToken': rt}, auth: false);
      } on ApiException {
        // Offline logout still signs out locally; the token expires on its own.
      }
    }
    await _tokens.clear();
    me = null;
    userId = null;
    status = AuthStatus.signedOut;
    notifyListeners();
  }

  /// The refresh token was refused — revoked, reused, or expired.
  void sessionExpired() {
    me = null;
    status = AuthStatus.signedOut;
    notifyListeners();
  }
}
