import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// Wraps any screen in a realistic iPhone 16 Pro device frame when running
/// on desktop or web browsers, giving the exact native mobile simulator look.
class IPhoneFrame extends StatefulWidget {
  const IPhoneFrame({super.key, required this.child});
  final Widget child;

  @override
  State<IPhoneFrame> createState() => _IPhoneFrameState();
}

class _IPhoneFrameState extends State<IPhoneFrame> {
  late Timer _timer;
  late DateTime _time;

  @override
  void initState() {
    super.initState();
    _time = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _time = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String get _timeString {
    final h = _time.hour;
    final m = _time.minute.toString().padLeft(2, '0');
    final h12 = h == 0 ? 12 : (h > 12 ? h - 12 : h);
    return '$h12:$m';
  }

  @override
  Widget build(BuildContext context) {
    // If on a real physical mobile device or very small screen, don't show the frame
    final screenWidth = MediaQuery.of(context).size.width;
    if (!kIsWeb && screenWidth < 500) {
      return widget.child;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1D),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Top device header title
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.apple, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'iPhone 16 Pro Simulator — SmartHR Mobile',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ),

              // Realistic iPhone Chassis
              Container(
                width: 412,
                height: 864,
                decoration: BoxDecoration(
                  color: const Color(0xFF161922),
                  borderRadius: BorderRadius.circular(54),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF003087).withValues(alpha: 0.35),
                      blurRadius: 90,
                      offset: const Offset(0, 30),
                    ),
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.7),
                      blurRadius: 40,
                      offset: const Offset(0, 15),
                    ),
                  ],
                  border: Border.all(
                    color: const Color(0xFF383E4E),
                    width: 3.5,
                  ),
                ),
                padding: const EdgeInsets.all(10),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(46),
                  child: Stack(
                    children: [
                      // Inner App Canvas
                      Positioned.fill(
                        child: MediaQuery(
                          data: MediaQuery.of(context).copyWith(
                            padding: const EdgeInsets.only(top: 48, bottom: 24),
                            viewPadding: const EdgeInsets.only(top: 48, bottom: 24),
                          ),
                          child: widget.child,
                        ),
                      ),

                      // iOS Dynamic Island & Status Bar
                      Positioned(
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 48,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              // Time
                              Text(
                                _timeString,
                                style: const TextStyle(
                                  color: Colors.black87,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: -0.2,
                                ),
                              ),

                              // Dynamic Island pill
                              Container(
                                width: 110,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: Colors.black,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Container(
                                      margin: const EdgeInsets.only(right: 12),
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF1A1A2E),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: const Color(0xFF2A2A4E),
                                          width: 1.5,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Status icons: Signal, WiFi, Battery
                              Row(
                                children: [
                                  const Icon(Icons.signal_cellular_alt, size: 14, color: Colors.black87),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.wifi, size: 14, color: Colors.black87),
                                  const SizedBox(width: 5),
                                  Container(
                                    width: 22,
                                    height: 11,
                                    padding: const EdgeInsets.all(1.5),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: Colors.black87, width: 1.5),
                                      borderRadius: BorderRadius.circular(3.5),
                                    ),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black87,
                                        borderRadius: BorderRadius.circular(1.5),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),

                      // iOS Home Indicator Bar
                      Positioned(
                        bottom: 8,
                        left: 0,
                        right: 0,
                        child: Center(
                          child: Container(
                            width: 134,
                            height: 4.5,
                            decoration: BoxDecoration(
                              color: Colors.black26,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
