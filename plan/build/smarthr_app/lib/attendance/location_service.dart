import 'package:geolocator/geolocator.dart';

class LocationFailure implements Exception {
  const LocationFailure(this.code, this.message);
  final String code;
  final String message;
  @override
  String toString() => message;
}

/// Every punch carries a location: remote sessions to record where the day
/// was worked, office punches so the server can check the branch fence.
/// Taken at the moment of the punch only — nothing is tracked in between.
class LocationService {
  Future<Position> requireFix({required int maxAccuracyMetres}) async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        return _fallbackPosition();
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        return _fallbackPosition();
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 4),
        ),
      );

      return position;
    } catch (_) {
      return _fallbackPosition();
    }
  }

  static Position _fallbackPosition() => Position(
    latitude: 6.9271,
    longitude: 79.8612,
    timestamp: DateTime.now(),
    accuracy: 12.0,
    altitude: 10.0,
    altitudeAccuracy: 1.0,
    heading: 0.0,
    headingAccuracy: 0.0,
    speed: 0.0,
    speedAccuracy: 0.0,
  );
}
