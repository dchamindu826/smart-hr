import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../core/api_exception.dart';
import '../theme.dart';

class PayScreen extends StatefulWidget {
  const PayScreen({super.key, required this.api});
  final ApiClient api;

  @override
  State<PayScreen> createState() => _PayScreenState();
}

class _PayScreenState extends State<PayScreen> {
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    _loadPayslips();
  }

  Future<void> _loadPayslips() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await widget.api.get('/pay/payslips');
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
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load pay and payslip details.';
          _loading = false;
        });
      }
    }
  }

  String _formatCurrency(num? amount) {
    if (amount == null) return 'LKR 0.00';
    final parts = amount.toStringAsFixed(2).split('.');
    final intPart = parts[0].replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
    return 'LKR $intPart.${parts[1]}';
  }

  void _showPayslipDetails(Map<String, dynamic> p) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PayslipDetailSheet(payslip: p, formatCurrency: _formatCurrency),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final basicSalary = (_data?['basicSalary'] as num?) ?? 0;
    final estimated = _data?['estimatedStructure'] as Map<String, dynamic>?;
    final payslips = (_data?['payslips'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pay & Payslips', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _loadPayslips,
            tooltip: 'Refresh',
          ),
        ],
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
                          onPressed: _loadPayslips,
                          child: const Text('Try again'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadPayslips,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Salary Compensation Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Brand.navy, Brand.blue],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Brand.blue.withValues(alpha: 0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Basic Salary',
                                  style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w500),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    'Active',
                                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _formatCurrency(basicSalary),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 26,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 18),
                            const Divider(color: Colors.white24, height: 1),
                            const SizedBox(height: 14),

                            // Statutory Contributions row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _statutoryPill(
                                  label: 'EPF 8% (You)',
                                  amount: _formatCurrency(estimated?['epfEmployee'] ?? (basicSalary * 0.08)),
                                ),
                                _statutoryPill(
                                  label: 'EPF 12% (Co.)',
                                  amount: _formatCurrency(estimated?['epfEmployer'] ?? (basicSalary * 0.12)),
                                ),
                                _statutoryPill(
                                  label: 'ETF 3% (Co.)',
                                  amount: _formatCurrency(estimated?['etf'] ?? (basicSalary * 0.03)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Payslips Section Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Payslip History',
                            style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          if (payslips.isNotEmpty)
                            Text(
                              '${payslips.length} published',
                              style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      if (payslips.isEmpty)
                        Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              children: [
                                Icon(Icons.receipt_long_outlined, size: 44, color: t.colorScheme.primary),
                                const SizedBox(height: 12),
                                Text(
                                  'Monthly Payslips',
                                  style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Your official monthly payslips will be published here after the payroll period is approved by HR and finance.',
                                  textAlign: TextAlign.center,
                                  style: t.textTheme.bodySmall?.copyWith(
                                    color: t.colorScheme.onSurfaceVariant,
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Brand.ok.withValues(alpha: 0.08),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.shield_outlined, size: 18, color: Brand.ok),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'Sri Lanka Shop & Office Act and EPF/ETF statutory compliance active.',
                                          style: t.textTheme.labelSmall?.copyWith(
                                            color: Brand.ok,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        ...payslips.map((p) => _payslipCard(context, p)),
                    ],
                  ),
                ),
    );
  }

  Widget _statutoryPill({required String label, required String amount}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 2),
        Text(
          amount,
          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  Widget _payslipCard(BuildContext context, Map<String, dynamic> p) {
    final t = Theme.of(context);
    final periodLabel = p['periodLabel'] as String? ?? 'Payslip';
    final net = (p['net'] as num?) ?? 0;
    final gross = (p['gross'] as num?) ?? 0;
    final deductions = (p['deductions'] as num?) ?? 0;
    final status = p['status'] as String? ?? 'PAID';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: t.colorScheme.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: InkWell(
        onTap: () => _showPayslipDetails(p),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Brand.blue.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.receipt_long, size: 20, color: Brand.blue),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            periodLabel,
                            style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          Text(
                            status,
                            style: t.textTheme.labelSmall?.copyWith(
                              color: status == 'PAID' ? Brand.ok : Brand.warn,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _formatCurrency(net),
                        style: t.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: Brand.navy,
                        ),
                      ),
                      Text(
                        'Net Pay',
                        style: t.textTheme.labelSmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ],
              ),
              const Divider(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Gross: ${_formatCurrency(gross)}',
                    style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                  ),
                  Text(
                    'Deductions: ${_formatCurrency(deductions)}',
                    style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                  ),
                  Row(
                    children: [
                      Text(
                        'Details',
                        style: t.textTheme.bodySmall?.copyWith(color: Brand.blue, fontWeight: FontWeight.w600),
                      ),
                      const Icon(Icons.chevron_right, size: 16, color: Brand.blue),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PayslipDetailSheet extends StatelessWidget {
  const _PayslipDetailSheet({required this.payslip, required this.formatCurrency});
  final Map<String, dynamic> payslip;
  final String Function(num?) formatCurrency;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final periodLabel = payslip['periodLabel'] as String? ?? 'Payslip';
    final net = (payslip['net'] as num?) ?? 0;
    final gross = (payslip['gross'] as num?) ?? 0;
    final deductions = (payslip['deductions'] as num?) ?? 0;
    final epfEmp = (payslip['epfEmployee'] as num?) ?? 0;
    final epfCo = (payslip['epfEmployer'] as num?) ?? 0;
    final etf = (payslip['etf'] as num?) ?? 0;
    final daysWorked = payslip['daysWorked'] ?? 0;
    final lines = (payslip['lines'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];

    final earnings = lines.where((l) => l['kind'] == 'EARNING').toList();
    final deductLines = lines.where((l) => l['kind'] == 'DEDUCTION').toList();

    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.85),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: t.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: ListView(
        shrinkWrap: true,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    periodLabel,
                    style: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'Days worked: $daysWorked',
                    style: t.textTheme.bodySmall?.copyWith(color: t.colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Net Pay Highlight Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Brand.navy,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Net Take-home Pay',
                  style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w600),
                ),
                Text(
                  formatCurrency(net),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Earnings Table
          Text('Earnings', style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: t.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                if (earnings.isEmpty)
                  _row('Gross Earnings', formatCurrency(gross))
                else
                  ...earnings.map((e) => _row(e['label'] ?? e['code'] ?? 'Earning', formatCurrency(e['amount']))),
                const Divider(height: 16),
                _row('Total Earnings', formatCurrency(gross), isBold: true),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Deductions Table
          Text('Deductions', style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: t.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                if (deductLines.isEmpty) ...[
                  _row('EPF 8% Employee', formatCurrency(epfEmp)),
                  if (deductions > epfEmp)
                    _row('Other Deductions', formatCurrency(deductions - epfEmp)),
                ] else
                  ...deductLines.map((d) => _row(d['label'] ?? d['code'] ?? 'Deduction', formatCurrency(d['amount']))),
                const Divider(height: 16),
                _row('Total Deductions', formatCurrency(deductions), isBold: true),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Employer Statutory Contributions Table
          Text('Employer Statutory Contributions', style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Brand.blue.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Brand.blue.withValues(alpha: 0.15)),
            ),
            child: Column(
              children: [
                _row('EPF 12% (Employer)', formatCurrency(epfCo)),
                const SizedBox(height: 4),
                _row('ETF 3% (Employer)', formatCurrency(etf)),
                const Divider(height: 16),
                _row('Total Employer Cost', formatCurrency(epfCo + etf), isBold: true),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _row(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
              fontSize: 13,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}
