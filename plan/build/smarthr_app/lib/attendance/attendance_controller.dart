import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../core/api_client.dart';
import '../core/api_exception.dart';
import 'location_service.dart';
import 'models.dart';
import 'punch_queue.dart';

enum PunchOutcome { sent, savedOffline, refused, failed }

class SyncResult {
  const SyncResult({required this.reachedServer, this.accepted = const {}, this.refused = const {}});
  final bool reachedServer;
  final Set<String> accepted; // accepted or duplicate — either way, recorded
  final Map<String, String> refused; // clientId → message
}

/// The home screen's brain. The server's /attendance/today is the truth; the
/// local queue is laid on top so a punch made offline shows immediately.
class AttendanceController extends ChangeNotifier {
  AttendanceController({
    required ApiClient api,
    required PunchQueue queue,
    required LocationService location,
    required this.userId,
  })  : _api = api,
        _queue = queue,
        _location = location;

  final ApiClient _api;
  final PunchQueue _queue;
  final LocationService _location;
  final String userId;

  TodayState? today;
  List<QueuedPunch> _pending = const [];
  bool loading = false;
  bool busy = false;
  bool offline = false;
  String? error;

  StreamSubscription<List<ConnectivityResult>>? _connectivity;
  Future<SyncResult>? _inflight;

  int get pendingCount => _pending.length;

  /// What the person should see right now, including punches still on the phone.
  String get effectiveState {
    if (_pending.isNotEmpty) return _pending.last.kind == 'IN' ? 'IN' : 'OUT';
    return today?.state ?? 'OUT';
  }

  String? get effectiveOpenMode {
    if (_pending.isNotEmpty && _pending.last.kind == 'IN') return _pending.last.mode;
    return today?.openMode;
  }

  void start() {
    refresh();
    _connectivity = Connectivity().onConnectivityChanged.listen((results) {
      if (!results.contains(ConnectivityResult.none)) sync();
    });
  }

  bool _disposed = false;

  @override
  void dispose() {
    _disposed = true;
    _connectivity?.cancel();
    super.dispose();
  }

  @override
  void notifyListeners() {
    if (!_disposed) super.notifyListeners();
  }

  void clearError() {
    error = null;
    notifyListeners();
  }

  Future<void> refresh() async {
    loading = true;
    notifyListeners();
    try {
      await sync();
      today = TodayState.fromJson(await _api.get('/attendance/today'));
      offline = false;
    } on ApiException catch (e) {
      if (e.isNetwork) {
        offline = true;
      } else {
        error = e.message;
      }
    } finally {
      _pending = await _queue.pending(userId);
      loading = false;
      notifyListeners();
    }
  }

  /// Mark in or out. Location first, then the phone's own database, then the
  /// server. If the server cannot be reached the punch is already safe.
  Future<PunchOutcome> punch({required String kind, required String mode}) async {
    busy = true;
    error = null;
    notifyListeners();
    try {
      final fix = await _location.requireFix(maxAccuracyMetres: today?.maxAccuracyMetres ?? 100);

      final queued = QueuedPunch(
        clientId: const Uuid().v4(),
        userId: userId,
        kind: kind,
        occurredAt: DateTime.now().toUtc(),
        mode: mode,
        lat: fix.latitude,
        lng: fix.longitude,
        accuracy: fix.accuracy.round(),
      );
      await _queue.add(queued); // 1. durable on the phone
      _pending = await _queue.pending(userId);
      notifyListeners();

      final result = await sync(); // 2. best effort, now
      if (!result.reachedServer) return PunchOutcome.savedOffline;
      if (result.refused.containsKey(queued.clientId)) {
        error = result.refused[queued.clientId];
        return PunchOutcome.refused;
      }
      return PunchOutcome.sent;
    } on LocationFailure catch (e) {
      error = e.message;
      return PunchOutcome.failed;
    } on TimeoutException {
      error = 'Could not get your location in time. Try again near a window or outdoors.';
      return PunchOutcome.failed;
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  /// Upload everything waiting on the phone. Safe to call at any time and any
  /// number of times: every punch carries its clientId, so the server records
  /// each one exactly once.
  Future<SyncResult> sync() async {
    // One upload at a time, and a punch made mid-upload waits its turn rather
    // than being skipped until the next connectivity change.
    while (_inflight != null) {
      await _inflight;
    }
    final run = _upload();
    _inflight = run;
    try {
      return await run;
    } finally {
      _inflight = null;
    }
  }

  Future<SyncResult> _upload() async {
    try {
      final pending = await _queue.pending(userId);
      if (pending.isEmpty) {
        _pending = const [];
        return const SyncResult(reachedServer: true);
      }

      final r = await _api.post('/attendance/sync', {
        'punches': pending.map((p) => p.toApi()).toList(),
      });

      final accepted = <String>{
        ...(r['accepted'] as List).map((x) => x.toString()),
        ...(r['duplicates'] as List).map((x) => x.toString()),
      };
      final refused = <String, String>{};
      for (final raw in (r['rejected'] as List)) {
        final x = Map<String, dynamic>.from(raw as Map);
        final id = x['clientId'];
        if (id is String) refused[id] = (x['message'] ?? 'A punch was refused.').toString();
      }

      // Refused punches leave the queue too: retrying them cannot succeed,
      // and the person has been told why.
      await _queue.remove([...accepted, ...refused.keys]);
      if (refused.isNotEmpty) error = refused.values.first;
      if (r['today'] is Map) {
        today = TodayState.fromJson(Map<String, dynamic>.from(r['today'] as Map));
      }
      offline = false;
      return SyncResult(reachedServer: true, accepted: accepted, refused: refused);
    } on ApiException catch (e) {
      if (e.isNetwork) {
        offline = true;
      } else {
        error = e.message;
      }
      return const SyncResult(reachedServer: false);
    } finally {
      _pending = await _queue.pending(userId);
      notifyListeners();
    }
  }
}
