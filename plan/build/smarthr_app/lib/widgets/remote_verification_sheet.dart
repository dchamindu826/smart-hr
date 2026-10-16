import 'dart:io';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../attendance/location_service.dart';
import '../theme.dart';

class RemoteVerificationSheet extends StatefulWidget {
  const RemoteVerificationSheet({
    super.key,
    required this.kind,
    this.maxAccuracyMetres = 100,
    this.employeeName,
  });

  final String kind; // 'IN' or 'OUT'
  final int maxAccuracyMetres;
  final String? employeeName;

  @override
  State<RemoteVerificationSheet> createState() => _RemoteVerificationSheetState();
}

class _RemoteVerificationSheetState extends State<RemoteVerificationSheet>
    with SingleTickerProviderStateMixin {
  final LocationService _locationService = LocationService();
  final ImagePicker _picker = ImagePicker();

  Position? _position;
  String? _locationError;
  bool _fetchingLocation = true;

  XFile? _capturedImage;
  bool _photoCaptured = false;
  DateTime? _captureTime;
  bool _isCapturing = false;
  String? _cameraError;

  late AnimationController _animCtrl;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _acquireLocation();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  Future<void> _acquireLocation() async {
    setState(() {
      _fetchingLocation = true;
      _locationError = null;
    });

    try {
      final pos = await _locationService.requireFix(
        maxAccuracyMetres: widget.maxAccuracyMetres,
      );
      if (mounted) {
        setState(() {
          _position = pos;
          _fetchingLocation = false;
        });
      }
    } on LocationFailure catch (e) {
      if (mounted) {
        setState(() {
          _locationError = e.message;
          _fetchingLocation = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _locationError = 'Could not acquire precise GPS fix. Please ensure location is enabled.';
          _fetchingLocation = false;
        });
      }
    }
  }

  Future<void> _capturePhoto() async {
    if (_isCapturing) return;

    setState(() {
      _isCapturing = true;
      _cameraError = null;
    });

    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        maxWidth: 1080,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (!mounted) return;

      if (photo != null) {
        setState(() {
          _capturedImage = photo;
          _photoCaptured = true;
          _captureTime = DateTime.now();
          _cameraError = null;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _cameraError = 'Camera access was denied or failed. Please check app permissions in Settings.';
      });
    } finally {
      if (mounted) {
        setState(() => _isCapturing = false);
      }
    }
  }

  void _retakePhoto() {
    setState(() {
      _capturedImage = null;
      _photoCaptured = false;
      _captureTime = null;
      _cameraError = null;
    });
    _capturePhoto();
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final isReady = _position != null && _photoCaptured;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.92,
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: t.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Brand.blue.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'REMOTE PUNCH',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Brand.blue,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Mark ${widget.kind == 'IN' ? 'In' : 'Out'}',
                        style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'GPS location & selfie verification required',
                    style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context, false),
              ),
            ],
          ),
          const Divider(height: 18),

          Flexible(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. GPS Location Card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _position != null
                          ? Brand.ok.withValues(alpha: 0.08)
                          : _locationError != null
                              ? t.colorScheme.errorContainer.withValues(alpha: 0.5)
                              : t.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _position != null
                            ? Brand.ok.withValues(alpha: 0.3)
                            : _locationError != null
                                ? t.colorScheme.error.withValues(alpha: 0.4)
                                : t.colorScheme.outlineVariant.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              _position != null
                                  ? Icons.location_on
                                  : _locationError != null
                                      ? Icons.location_off
                                      : Icons.location_searching,
                              size: 20,
                              color: _position != null
                                  ? Brand.ok
                                  : _locationError != null
                                      ? t.colorScheme.error
                                      : Brand.blue,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _position != null
                                    ? 'GPS Location Verified'
                                    : _locationError != null
                                        ? 'Location Unavailable'
                                        : 'Acquiring GPS fix...',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                  color: _position != null
                                      ? Brand.ok
                                      : _locationError != null
                                          ? t.colorScheme.error
                                          : t.colorScheme.onSurface,
                                ),
                              ),
                            ),
                            if (_position != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Brand.ok,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'LOCKED ✓',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                                ),
                              )
                            else if (_fetchingLocation)
                              const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            else
                              TextButton(
                                onPressed: _acquireLocation,
                                style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
                                child: const Text('Retry'),
                              ),
                          ],
                        ),
                        if (_position != null) ...[
                          const SizedBox(height: 6),
                          Text(
                            'Lat: ${_position!.latitude.toStringAsFixed(6)} · Lon: ${_position!.longitude.toStringAsFixed(6)} '
                            '(±${_position!.accuracy.toStringAsFixed(0)}m accuracy)',
                            style: t.textTheme.bodySmall?.copyWith(
                              fontSize: 11,
                              color: t.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ] else if (_locationError != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            _locationError!,
                            style: TextStyle(fontSize: 11, color: t.colorScheme.error),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 2. Camera / Selfie Verification Area
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Live Selfie Verification',
                        style: t.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      if (_photoCaptured)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Brand.ok.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check_circle, size: 12, color: Brand.ok),
                              SizedBox(width: 4),
                              Text(
                                'Captured',
                                style: TextStyle(color: Brand.ok, fontSize: 11, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  GestureDetector(
                    onTap: _photoCaptured ? null : (_isCapturing ? null : _capturePhoto),
                    child: Container(
                      height: 240,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _photoCaptured
                              ? Brand.ok
                              : Brand.blue.withValues(alpha: 0.5),
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (_photoCaptured && _capturedImage != null) ...[
                              // Real Captured Image
                              Image.file(
                                File(_capturedImage!.path),
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  color: const Color(0xFF1E293B),
                                  child: const Center(
                                    child: Icon(Icons.broken_image, color: Colors.white54, size: 48),
                                  ),
                                ),
                              ),

                              // Gradient Vignette for text legibility
                              Positioned.fill(
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        Colors.black.withValues(alpha: 0.5),
                                        Colors.transparent,
                                        Colors.transparent,
                                        Colors.black.withValues(alpha: 0.75),
                                      ],
                                      stops: const [0.0, 0.25, 0.7, 1.0],
                                    ),
                                  ),
                                ),
                              ),

                              // Top Badge: Photo Verified
                              Positioned(
                                top: 12,
                                left: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: Brand.ok,
                                    borderRadius: BorderRadius.circular(8),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.25),
                                        blurRadius: 6,
                                      ),
                                    ],
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.verified, size: 14, color: Colors.white),
                                      SizedBox(width: 5),
                                      Text(
                                        'SELFIE VERIFIED',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                              // Retake Button
                              Positioned(
                                top: 10,
                                right: 10,
                                child: Material(
                                  color: Colors.black.withValues(alpha: 0.55),
                                  borderRadius: BorderRadius.circular(8),
                                  child: InkWell(
                                    onTap: _retakePhoto,
                                    borderRadius: BorderRadius.circular(8),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.refresh, size: 14, color: Colors.white),
                                          SizedBox(width: 4),
                                          Text(
                                            'Retake',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                              // Watermark overlay at bottom
                              Positioned(
                                bottom: 10,
                                left: 12,
                                right: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.65),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            widget.employeeName ?? 'Employee Selfie',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w700,
                                              fontSize: 12,
                                            ),
                                          ),
                                          Text(
                                            'Captured: ${_formatTime(_captureTime)}',
                                            style: const TextStyle(
                                              color: Colors.white70,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (_position != null) ...[
                                        const SizedBox(height: 2),
                                        Text(
                                          '📍 ${_position!.latitude.toStringAsFixed(4)}°, ${_position!.longitude.toStringAsFixed(4)}°',
                                          style: const TextStyle(color: Colors.white60, fontSize: 10),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                            ] else ...[
                              // Viewfinder Backdrop
                              Positioned.fill(
                                child: Container(
                                  decoration: const BoxDecoration(
                                    gradient: RadialGradient(
                                      colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                                      radius: 0.8,
                                    ),
                                  ),
                                ),
                              ),

                              // Face silhouette guide
                              Center(
                                child: AnimatedBuilder(
                                  animation: _animCtrl,
                                  builder: (context, child) {
                                    final scale = 1.0 + (_animCtrl.value * 0.04);
                                    return Transform.scale(
                                      scale: scale,
                                      child: Container(
                                        width: 120,
                                        height: 150,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(60),
                                          border: Border.all(
                                            color: Brand.blue.withValues(alpha: 0.8),
                                            width: 2,
                                          ),
                                        ),
                                        child: Icon(
                                          Icons.face_retouching_natural,
                                          size: 70,
                                          color: Colors.white.withValues(alpha: 0.25),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),

                              // Corner brackets
                              Positioned(top: 14, left: 14, child: _corner(0)),
                              Positioned(top: 14, right: 14, child: _corner(1)),
                              Positioned(bottom: 14, left: 14, child: _corner(2)),
                              Positioned(bottom: 14, right: 14, child: _corner(3)),

                              Positioned(
                                bottom: 14,
                                left: 0,
                                right: 0,
                                child: Text(
                                  _isCapturing ? 'Opening Camera...' : 'Tap to open camera and take selfie',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.85),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),

                              if (_isCapturing)
                                Positioned.fill(
                                  child: Container(
                                    color: Colors.black.withValues(alpha: 0.5),
                                    child: const Center(
                                      child: CircularProgressIndicator(color: Colors.white),
                                    ),
                                  ),
                                ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),

                  if (_cameraError != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: t.colorScheme.errorContainer.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: t.colorScheme.error.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_outline, size: 16, color: t.colorScheme.error),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _cameraError!,
                              style: TextStyle(fontSize: 12, color: t.colorScheme.error),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 12),

                  if (!_photoCaptured)
                    SizedBox(
                      height: 48,
                      child: FilledButton.icon(
                        onPressed: _isCapturing ? null : _capturePhoto,
                        icon: _isCapturing
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.camera_alt_outlined),
                        label: Text(
                          _isCapturing ? 'Opening Camera...' : 'Take Live Selfie Photo',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        style: FilledButton.styleFrom(
                          backgroundColor: Brand.blue,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),

                  const SizedBox(height: 14),

                  // Policy notice
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: t.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.shield_outlined, size: 16, color: t.colorScheme.onSurfaceVariant),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'GPS coordinates and selfie are recorded only at mark-in and mark-out to ensure company policy compliance.',
                            style: t.textTheme.labelSmall?.copyWith(
                              fontSize: 10,
                              color: t.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Confirm Action Button
          Container(
            height: 50,
            decoration: BoxDecoration(
              gradient: isReady
                  ? const LinearGradient(
                      colors: [Brand.navy, Brand.blue],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    )
                  : null,
              color: isReady ? null : t.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: isReady ? () => Navigator.pop(context, true) : null,
                borderRadius: BorderRadius.circular(14),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        widget.kind == 'IN' ? Icons.login : Icons.logout,
                        color: isReady ? Colors.white : t.colorScheme.onSurfaceVariant,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Confirm & Mark ${widget.kind == 'IN' ? 'In' : 'Out'} (Remote)',
                        style: TextStyle(
                          color: isReady ? Colors.white : t.colorScheme.onSurfaceVariant,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _corner(int index) {
    const s = 16.0;
    const w = 2.5;
    const c = Brand.blue;
    switch (index) {
      case 0: // top-left
        return Container(
          width: s,
          height: s,
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: c, width: w), left: BorderSide(color: c, width: w)),
          ),
        );
      case 1: // top-right
        return Container(
          width: s,
          height: s,
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: c, width: w), right: BorderSide(color: c, width: w)),
          ),
        );
      case 2: // bottom-left
        return Container(
          width: s,
          height: s,
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: c, width: w), left: BorderSide(color: c, width: w)),
          ),
        );
      case 3: // bottom-right
      default:
        return Container(
          width: s,
          height: s,
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: c, width: w), right: BorderSide(color: c, width: w)),
          ),
        );
    }
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return '';
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    final s = dt.second.toString().padLeft(2, '0');
    return '$h:$m:$s';
  }
}
