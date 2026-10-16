import 'package:flutter/material.dart';

/// Brand colours from the SmartHR logo.
class Brand {
  static const navy = Color(0xFF002D70);
  static const blue = Color(0xFF0B6FD4);
  static const magenta = Color(0xFFC810B0);
  static const pink = Color(0xFFE40675);
  static const ok = Color(0xFF0B8A5C);
  static const warn = Color(0xFFA96C08);
  static const bad = Color(0xFFBE3220);
}

ThemeData buildTheme(Brightness brightness) {
  final scheme = ColorScheme.fromSeed(seedColor: Brand.blue, brightness: brightness);
  return ThemeData(
    colorScheme: scheme,
    useMaterial3: true,
    scaffoldBackgroundColor:
        brightness == Brightness.light ? const Color(0xFFF1F5FA) : const Color(0xFF050F1F),
    cardTheme: const CardThemeData(margin: EdgeInsets.zero, elevation: 0),
    inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder()),
  );
}
