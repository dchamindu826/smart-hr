import 'package:dio/dio.dart';

import '../config.dart';
import 'api_exception.dart';
import 'token_store.dart';

/// One client for the whole app. Attaches the access token, and when the
/// server says 401 it swaps the refresh token for a new pair once and retries.
/// The queued interceptor means two requests failing together refresh once,
/// not twice — a second refresh with the same token would sign the user out.
class ApiClient {
  ApiClient(this._tokens) {
    final options = BaseOptions(
      baseUrl: apiBase,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
      contentType: 'application/json',
    );
    _bare = Dio(options);
    _dio = Dio(options);
    _dio.interceptors.add(
      QueuedInterceptorsWrapper(
        onRequest: (req, handler) async {
          req.baseUrl = apiBase;
          final token = await _tokens.access;
          if (token != null) req.headers['Authorization'] = 'Bearer $token';
          handler.next(req);
        },
        onError: (e, handler) async {
          final opts = e.requestOptions;
          if (e.response?.statusCode != 401 || opts.extra['retried'] == true) {
            return handler.next(e);
          }
          if (!await _refresh()) {
            if (!_tokens.isDemo) {
              onSessionExpired?.call();
            }
            return handler.next(e);
          }
          opts.extra['retried'] = true;
          opts.headers['Authorization'] = 'Bearer ${await _tokens.access}';
          try {
            // Retried on the bare client: re-entering this queued interceptor
            // from inside its own handler would deadlock.
            handler.resolve(await _bare.fetch(opts));
          } on DioException catch (err) {
            handler.next(err);
          }
        },
      ),
    );
  }

  final TokenStore _tokens;
  late final Dio _dio;
  late final Dio _bare;
  bool _demoInState = false;

  /// Called when the refresh token is rejected. The app returns to login.
  void Function()? onSessionExpired;

  Future<bool> _refresh() async {
    final rt = await _tokens.refresh;
    if (rt == null) return false;
    try {
      final r = await _bare.post('/auth/refresh', data: {'refreshToken': rt});
      final d = Map<String, dynamic>.from(r.data as Map);
      await _tokens.saveTokens(
        access: d['accessToken'] as String,
        refresh: d['refreshToken'] as String,
      );
      return true;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) await _tokens.clear();
      return false;
    }
  }

  Future<Map<String, dynamic>> get(String path) async {
    if (_tokens.isDemo) {
      final mock = _mockGet(path);
      if (mock != null) return mock;
    }
    _dio.options.baseUrl = apiBase;
    return _send(() => _dio.get(path));
  }

  /// [auth] false for login, refresh and logout, which carry their own proof.
  Future<Map<String, dynamic>> post(String path, Object? data, {bool auth = true}) async {
    if (_tokens.isDemo) {
      final mock = _mockPost(path, data);
      if (mock != null) return mock;
    }
    final client = auth ? _dio : _bare;
    client.options.baseUrl = apiBase;
    return _send(() => client.post(path, data: data));
  }

  Map<String, dynamic>? _mockGet(String path) {
    final now = DateTime.now();
    final todayStr = now.toIso8601String().substring(0, 10);

    if (path.startsWith('/attendance/today')) {
      return {
        'date': todayStr,
        'state': _demoInState ? 'IN' : 'OUT',
        'openSession': _demoInState
            ? {
                'id': 'sess-live',
                'startAt': now.subtract(const Duration(hours: 3, minutes: 20)).toIso8601String(),
                'endAt': null,
                'minutes': 200,
                'mode': 'OFFICE',
                'placeLabel': 'Colombo HQ Main Gate',
                'flagged': false,
              }
            : null,
        'roster': {
          'shiftName': 'General Shift (HQ)',
          'startMinute': 510,
          'totalMinutes': 540,
          'paidMinutes': 480,
          'plannedOtMinutes': 60,
          'mode': 'OFFICE',
          'isOffDay': false,
        },
        'sessions': [
          {
            'id': 'sess-morning',
            'startAt': '${todayStr}T08:30:00Z',
            'endAt': '${todayStr}T12:30:00Z',
            'minutes': 240,
            'mode': 'OFFICE',
            'placeLabel': 'Colombo HQ Main Gate',
            'flagged': false,
          }
        ],
        'paidMinutes': _demoInState ? 440 : 240,
        'mealDeducted': true,
        'branch': {'name': 'Colombo HQ'},
        'maxAccuracyMetres': 100,
      };
    }

    if (path.startsWith('/attendance/history')) {
      return {
        'summary': {
          'presentDays': 21,
          'totalHours': 176.5,
          'lateDays': 2,
          'overtimeHours': 18.5,
        },
        'days': [
          {
            'date': '2026-10-06',
            'dayOfWeek': 'Tue',
            'status': 'PRESENT',
            'firstIn': '2026-10-06T08:28:00Z',
            'lastOut': '2026-10-06T17:34:00Z',
            'minutes': 546,
            'shiftName': 'General Shift (HQ)',
            'holidayName': null,
            'leaveName': null,
            'sessions': [],
          },
          {
            'date': '2026-10-05',
            'dayOfWeek': 'Mon',
            'status': 'LATE',
            'firstIn': '2026-10-05T09:12:00Z',
            'lastOut': '2026-10-05T18:00:00Z',
            'minutes': 528,
            'shiftName': 'General Shift (HQ)',
            'holidayName': null,
            'leaveName': null,
            'sessions': [],
          },
          {
            'date': '2026-10-04',
            'dayOfWeek': 'Sun',
            'status': 'OFF_DAY',
            'firstIn': null,
            'lastOut': null,
            'minutes': 0,
            'shiftName': 'Weekend Off',
            'holidayName': null,
            'leaveName': null,
            'sessions': [],
          },
          {
            'date': '2026-10-03',
            'dayOfWeek': 'Sat',
            'status': 'OFF_DAY',
            'firstIn': null,
            'lastOut': null,
            'minutes': 0,
            'shiftName': 'Weekend Off',
            'holidayName': null,
            'leaveName': null,
            'sessions': [],
          },
          {
            'date': '2026-10-02',
            'dayOfWeek': 'Fri',
            'status': 'PRESENT',
            'firstIn': '2026-10-02T08:30:00Z',
            'lastOut': '2026-10-02T17:05:00Z',
            'minutes': 515,
            'shiftName': 'General Shift (HQ)',
            'holidayName': null,
            'leaveName': null,
            'sessions': [],
          },
        ],
      };
    }

    if (path.startsWith('/leave/balances')) {
      return {
        'balances': [
          {
            'id': 'b-1',
            'name': 'Annual Leave',
            'kind': 'ANNUAL',
            'entitled': 14,
            'taken': 3,
            'remaining': 11,
          },
          {
            'id': 'b-2',
            'name': 'Casual Leave',
            'kind': 'CASUAL',
            'entitled': 7,
            'taken': 2,
            'remaining': 5,
          },
          {
            'id': 'b-3',
            'name': 'Medical Leave',
            'kind': 'MEDICAL',
            'entitled': 14,
            'taken': 1,
            'remaining': 13,
          },
        ]
      };
    }

    if (path.startsWith('/leave/requests')) {
      return {
        'requests': [
          {
            'id': 'lr-1',
            'leaveTypeName': 'Annual Leave',
            'fromDate': '2026-10-14',
            'toDate': '2026-10-15',
            'days': 2.0,
            'status': 'APPROVED',
            'reason': 'Family vacation to Nuwara Eliya',
            'decisionNote': 'Approved by Department Head',
          },
          {
            'id': 'lr-2',
            'leaveTypeName': 'Casual Leave',
            'fromDate': '2026-10-22',
            'toDate': '2026-10-22',
            'days': 1.0,
            'status': 'PENDING',
            'reason': 'Personal bank appointment',
            'decisionNote': null,
          },
        ]
      };
    }

    if (path.startsWith('/pay/payslips')) {
      return {
        'basicSalary': 285000,
        'estimatedStructure': {
          'epfEmployee': 22800,
          'epfEmployer': 34200,
          'etf': 8550,
        },
        'payslips': [
          {
            'id': 'ps-sep-2026',
            'periodLabel': 'September 2026',
            'net': 339600,
            'gross': 362400,
            'deductions': 22800,
            'epfEmployee': 22800,
            'epfEmployer': 34200,
            'etf': 8550,
            'daysWorked': 22,
            'status': 'PAID',
            'lines': [
              {'kind': 'EARNING', 'name': 'Basic Salary', 'amount': 285000},
              {'kind': 'EARNING', 'name': 'Fixed Transport Allowance', 'amount': 25000},
              {'kind': 'EARNING', 'name': 'Communication Allowance', 'amount': 20000},
              {'kind': 'EARNING', 'name': 'Overtime 1.5x (18.5 hrs)', 'amount': 32400},
              {'kind': 'DEDUCTION', 'name': 'EPF Employee 8%', 'amount': 22800},
            ],
          },
          {
            'id': 'ps-aug-2026',
            'periodLabel': 'August 2026',
            'net': 334200,
            'gross': 357000,
            'deductions': 22800,
            'epfEmployee': 22800,
            'epfEmployer': 34200,
            'etf': 8550,
            'daysWorked': 21,
            'status': 'PAID',
            'lines': [
              {'kind': 'EARNING', 'name': 'Basic Salary', 'amount': 285000},
              {'kind': 'EARNING', 'name': 'Fixed Transport Allowance', 'amount': 25000},
              {'kind': 'EARNING', 'name': 'Communication Allowance', 'amount': 20000},
              {'kind': 'EARNING', 'name': 'Overtime 1.5x (15.0 hrs)', 'amount': 27000},
              {'kind': 'DEDUCTION', 'name': 'EPF Employee 8%', 'amount': 22800},
            ],
          },
        ]
      };
    }

    if (path.startsWith('/me')) {
      return {
        'user': {'id': 'demo-kamal-perera', 'email': 'kamal.p@abcholdings.lk', 'role': 'EMPLOYEE'},
        'tenant': {'name': 'ABC Holdings'},
        'employee': {
          'fullName': 'Kamal Perera',
          'empNo': 'EMP-2024-042',
          'designation': 'Senior Software Engineer',
          'epfMemberNo': '84920/ABC',
          'remoteLabel': 'Home · Mount Lavinia',
          'branch': {'name': 'Colombo HQ'},
          'department': {'name': 'Engineering'},
        }
      };
    }

    return null;
  }

  Map<String, dynamic>? _mockPost(String path, Object? data) {
    if (path.startsWith('/attendance/punch')) {
      _demoInState = !_demoInState;
      return {
        'success': true,
        'state': _demoInState ? 'IN' : 'OUT',
        'message': _demoInState ? 'Punched in successfully at Colombo HQ' : 'Punched out successfully at Colombo HQ',
      };
    }
    if (path.startsWith('/leave/apply') || path.startsWith('/leave/requests')) {
      return {'success': true, 'message': 'Leave application submitted successfully.'};
    }
    if (path.startsWith('/auth/logout')) {
      _demoInState = false;
      return {'success': true};
    }
    return null;
  }

  Future<Map<String, dynamic>> _send(Future<Response<dynamic>> Function() call) async {
    try {
      final r = await call();
      return Map<String, dynamic>.from(r.data as Map);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
