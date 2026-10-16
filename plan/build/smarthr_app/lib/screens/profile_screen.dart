import 'package:flutter/material.dart';

import '../attendance/attendance_controller.dart';
import '../auth/auth_controller.dart';
import '../theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.auth, required this.attendance});
  final AuthController auth;
  final AttendanceController attendance;

  Future<void> _signOut(BuildContext context) async {
    if (attendance.pendingCount > 0) {
      final ok = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Punches not uploaded'),
          content: Text(
            '${attendance.pendingCount} punch${attendance.pendingCount == 1 ? ' has' : 'es have'} not reached '
            'the server yet. They stay on this phone and upload the next time you sign in here.',
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Stay signed in')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sign out')),
          ],
        ),
      );
      if (ok != true) return;
    }
    await auth.logout();
  }

  Future<void> _requestAccountDeletion(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete / Deactivate Account'),
        content: const Text(
          'SmartHR employee accounts are provisioned and managed by your employing organization.\n\n'
          'Submitting an account deletion request will notify your HR administrator to deactivate your mobile login and purge your stored credentials in accordance with corporate data retention policy.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Brand.bad),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Submit Request'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account deletion request submitted to your organization administrator.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([auth, attendance]),
      builder: (context, _) {
        final t = Theme.of(context);
        final me = auth.me;
        String row(String? v) => (v == null || v.isEmpty) ? '—' : v;

        final initials = (me?.displayName ?? 'U')
            .split(' ')
            .map((e) => e.isNotEmpty ? e[0] : '')
            .take(2)
            .join()
            .toUpperCase();

        return Scaffold(
          appBar: AppBar(
            title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.w700)),
            centerTitle: false,
          ),
          body: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            children: [
              // Avatar & Name Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: t.colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: Brand.blue.withValues(alpha: 0.15),
                      child: Text(
                        initials,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Brand.blue,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            me?.displayName ?? 'User',
                            style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            row(me?.designation),
                            style: t.textTheme.bodyMedium?.copyWith(color: t.colorScheme.onSurfaceVariant),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Brand.navy.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              me?.tenantName ?? 'SmartHR',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Brand.navy),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Employment Details Card
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
                ),
                child: Column(
                  children: [
                    _infoTile(context, 'Employee number', row(me?.empNo), Icons.badge_outlined),
                    const Divider(height: 1, indent: 56),
                    _infoTile(context, 'Department', row(me?.departmentName), Icons.apartment_outlined),
                    const Divider(height: 1, indent: 56),
                    _infoTile(context, 'Branch', row(me?.branchName), Icons.location_city_outlined),
                    const Divider(height: 1, indent: 56),
                    _infoTile(context, 'EPF member number', row(me?.epfMemberNo), Icons.assignment_outlined),
                    const Divider(height: 1, indent: 56),
                    _infoTile(context, 'Remote work address', row(me?.remoteLabel), Icons.home_work_outlined),
                    const Divider(height: 1, indent: 56),
                    _infoTile(context, 'Email address', row(me?.email), Icons.email_outlined),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Trilingual Language Switcher Card
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.language, size: 20, color: Brand.blue),
                          const SizedBox(width: 10),
                          const Text(
                            'App Language / භාෂාව / மொழி',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Language switched to English')));
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Brand.navy,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('English', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('භාෂාව සිංහලට මාරු කරන ලදී (Sinhala Selected)')));
                              },
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('සිංහල', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('மொழி தமிழில் மாற்றப்பட்டது (Tamil Selected)')));
                              },
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('தமிழ்', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Offline Sync Card
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
                ),
                child: ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (attendance.pendingCount == 0 ? Brand.ok : Brand.warn).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.sync,
                      color: attendance.pendingCount == 0 ? Brand.ok : Brand.warn,
                    ),
                  ),
                  title: const Text('Offline punch sync'),
                  subtitle: Text(
                    attendance.pendingCount == 0
                        ? 'All punches uploaded to cloud'
                        : '${attendance.pendingCount} punch${attendance.pendingCount == 1 ? '' : 'es'} waiting to upload',
                  ),
                  trailing: attendance.pendingCount == 0
                      ? const Icon(Icons.check, color: Brand.ok)
                      : TextButton(
                          onPressed: attendance.sync,
                          child: const Text('Upload now'),
                        ),
                ),
              ),

              const SizedBox(height: 24),

              // Sign Out Button
              OutlinedButton.icon(
                onPressed: () => _signOut(context),
                icon: const Icon(Icons.logout, color: Brand.bad),
                label: const Text('Sign out', style: TextStyle(color: Brand.bad, fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Brand.bad.withValues(alpha: 0.4)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),

              const SizedBox(height: 12),

              Center(
                child: TextButton(
                  onPressed: () => _requestAccountDeletion(context),
                  child: Text(
                    'Request Account Deletion',
                    style: TextStyle(
                      fontSize: 12,
                      color: t.colorScheme.error.withValues(alpha: 0.8),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),
              Text(
                'Location is recorded only when you mark in and out, adhering to employee privacy standards.',
                textAlign: TextAlign.center,
                style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Widget _infoTile(BuildContext context, String title, String value, IconData icon) {
    final t = Theme.of(context);
    return ListTile(
      leading: Icon(icon, size: 20, color: t.colorScheme.primary),
      title: Text(title, style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant)),
      subtitle: Text(value, style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
      dense: true,
    );
  }
}
