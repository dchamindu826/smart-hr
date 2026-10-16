import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../core/api_exception.dart';
import '../theme.dart';

class LeaveScreen extends StatefulWidget {
  const LeaveScreen({super.key, required this.api});
  final ApiClient api;

  @override
  State<LeaveScreen> createState() => _LeaveScreenState();
}

class _LeaveScreenState extends State<LeaveScreen> {
  bool _loading = false;
  String? _error;
  List<Map<String, dynamic>> _balances = [];
  List<Map<String, dynamic>> _requests = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait([
        widget.api.get('/leave/balances'),
        widget.api.get('/leave/requests'),
      ]);

      if (mounted) {
        setState(() {
          _balances = ((results[0]['balances'] as List<dynamic>?) ?? [])
              .cast<Map<String, dynamic>>();
          _requests = ((results[1]['requests'] as List<dynamic>?) ?? [])
              .cast<Map<String, dynamic>>();
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
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load leave records.';
          _loading = false;
        });
      }
    }
  }

  void _openApplyModal() {
    showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ApplyLeaveSheet(
        api: widget.api,
        balances: _balances,
      ),
    ).then((applied) {
      if (applied == true) {
        _loadData();
      }
    });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'APPROVED':
        return Brand.ok;
      case 'PENDING':
        return Brand.warn;
      case 'DECLINED':
        return Brand.bad;
      case 'CANCELLED':
      default:
        return Colors.grey;
    }
  }

  String _formatDate(String? iso) {
    if (iso == null || iso.length < 10) return '—';
    try {
      final parts = iso.substring(0, 10).split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final m = int.parse(parts[1]);
      return '${parts[2]} ${months[m - 1]} ${parts[0]}';
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave Management', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _loadData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openApplyModal,
        backgroundColor: Brand.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Apply Leave', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: _loading
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
                          onPressed: _loadData,
                          child: const Text('Try again'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView(
                    padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 90),
                    children: [
                      // Section Title: Balances
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Leave Balances',
                            style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          Text(
                            'Year ${DateTime.now().year}',
                            style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Horizontal Balances Scroll
                      SizedBox(
                        height: 130,
                        child: _balances.isEmpty
                            ? Card(
                                child: Center(
                                  child: Text(
                                    'No leave balance policies configured.',
                                    style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                                  ),
                                ),
                              )
                            : ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: _balances.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 10),
                                itemBuilder: (context, i) {
                                  final b = _balances[i];
                                  return _balanceCard(context, b);
                                },
                              ),
                      ),

                      const SizedBox(height: 24),

                      // Section Title: Applications History
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'My Leave Requests',
                            style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          Text(
                            '${_requests.length} requests',
                            style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      if (_requests.isEmpty)
                        Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              children: [
                                Icon(Icons.beach_access_outlined, size: 44, color: t.colorScheme.primary),
                                const SizedBox(height: 12),
                                Text(
                                  'No leave requests yet',
                                  style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Tap "+ Apply Leave" below to submit your first leave application.',
                                  textAlign: TextAlign.center,
                                  style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        ..._requests.map((r) => _requestCard(context, r)),
                    ],
                  ),
                ),
    );
  }

  Widget _balanceCard(BuildContext context, Map<String, dynamic> b) {
    final t = Theme.of(context);
    final name = b['name'] as String? ?? 'Leave';
    final entitled = (b['entitled'] as num?)?.toDouble() ?? 0;
    final taken = (b['taken'] as num?)?.toDouble() ?? 0;
    final remaining = (b['remaining'] as num?)?.toDouble() ?? 0;
    final kind = b['kind'] as String? ?? 'ANNUAL';

    Color themeColor;
    if (kind == 'ANNUAL') {
      themeColor = Brand.blue;
    } else if (kind == 'CASUAL') {
      themeColor = Brand.ok;
    } else if (kind == 'MEDICAL') {
      themeColor = Brand.magenta;
    } else {
      themeColor = Brand.navy;
    }

    return Container(
      width: 160,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: t.colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: t.colorScheme.outlineVariant.withValues(alpha: 0.35)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  name,
                  style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: themeColor, shape: BoxShape.circle),
              ),
            ],
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                remaining.toStringAsFixed(remaining.truncateToDouble() == remaining ? 0 : 1),
                style: t.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: themeColor,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                'days left',
                style: t.textTheme.labelSmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
              ),
            ],
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: entitled > 0 ? (taken / entitled).clamp(0.0, 1.0) : 0,
              backgroundColor: themeColor.withValues(alpha: 0.15),
              color: themeColor,
              minHeight: 5,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Used: ${taken.toStringAsFixed(0)}',
                style: t.textTheme.labelSmall?.copyWith(fontSize: 10, color: t.colorScheme.onSurfaceVariant),
              ),
              Text(
                'Total: ${entitled.toStringAsFixed(0)}',
                style: t.textTheme.labelSmall?.copyWith(fontSize: 10, color: t.colorScheme.onSurfaceVariant),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _requestCard(BuildContext context, Map<String, dynamic> r) {
    final t = Theme.of(context);
    final typeName = r['leaveTypeName'] as String? ?? 'Leave';
    final fromDate = r['fromDate'] as String?;
    final toDate = r['toDate'] as String?;
    final days = (r['days'] as num?)?.toDouble() ?? 1;
    final reason = r['reason'] as String?;
    final status = r['status'] as String? ?? 'PENDING';
    final decisionNote = r['decisionNote'] as String?;

    final color = _statusColor(status);
    final daysLabel = '${days.toStringAsFixed(days.truncateToDouble() == days ? 0 : 1)} ${days == 1 ? 'day' : 'days'}';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    typeName,
                    style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    status,
                    style: t.textTheme.labelSmall?.copyWith(
                      color: color,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Date Range & duration
            Row(
              children: [
                Icon(Icons.calendar_today_outlined, size: 14, color: t.colorScheme.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(
                  fromDate == toDate ? _formatDate(fromDate) : '${_formatDate(fromDate)} – ${_formatDate(toDate)}',
                  style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: t.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    daysLabel,
                    style: t.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),

            if (reason != null && reason.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Reason: $reason',
                style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
              ),
            ],

            if (decisionNote != null && decisionNote.isNotEmpty) ...[
              const SizedBox(height: 6),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'HR Note: $decisionNote',
                  style: t.textTheme.bodySmall?.copyWith(color: color, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ApplyLeaveSheet extends StatefulWidget {
  const _ApplyLeaveSheet({required this.api, required this.balances});
  final ApiClient api;
  final List<Map<String, dynamic>> balances;

  @override
  State<_ApplyLeaveSheet> createState() => _ApplyLeaveSheetState();
}

class _ApplyLeaveSheetState extends State<_ApplyLeaveSheet> {
  String? _selectedLeaveTypeId;
  DateTime _fromDate = DateTime.now().add(const Duration(days: 1));
  DateTime _toDate = DateTime.now().add(const Duration(days: 1));
  final _reasonCtrl = TextEditingController();
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.balances.isNotEmpty) {
      _selectedLeaveTypeId = widget.balances.first['leaveTypeId'] as String?;
    }
  }

  @override
  void dispose() {
    _reasonCtrl.dispose();
    super.dispose();
  }

  int get _calculatedDays {
    if (_toDate.isBefore(_fromDate)) return 0;
    int count = 0;
    DateTime cur = _fromDate;
    while (!cur.isAfter(_toDate)) {
      if (cur.weekday != DateTime.sunday) count++;
      cur = cur.add(const Duration(days: 1));
    }
    return count == 0 ? 1 : count;
  }

  String _formatIso(DateTime dt) {
    final y = dt.year;
    final m = dt.month.toString().padLeft(2, '0');
    final d = dt.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  Future<void> _selectDate(BuildContext context, bool isFrom) async {
    final initial = isFrom ? _fromDate : _toDate;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 180)),
    );

    if (picked != null) {
      setState(() {
        if (isFrom) {
          _fromDate = picked;
          if (_toDate.isBefore(_fromDate)) {
            _toDate = _fromDate;
          }
        } else {
          _toDate = picked;
          if (_toDate.isBefore(_fromDate)) {
            _fromDate = _toDate;
          }
        }
      });
    }
  }

  Future<void> _submit() async {
    if (_selectedLeaveTypeId == null) {
      setState(() => _error = 'Please select a leave type.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await widget.api.post('/leave/apply', {
        'leaveTypeId': _selectedLeaveTypeId,
        'fromDate': _formatIso(_fromDate),
        'toDate': _formatIso(_toDate),
        'days': _calculatedDays,
        'reason': _reasonCtrl.text.trim(),
      });

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Leave application submitted for approval!')),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _error = e.message;
          _submitting = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Failed to submit leave application.';
          _submitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final keyboardPad = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.only(left: 20, right: 20, top: 20, bottom: 20 + keyboardPad),
      decoration: BoxDecoration(
        color: t.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Apply for Leave',
                  style: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(height: 16),

            if (_error != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: t.colorScheme.errorContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _error!,
                  style: TextStyle(color: t.colorScheme.onErrorContainer),
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Leave Type Dropdown
            Text('Leave Type', style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: _selectedLeaveTypeId,
              decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12)),
              items: widget.balances.map((b) {
                final id = b['leaveTypeId'] as String;
                final name = b['name'] as String;
                final rem = (b['remaining'] as num?)?.toDouble() ?? 0;
                return DropdownMenuItem(
                  value: id,
                  child: Text('$name (${rem.toStringAsFixed(0)} days left)'),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedLeaveTypeId = v),
            ),

            const SizedBox(height: 16),

            // Date Pickers Row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('From Date', style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: () => _selectDate(context, true),
                        borderRadius: BorderRadius.circular(8),
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            suffixIcon: Icon(Icons.calendar_today, size: 18),
                          ),
                          child: Text(_formatIso(_fromDate)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('To Date', style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: () => _selectDate(context, false),
                        borderRadius: BorderRadius.circular(8),
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            suffixIcon: Icon(Icons.calendar_today, size: 18),
                          ),
                          child: Text(_formatIso(_toDate)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Brand.blue.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 16, color: Brand.blue),
                  const SizedBox(width: 8),
                  Text(
                    'Total duration: $_calculatedDays working ${_calculatedDays == 1 ? 'day' : 'days'}',
                    style: const TextStyle(color: Brand.blue, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Reason
            Text('Reason (optional)', style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            TextField(
              controller: _reasonCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Enter reason or notes for your manager...',
                contentPadding: EdgeInsets.all(12),
              ),
            ),

            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton(
                onPressed: _submitting ? null : _submit,
                style: FilledButton.styleFrom(backgroundColor: Brand.blue),
                child: _submitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Submit Application', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
