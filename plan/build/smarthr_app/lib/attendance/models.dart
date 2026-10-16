/// Plain models for the API shapes in docs/API.md. Hand-written for this first
/// slice; generate them from openapi.json once the API grows past a few endpoints.
library;

class Me {
  const Me({
    required this.userId,
    required this.email,
    required this.role,
    required this.tenantName,
    this.employeeName,
    this.empNo,
    this.designation,
    this.branchName,
    this.departmentName,
    this.epfMemberNo,
    this.remoteLabel,
  });

  final String userId;
  final String email;
  final String role;
  final String tenantName;
  final String? employeeName;
  final String? empNo;
  final String? designation;
  final String? branchName;
  final String? departmentName;
  final String? epfMemberNo;
  final String? remoteLabel;

  String get displayName => employeeName ?? email;
  String get firstName => displayName.split(' ').first;

  factory Me.fromJson(Map<String, dynamic> j) {
    final u = Map<String, dynamic>.from(j['user'] as Map);
    final t = Map<String, dynamic>.from(j['tenant'] as Map);
    final e = j['employee'] == null ? null : Map<String, dynamic>.from(j['employee'] as Map);
    final branch = e?['branch'] == null ? null : Map<String, dynamic>.from(e!['branch'] as Map);
    final dept = e?['department'] == null ? null : Map<String, dynamic>.from(e!['department'] as Map);
    return Me(
      userId: u['id'] as String,
      email: u['email'] as String,
      role: u['role'] as String,
      tenantName: t['name'] as String,
      employeeName: e?['fullName'] as String?,
      empNo: e?['empNo'] as String?,
      designation: e?['designation'] as String?,
      branchName: branch?['name'] as String?,
      departmentName: dept?['name'] as String?,
      epfMemberNo: e?['epfMemberNo'] as String?,
      remoteLabel: e?['remoteLabel'] as String?,
    );
  }
}

class WorkSession {
  const WorkSession({
    required this.id,
    required this.startAt,
    required this.endAt,
    required this.minutes,
    required this.mode,
    required this.placeLabel,
    required this.flagged,
  });

  final String id;
  final DateTime startAt;
  final DateTime? endAt;
  final int minutes;
  final String mode; // OFFICE | REMOTE
  final String? placeLabel;
  final bool flagged;

  bool get isRemote => mode == 'REMOTE';

  factory WorkSession.fromJson(Map<String, dynamic> j) => WorkSession(
        id: j['id'] as String,
        startAt: DateTime.parse(j['startAt'] as String),
        endAt: j['endAt'] == null ? null : DateTime.parse(j['endAt'] as String),
        minutes: (j['minutes'] as num).toInt(),
        mode: j['mode'] as String,
        placeLabel: j['placeLabel'] as String?,
        flagged: j['flagged'] == true,
      );
}

class RosterDay {
  const RosterDay({
    required this.shiftName,
    required this.startMinute,
    required this.totalMinutes,
    required this.paidMinutes,
    required this.plannedOtMinutes,
    required this.mode,
    required this.isOffDay,
  });

  final String? shiftName;
  final int? startMinute;
  final int totalMinutes;
  final int paidMinutes;
  final int plannedOtMinutes;
  final String mode; // OFFICE | REMOTE | EITHER | SPLIT
  final bool isOffDay;

  factory RosterDay.fromJson(Map<String, dynamic> j) => RosterDay(
        shiftName: j['shiftName'] as String?,
        startMinute: (j['startMinute'] as num?)?.toInt(),
        totalMinutes: (j['totalMinutes'] as num).toInt(),
        paidMinutes: (j['paidMinutes'] as num).toInt(),
        plannedOtMinutes: (j['plannedOtMinutes'] as num).toInt(),
        mode: j['mode'] as String,
        isOffDay: j['isOffDay'] == true,
      );
}

class TodayState {
  const TodayState({
    required this.date,
    required this.state,
    required this.openMode,
    required this.roster,
    required this.sessions,
    required this.paidMinutes,
    required this.mealDeducted,
    required this.branchName,
    required this.maxAccuracyMetres,
  });

  final String date;
  final String state; // OUT | IN | DONE
  final String? openMode;
  final RosterDay? roster;
  final List<WorkSession> sessions;
  final int paidMinutes;
  final bool mealDeducted;
  final String? branchName;
  final int maxAccuracyMetres;

  /// 0.0 to 1.0 of the rostered paid day. Null when nothing is rostered.
  double? get progress {
    final r = roster;
    if (r == null || r.isOffDay || r.paidMinutes == 0) return null;
    return (paidMinutes / r.paidMinutes).clamp(0.0, 1.0);
  }

  factory TodayState.fromJson(Map<String, dynamic> j) {
    final open = j['openSession'] == null ? null : Map<String, dynamic>.from(j['openSession'] as Map);
    final branch = j['branch'] == null ? null : Map<String, dynamic>.from(j['branch'] as Map);
    return TodayState(
      date: j['date'] as String,
      state: j['state'] as String,
      openMode: open?['mode'] as String?,
      roster: j['roster'] == null ? null : RosterDay.fromJson(Map<String, dynamic>.from(j['roster'] as Map)),
      sessions: (j['sessions'] as List)
          .map((s) => WorkSession.fromJson(Map<String, dynamic>.from(s as Map)))
          .toList(),
      paidMinutes: (j['paidMinutes'] as num).toInt(),
      mealDeducted: j['mealDeducted'] == true,
      branchName: branch?['name'] as String?,
      maxAccuracyMetres: (j['maxAccuracyMetres'] as num?)?.toInt() ?? 100,
    );
  }
}
