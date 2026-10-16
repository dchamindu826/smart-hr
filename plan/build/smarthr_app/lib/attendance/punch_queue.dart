import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../core/format.dart';

/// A punch as it waits on the phone. Written here BEFORE it is sent, so a
/// dead connection at the factory gate never loses a mark-in.
class QueuedPunch {
  const QueuedPunch({
    required this.clientId,
    required this.userId,
    required this.kind,
    required this.occurredAt,
    required this.mode,
    required this.lat,
    required this.lng,
    required this.accuracy,
  });

  final String clientId; // generated once, reused on every retry
  final String userId; // whose punch — never upload one person's queue as another
  final String kind; // IN | OUT
  final DateTime occurredAt; // when it happened, not when it uploads
  final String mode; // OFFICE | REMOTE
  final double lat;
  final double lng;
  final int accuracy;

  Map<String, dynamic> toApi() => {
        'clientId': clientId,
        'kind': kind,
        'occurredAt': isoUtc(occurredAt),
        'mode': mode,
        'lat': lat.toStringAsFixed(7),
        'lng': lng.toStringAsFixed(7),
        'accuracy': accuracy,
      };

  Map<String, Object?> toRow() => {
        'client_id': clientId,
        'user_id': userId,
        'kind': kind,
        'occurred_at': isoUtc(occurredAt),
        'mode': mode,
        'lat': lat,
        'lng': lng,
        'accuracy': accuracy,
      };

  factory QueuedPunch.fromRow(Map<String, Object?> r) => QueuedPunch(
        clientId: r['client_id'] as String,
        userId: r['user_id'] as String,
        kind: r['kind'] as String,
        occurredAt: DateTime.parse(r['occurred_at'] as String),
        mode: r['mode'] as String,
        lat: (r['lat'] as num).toDouble(),
        lng: (r['lng'] as num).toDouble(),
        accuracy: (r['accuracy'] as num).toInt(),
      );
}

class PunchQueue {
  Database? _db;

  Future<Database> get _database async {
    return _db ??= await openDatabase(
      p.join(await getDatabasesPath(), 'smarthr_queue.db'),
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE punches (
            client_id   TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL,
            kind        TEXT NOT NULL,
            occurred_at TEXT NOT NULL,
            mode        TEXT NOT NULL,
            lat         REAL NOT NULL,
            lng         REAL NOT NULL,
            accuracy    INTEGER NOT NULL
          )
        ''');
      },
    );
  }

  Future<void> add(QueuedPunch punch) async {
    final db = await _database;
    await db.insert('punches', punch.toRow());
  }

  /// Oldest first — the server must see the IN before the OUT.
  Future<List<QueuedPunch>> pending(String userId) async {
    final db = await _database;
    final rows = await db.query(
      'punches',
      where: 'user_id = ?',
      whereArgs: [userId],
      orderBy: 'occurred_at ASC',
    );
    return rows.map(QueuedPunch.fromRow).toList();
  }

  Future<void> remove(Iterable<String> clientIds) async {
    final db = await _database;
    final batch = db.batch();
    for (final id in clientIds) {
      batch.delete('punches', where: 'client_id = ?', whereArgs: [id]);
    }
    await batch.commit(noResult: true);
  }
}
