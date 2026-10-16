import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme.dart';

/// The ring fills as the rostered paid day is worked. The one bold element on
/// the home screen; everything around it stays quiet.
class DayDial extends StatelessWidget {
  const DayDial({super.key, required this.progress, required this.child, this.size = 232});

  final double? progress; // null = nothing rostered today
  final Widget child;
  final double size;

  @override
  Widget build(BuildContext context) {
    final track = Theme.of(context).colorScheme.surfaceContainerHighest;
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _RingPainter(progress: progress ?? 0, track: track),
        child: Padding(padding: const EdgeInsets.all(22), child: child),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.progress, required this.track});
  final double progress;
  final Color track;

  static const _stroke = 12.0;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = (size.shortestSide - _stroke) / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);

    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = track
        ..style = PaintingStyle.stroke
        ..strokeWidth = _stroke,
    );

    if (progress <= 0) return;

    final sweep = 2 * math.pi * progress.clamp(0.0, 1.0);
    canvas.drawArc(
      rect,
      -math.pi / 2,
      sweep,
      false,
      Paint()
        ..shader = const SweepGradient(
          startAngle: -math.pi / 2,
          endAngle: 3 * math.pi / 2,
          colors: [Brand.pink, Brand.magenta, Brand.blue, Brand.pink],
          stops: [0.0, 0.35, 0.8, 1.0],
        ).createShader(rect)
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeWidth = _stroke,
    );
  }

  @override
  bool shouldRepaint(_RingPainter old) => old.progress != progress || old.track != track;
}
