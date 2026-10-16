import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../core/api_exception.dart';
import '../theme.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key, required this.api});
  final ApiClient api;

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  late DateTime _currentMonth;
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _currentMonth = DateTime(now.year, now.month, 1);
    _loadHistory();
  }

  String get _monthKey {
    final y = _currentMonth.year;
    final m = _currentMonth.month.toString().padLeft(2, '0');
    return '$y-$m';
  }

  String get _monthLabel {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[_currentMonth.month - 1]} ${_currentMonth.year}';
  }

  void _prevMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1, 1);
    });
    _loadHistory();
  }

  void _nextMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 1);
    });
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await widget.api.get('/attendance/history?month=$_monthKey');
      if (mounted) {
        setState(() {
          _data = res;
          _loading = false;
        });
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _error = e.message;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load attendance history.';
          _loading = false;
        });
      }
    }
  }

  String _formatTime(String? iso) {
    if (iso == null || iso.isEmpty) return '—';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final h = dt.hour;
      final m = dt.minute.toString().padLeft(2, '0');
      final period = h >= 12 ? 'PM' : 'AM';
      final h12 = h == 0 ? 12 : (h > 12 ? h - 12 : h);
      return '$h12:$m $period';
    } catch (_) {
      return '—';
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PRESENT':
        return Brand.ok;
      case 'LATE':
        return Brand.warn;
      case 'ON_LEAVE':
        return Brand.blue;
      case 'HOLIDAY':
        return Brand.magenta;
      case 'OFF_DAY':
        return Colors.grey;
      case 'SCHEDULED':
        return Colors.blueGrey;
      case 'ABSENT':
      default:
        return Brand.bad;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'PRESENT':
        return Icons.check_circle_outline;
      case 'LATE':
        return Icons.schedule;
      case 'ON_LEAVE':
        return Icons.beach_access_outlined;
      case 'HOLIDAY':
        return Icons.celebration_outlined;
      case 'OFF_DAY':
        return Icons.weekend_outlined;
      case 'SCHEDULED':
        return Icons.event_available_outlined;
      case 'ABSENT':
      default:
        return Icons.cancel_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final summary = _data?['summary'] as Map<String, dynamic>?;
    final days = (_data?['days'] as List<dynamic>?) ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Attendance', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _loadHistory,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          // Month navigator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              decoration: BoxDecoration(
                color: t.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: _prevMonth,
                  ),
                  Text(
                    _monthLabel,
                    style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: _nextMonth,
                  ),
                ],
              ),
            ),
          ),

          // Monthly summary metrics cards
          if (summary != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  _statCard(
                    context,
                    label: 'Present',
                    value: '${summary['presentDays'] ?? 0}',
                    unit: 'days',
                    color: Brand.ok,
                    icon: Icons.check_circle_outline,
                  ),
                  const SizedBox(width: 8),
                  _statCard(
                    context,
                    label: 'Worked',
                    value: '${summary['totalHours'] ?? 0}',
                    unit: 'hrs',
                    color: Brand.blue,
                    icon: Icons.access_time_outlined,
                  ),
                  const SizedBox(width: 8),
                  _statCard(
                    context,
                    label: 'Late',
                    value: '${summary['lateDays'] ?? 0}',
                    unit: 'days',
                    color: Brand.warn,
                    icon: Icons.schedule,
                  ),
                  const SizedBox(width: 8),
                  _statCard(
                    context,
                    label: 'OT',
                    value: '${summary['overtimeHours'] ?? 0}',
                    unit: 'hrs',
                    color: Brand.magenta,
                    icon: Icons.trending_up,
                  ),
                ],
              ),
            ),

          const SizedBox(height: 8),

          // Body: Loading, Error, or Days List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.error_outline, size: 48, color: t.colorScheme.error),
                              const SizedBox(height: 12),
                              Text(_error!, textAlign: TextAlign.center),
                              const SizedBox(height: 16),
                              FilledButton.tonal(
                                onPressed: _loadHistory,
                                child: const Text('Try again'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadHistory,
                        child: days.isEmpty
                            ? ListView(
                                children: const [
                                  SizedBox(height: 60),
                                  Center(child: Text('No attendance records for this month.')),
                                ],
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                itemCount: days.length,
                                itemBuilder: (context, i) {
                                  final d = days[i] as Map<String, dynamic>;
                                  return _dayCard(context, d);
                                },
                              ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(
    BuildContext context, {
    required String label,
    required String value,
    required String unit,
    required Color color,
    required IconData icon,
  }) {
    final t = Theme.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  value,
                  style: t.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
                const SizedBox(width: 2),
                Text(
                  unit,
                  style: t.textTheme.labelSmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: t.textTheme.labelSmall?.copyWith(fontSize: 10, color: t.colorScheme.onSurfaceVariant),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _dayCard(BuildContext context, Map<String, dynamic> day) {
    final t = Theme.of(context);
    final dateStr = day['date'] as String? ?? '';
    final dayOfWeek = day['dayOfWeek'] as String? ?? '';
    final status = day['status'] as String? ?? 'ABSENT';
    final firstIn = day['firstIn'] as String?;
    final lastOut = day['lastOut'] as String?;
    final minutes = (day['minutes'] as num?)?.toInt() ?? 0;
    final shiftName = day['shiftName'] as String? ?? 'Shift';
    final holidayName = day['holidayName'] as String?;
    final leaveName = day['leaveName'] as String?;
    final sessions = (day['sessions'] as List<dynamic>?) ?? [];

    final color = _statusColor(status);
    final icon = _statusIcon(status);

    // Format day number from YYYY-MM-DD
    final dayNum = dateStr.length >= 10 ? dateStr.substring(8, 10) : '';

    final hoursWorked = minutes > 0
        ? '${minutes ~/ 60}h ${(minutes % 60).toString().padLeft(2, '0')}m'
        : '0h 00m';

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            Row(
              children: [
                // Date square
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: t.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        dayNum,
                        style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      Text(
                        dayOfWeek,
                        style: t.textTheme.labelSmall?.copyWith(
                          color: t.colorScheme.onSurfaceVariant,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),

                // Main Info: Shift & Status
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              holidayName ?? leaveName ?? shiftName,
                              style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(icon, size: 12, color: color),
                                const SizedBox(width: 4),
                                Text(
                                  status.replaceAll('_', ' '),
                                  style: t.textTheme.labelSmall?.copyWith(
                                    color: color,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),

                      // In / Out row or info
                      if (firstIn != null)
                        Row(
                          children: [
                            Text(
                              'In: ${_formatTime(firstIn)}',
                              style: t.textTheme.bodySmall?.copyWith(
                                color: t.colorScheme.onSurfaceVariant,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Out: ${_formatTime(lastOut)}',
                              style: t.textTheme.bodySmall?.copyWith(
                                color: t.colorScheme.onSurfaceVariant,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              hoursWorked,
                              style: t.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: Brand.navy,
                              ),
                            ),
                          ],
                        )
                      else
                        Text(
                          status == 'OFF_DAY'
                              ? 'Weekly Rest Day'
                              : status == 'HOLIDAY'
                                  ? 'Public / Poya Holiday'
                                  : status == 'ON_LEAVE'
                                      ? 'Approved Leave'
                                      : 'No punches logged',
                          style: t.textTheme.bodySmall?.copyWith(
                            color: t.colorScheme.onSurfaceVariant,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),

            // Multiple sessions expansion if split
            if (sessions.length > 1) ...[
              const Divider(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${sessions.length} sessions logged on this day',
                    style: t.textTheme.labelSmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                  ),
                  Text(
                    'Total $hoursWorked',
                    style: t.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
