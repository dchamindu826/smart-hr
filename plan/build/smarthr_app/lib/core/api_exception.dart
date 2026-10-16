import 'package:dio/dio.dart';

/// Every failure the app shows. `code` is for branching, `message` is for people.
class ApiException implements Exception {
  const ApiException(this.code, this.message, {this.status, this.field});

  final String code;
  final String message;
  final int? status;
  final String? field;

  bool get isNetwork => code == 'NETWORK';

  factory ApiException.fromDio(DioException e) {
    final res = e.response;
    if (res == null) {
      return const ApiException('NETWORK', 'No connection to the server.');
    }
    final data = res.data;
    if (data is Map && data['error'] is Map) {
      final err = data['error'] as Map;
      return ApiException(
        err['code']?.toString() ?? 'ERROR',
        err['message']?.toString() ?? 'Something went wrong.',
        status: res.statusCode,
        field: err['field']?.toString(),
      );
    }
    return ApiException(
      'HTTP_${res.statusCode}',
      'The server returned an error (${res.statusCode}).',
      status: res.statusCode,
    );
  }

  @override
  String toString() => message;
}
