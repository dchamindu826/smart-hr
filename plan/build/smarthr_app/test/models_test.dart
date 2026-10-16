import 'package:flutter_test/flutter_test.dart';
import 'package:smarthr_app/attendance/models.dart';
import 'package:smarthr_app/attendance/punch_queue.dart';
import 'package:smarthr_app/core/format.dart';

void main() {
  test('shows Colombo time whatever the phone is set to', () {
    expect(colomboHm(DateTime.utc(2026, 9, 30, 3, 0)), '08:30');
    expect(colomboHm(DateTime.utc(2026, 9, 29, 20, 30)), '02:00');
  });

  test('sends times to the second, UTC, ending in Z', () {
    expect(isoUtc(DateTime.utc(2026, 9, 30, 3, 0, 12, 345)), '2026-09-30T03:00:12Z');
  });

  test('sends coordinates as strings so no precision is lost', () {
    final p = QueuedPunch(
      clientId: '4f2a0000-0000-4000-8000-000000000000',
      userId: 'u1',
      kind: 'IN',
      occurredAt: DateTime.utc(2026, 9, 30, 3),
      mode: 'REMOTE',
      lat: 6.8649,
      lng: 79.8997,
      accuracy: 24,
    );
    expect(p.toApi()['lat'], '6.8649000');
    expect(p.toApi()['occurredAt'], '2026-09-30T03:00:00Z');
  });

  test('reads /attendance/today and works out progress', () {
    final t = TodayState.fromJson({
      'date': '2026-09-30',
      'state': 'IN',
      'openSession': {'id': 's2', 'mode': 'REMOTE', 'startAt': '2026-09-30T08:35:00.000Z'},
      'roster': {
        'shiftName': 'General', 'startMinute': 510, 'totalMinutes': 540, 'mealMinutes': 60,
        'paidMinutes': 480, 'plannedOtMinutes': 0, 'mode': 'EITHER', 'isOffDay': false,
      },
      'sessions': [
        {
          'id': 's1', 'date': '2026-09-30', 'startAt': '2026-09-30T03:00:00.000Z',
          'endAt': '2026-09-30T07:00:00.000Z', 'minutes': 240, 'mode': 'OFFICE',
          'source': 'MOBILE_GPS', 'placeLabel': null, 'flagged': false, 'flagReason': null,
        },
      ],
      'workedMinutes': 240,
      'paidMinutes': 240,
      'mealDeducted': false,
      'branch': {'name': 'Colombo HQ', 'lat': 6.9271, 'lng': 79.8612, 'fenceMetres': 150},
      'requiresLocation': true,
      'maxAccuracyMetres': 100,
    });
    expect(t.openMode, 'REMOTE');
    expect(t.progress, 0.5);
    expect(t.sessions.single.minutes, 240);
    expect(t.branchName, 'Colombo HQ');
  });
}
