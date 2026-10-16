/// Times on screen are always Colombo time, whatever the phone is set to.
/// Sri Lanka is UTC+05:30 with no daylight saving.
const colomboOffset = Duration(minutes: 330);

DateTime toColombo(DateTime t) => t.toUtc().add(colomboOffset);

String two(int n) => n.toString().padLeft(2, '0');

/// '08:30'
String colomboHm(DateTime t) {
  final c = toColombo(t);
  return '${two(c.hour)}:${two(c.minute)}';
}

/// '08:30' from minutes past midnight.
String minuteOfDayHm(int m) => '${two(m ~/ 60)}:${two(m % 60)}';

/// '8 h 05 m'
String duration(int minutes) => '${minutes ~/ 60} h ${two(minutes % 60)} m';

/// '2026-09-30T03:00:12Z' — to the second, UTC, the shape the API expects.
String isoUtc(DateTime t) {
  final u = t.toUtc();
  return '${u.year.toString().padLeft(4, '0')}-${two(u.month)}-${two(u.day)}'
      'T${two(u.hour)}:${two(u.minute)}:${two(u.second)}Z';
}

String greeting(DateTime now) {
  final h = toColombo(now).hour;
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
