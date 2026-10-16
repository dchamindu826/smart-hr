import 'package:flutter/material.dart';

import '../attendance/attendance_controller.dart';
import '../attendance/models.dart';
import '../auth/auth_controller.dart';
import '../core/format.dart';
import '../theme.dart';
import '../widgets/day_dial.dart';
import '../widgets/remote_verification_sheet.dart';

import 'sub_screens.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.auth, required this.attendance});
  final AuthController auth;
  final AttendanceController attendance;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _insideBranch = true;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.attendance,
      builder: (context, _) {
        final t = Theme.of(context);
        final c = widget.attendance;
        final today = c.today;
        final me = widget.auth.me;

        return SafeArea(
          child: RefreshIndicator(
            onRefresh: c.refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Image.asset('assets/images/logo.png', height: 28, fit: BoxFit.contain),
                    if (c.pendingCount > 0)
                      Badge(
                        label: Text('${c.pendingCount}'),
                        child: const Icon(Icons.cloud_upload_outlined, size: 20),
                      ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  '${greeting(DateTime.now())}${me != null ? ', ${me.firstName}' : ''}',
                  style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  [me?.tenantName ?? 'ABC Holdings', today?.branchName ?? 'Colombo HQ'].join(' · '),
                  style: t.textTheme.bodyMedium?.copyWith(color: t.colorScheme.onSurfaceVariant),
                ),
                const SizedBox(height: 16),
                if (c.offline || c.pendingCount > 0) _Banner.offline(c),
                if (c.error != null) _Banner.error(c.error!, onClose: c.clearError),
                const SizedBox(height: 8),
                Center(
                  child: DayDial(
                    progress: today?.progress ?? 0.35,
                    child: _PunchButton(controller: c, employeeName: me?.displayName),
                  ),
                ),
                const SizedBox(height: 14),

                // Simulated Geofence Location Pill (Tap to toggle)
                Center(
                  child: InkWell(
                    onTap: () {
                      setState(() => _insideBranch = !_insideBranch);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          duration: const Duration(milliseconds: 1400),
                          content: Text(_insideBranch
                              ? 'GPS: You are within Colombo HQ geofence (38 m).'
                              : 'GPS: You are outside branch geofence (1.2 km away).'),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: _insideBranch ? Brand.ok.withValues(alpha: 0.12) : Brand.warn.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _insideBranch ? Brand.ok.withValues(alpha: 0.3) : Brand.warn.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.circle,
                            size: 8,
                            color: _insideBranch ? Brand.ok : Brand.warn,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _insideBranch ? 'Inside Colombo HQ · 38 m from gate' : 'Outside Fence · 1.2 km away (Tap to test)',
                            style: TextStyle(
                              color: _insideBranch ? Brand.ok : Brand.warn,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),
                _Stamp(today: today),

                const SizedBox(height: 16),
                // Monthly KPIs Card
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('This Month', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('OT hours', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                  const SizedBox(height: 2),
                                  Text('18.5', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Brand.blue)),
                                ],
                              ),
                            ),
                            Container(width: 1, height: 32, color: Colors.grey.withValues(alpha: 0.2)),
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.only(left: 14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Late', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                    const SizedBox(height: 2),
                                    Text('2', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Brand.warn)),
                                  ],
                                ),
                              ),
                            ),
                            Container(width: 1, height: 32, color: Colors.grey.withValues(alpha: 0.2)),
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.only(left: 14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Leave left', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                    const SizedBox(height: 2),
                                    Text('11', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Brand.ok)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),
                // Quick Hub - Sub Screens Grid
                const Text(
                  'Quick Access & Tools',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 10),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.95,
                  children: [
                    _quickTile(context, 'Roster', Icons.event_available, Brand.blue, const RosterScreen()),
                    _quickTile(context, 'Expenses', Icons.receipt_long, Brand.magenta, const ExpensesScreen()),
                    _quickTile(context, 'Documents', Icons.description_outlined, Colors.deepOrange, const DocumentsScreen()),
                    _quickTile(context, 'Assets', Icons.devices_other, Brand.navy, const AssetsScreen()),
                    _quickTile(context, 'Moments', Icons.celebration, Brand.pink, const MomentsScreen()),
                    _quickTile(context, 'Reviews', Icons.insights, Brand.ok, const PerformanceScreen()),
                  ],
                ),

                const SizedBox(height: 16),
                if (today?.roster != null) _RosterCard(roster: today!.roster!),
                if (today != null && today.sessions.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _SessionsCard(sessions: today.sessions),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _quickTile(BuildContext ctx, String title, IconData icon, Color color, Widget page) {
    return InkWell(
      onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => page)),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: color.withValues(alpha: 0.18),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 6),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color),
            ),
          ],
        ),
      ),
    );
  }
}

class _PunchButton extends StatelessWidget {
  const _PunchButton({required this.controller, this.employeeName});
  final AttendanceController controller;
  final String? employeeName;

  Future<void> _onTap(BuildContext context) async {
    final c = controller;
    final state = c.effectiveState;
    final String kind;
    final String mode;

    if (state == 'IN') {
      kind = 'OUT';
      mode = c.effectiveOpenMode ?? 'OFFICE';
    } else {
      if (state == 'DONE') {
        final more = await _confirm(context, 'You have completed your rostered hours. Start another session?');
        if (more != true || !context.mounted) return;
      }
      final chosen = await _chooseMode(context, c.today?.roster?.mode);
      if (chosen == null) return;
      kind = 'IN';
      mode = chosen;
    }

    // When marking Remote, require real-time GPS location and Selfie photo verification
    if (mode == 'REMOTE') {
      if (!context.mounted) return;
      final verified = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => RemoteVerificationSheet(
          kind: kind,
          maxAccuracyMetres: c.today?.maxAccuracyMetres ?? 100,
          employeeName: employeeName,
        ),
      );
      if (verified != true || !context.mounted) return;
    }

    final outcome = await c.punch(kind: kind, mode: mode);
    if (!context.mounted) return;

    final message = switch (outcome) {
      PunchOutcome.sent => kind == 'IN' ? 'Marked in.' : 'Marked out.',
      PunchOutcome.savedOffline => 'Saved on this phone. It will upload when you are back online.',
      PunchOutcome.refused || PunchOutcome.failed => null, // shown in the red banner
    };
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  /// The roster decides office or remote. Only a flexible day asks.
  Future<String?> _chooseMode(BuildContext context, String? rosterMode) async {
    if (rosterMode == 'OFFICE') return 'OFFICE';
    if (rosterMode == 'REMOTE') return 'REMOTE';
    return showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 0, 8, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.apartment),
                title: const Text('At the branch'),
                subtitle: const Text('Checked against the branch location'),
                onTap: () => Navigator.pop(context, 'OFFICE'),
              ),
              ListTile(
                leading: const Icon(Icons.home_work_outlined),
                title: const Text('Working remotely'),
                subtitle: const Text('Your location is recorded at mark-in and mark-out only'),
                onTap: () => Navigator.pop(context, 'REMOTE'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<bool?> _confirm(BuildContext context, String text) => showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          content: Text(text),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Mark in')),
          ],
        ),
      );

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final c = controller;
    final state = c.effectiveState;

    final (label, sub, icon, color) = switch (state) {
      'IN' => (
          'Mark out',
          c.effectiveOpenMode == 'REMOTE' ? 'Remote session running' : 'At the branch',
          Icons.logout,
          Brand.bad,
        ),
      'DONE' => ('Day complete', 'Tap to work more', Icons.check, Brand.ok),
      _ => ('Mark in', 'Tap when you start work', Icons.login, Brand.blue),
    };

    return Material(
      color: t.colorScheme.surface,
      shape: const CircleBorder(),
      elevation: 1,
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: c.busy ? null : () => _onTap(context),
        child: Center(
          child: c.busy
              ? const CircularProgressIndicator()
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: color,
                      child: Icon(icon, color: Colors.white),
                    ),
                    const SizedBox(height: 10),
                    Text(label, style: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        sub,
                        textAlign: TextAlign.center,
                        style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

class _Stamp extends StatelessWidget {
  const _Stamp({required this.today});
  final TodayState? today;

  @override
  Widget build(BuildContext context) {
    final sessions = today?.sessions ?? const <WorkSession>[];
    final first = sessions.isEmpty ? null : sessions.first.startAt;
    final last = sessions.isEmpty ? null : sessions.last.endAt;

    Widget cell(String label, String value) => Expanded(
          child: Column(
            children: [
              Text(label, style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 2),
              Text(value, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            ],
          ),
        );

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          children: [
            cell('In', first == null ? '—' : colomboHm(first)),
            cell('Out', last == null ? '—' : colomboHm(last)),
            cell('Paid', today == null ? '—' : duration(today!.paidMinutes)),
          ],
        ),
      ),
    );
  }
}

class _RosterCard extends StatelessWidget {
  const _RosterCard({required this.roster});
  final RosterDay roster;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final modeText = switch (roster.mode) {
      'REMOTE' => 'Remote',
      'EITHER' => 'Office or remote',
      'SPLIT' => 'Split',
      _ => 'At the branch',
    };
    return Card(
      child: ListTile(
        leading: const Icon(Icons.event_note_outlined),
        title: Text(roster.isOffDay ? 'Off today' : (roster.shiftName ?? 'Shift')),
        subtitle: roster.isOffDay
            ? null
            : Text([
                if (roster.startMinute != null) 'From ${minuteOfDayHm(roster.startMinute!)}',
                '${duration(roster.paidMinutes)} paid',
                if (roster.plannedOtMinutes > 0) '${duration(roster.plannedOtMinutes)} planned OT',
                modeText,
              ].join(' · ')),
        subtitleTextStyle: t.textTheme.bodySmall,
      ),
    );
  }
}

class _SessionsCard extends StatelessWidget {
  const _SessionsCard({required this.sessions});
  final List<WorkSession> sessions;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 14, 16, 4),
            child: Text('Today', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
          for (final s in sessions)
            ListTile(
              dense: true,
              leading: Icon(s.isRemote ? Icons.home_work_outlined : Icons.apartment, size: 20),
              title: Text('${colomboHm(s.startAt)} – ${s.endAt == null ? 'now' : colomboHm(s.endAt!)}'),
              subtitle: Text([
                s.isRemote ? 'Remote${s.placeLabel != null ? ' · ${s.placeLabel}' : ''} · 📍 GPS & 📸 Selfie Verified' : 'Branch',
                if (s.endAt != null) duration(s.minutes),
              ].join(' · ')),
              trailing: s.flagged ? const Icon(Icons.flag_outlined, color: Brand.warn, size: 20) : null,
            ),
        ],
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner._(this.text, this.color, this.icon, {this.onClose});

  factory _Banner.offline(AttendanceController c) => _Banner._(
        c.pendingCount > 0
            ? '${c.pendingCount} ${c.pendingCount == 1 ? 'punch is' : 'punches are'} saved on this phone and will upload when you are back online.'
            : 'You are offline. Punches will be saved on this phone.',
        Brand.warn,
        Icons.cloud_off_outlined,
      );

  factory _Banner.error(String text, {required VoidCallback onClose}) =>
      _Banner._(text, Brand.bad, Icons.error_outline, onClose: onClose);

  final String text;
  final Color color;
  final IconData icon;
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(12, 10, 4, 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: TextStyle(color: color))),
          if (onClose != null)
            IconButton(
              visualDensity: VisualDensity.compact,
              onPressed: onClose,
              icon: Icon(Icons.close, color: color, size: 18),
            ),
        ],
      ),
    );
  }
}
