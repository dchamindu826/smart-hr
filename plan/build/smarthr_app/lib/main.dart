import 'package:flutter/material.dart';

import 'auth/auth_controller.dart';
import 'core/api_client.dart';
import 'core/token_store.dart';
import 'screens/login_screen.dart';
import 'screens/shell.dart';
import 'theme.dart';
import 'widgets/iphone_frame.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SmartHrApp());
}

class SmartHrApp extends StatefulWidget {
  const SmartHrApp({super.key});

  @override
  State<SmartHrApp> createState() => _SmartHrAppState();
}

class _SmartHrAppState extends State<SmartHrApp> {
  final _tokens = TokenStore();
  late final ApiClient _api = ApiClient(_tokens);
  late final AuthController _auth = AuthController(_api, _tokens);

  @override
  void initState() {
    super.initState();
    _api.onSessionExpired = _auth.sessionExpired;
    _auth.restore();
  }

  @override
  void dispose() {
    _auth.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart HR',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(Brightness.light),
      darkTheme: buildTheme(Brightness.dark),
      builder: (context, child) => IPhoneFrame(child: child ?? const SizedBox()),
      home: ListenableBuilder(
        listenable: _auth,
        builder: (context, _) => switch (_auth.status) {
          AuthStatus.unknown => const _Splash(),
          AuthStatus.signedOut => LoginScreen(auth: _auth),
          AuthStatus.signedIn => Shell(
              // A new key per user rebuilds everything below on account change.
              key: ValueKey(_auth.userId),
              auth: _auth,
              api: _api,
            ),
        },
      ),
    );
  }
}

class _Splash extends StatelessWidget {
  const _Splash();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
