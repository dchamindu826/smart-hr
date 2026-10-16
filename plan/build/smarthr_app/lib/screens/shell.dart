import 'package:flutter/material.dart';

import '../attendance/attendance_controller.dart';
import '../attendance/location_service.dart';
import '../attendance/punch_queue.dart';
import '../auth/auth_controller.dart';
import '../core/api_client.dart';
import 'attendance_screen.dart';
import 'home_screen.dart';
import 'leave_screen.dart';
import 'pay_screen.dart';
import 'profile_screen.dart';

/// Signed-in employee shell with 5 core navigation tabs:
/// Home, Attendance, Leave, Pay, Me
class Shell extends StatefulWidget {
  const Shell({super.key, required this.auth, required this.api});
  final AuthController auth;
  final ApiClient api;

  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> with WidgetsBindingObserver {
  late final AttendanceController _attendance = AttendanceController(
    api: widget.api,
    queue: PunchQueue(),
    location: LocationService(),
    userId: widget.auth.userId!,
  );
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _attendance.start();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _attendance.dispose();
    super.dispose();
  }

  // Coming back to the app is when people check whether a punch went through.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _attendance.refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _tab,
        children: [
          HomeScreen(auth: widget.auth, attendance: _attendance),
          AttendanceScreen(api: widget.api),
          LeaveScreen(api: widget.api),
          PayScreen(api: widget.api),
          ProfileScreen(auth: widget.auth, attendance: _attendance),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Attendance',
          ),
          NavigationDestination(
            icon: Icon(Icons.beach_access_outlined),
            selectedIcon: Icon(Icons.beach_access),
            label: 'Leave',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments_outlined),
            selectedIcon: Icon(Icons.payments),
            label: 'Pay',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Me',
          ),
        ],
      ),
    );
  }
}
