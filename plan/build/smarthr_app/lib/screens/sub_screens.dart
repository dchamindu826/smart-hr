import 'package:flutter/material.dart';
import '../theme.dart';

// ── 1. Roster & Shift Swaps Screen ──
class RosterScreen extends StatelessWidget {
  const RosterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final days = [
      {'day': 'Mon', 'date': 'Sep 21', 'shift': 'General (8:30 AM – 5:30 PM)', 'ot': '1.5 hrs OT', 'mode': 'Office · Colombo HQ'},
      {'day': 'Tue', 'date': 'Sep 22', 'shift': 'General (8:30 AM – 5:30 PM)', 'ot': 'No OT', 'mode': 'Office · Colombo HQ'},
      {'day': 'Wed', 'date': 'Sep 23', 'shift': 'Remote (8:30 AM – 5:30 PM)', 'ot': 'No OT', 'mode': 'Remote · Verified'},
      {'day': 'Thu', 'date': 'Sep 24', 'shift': 'General (8:30 AM – 5:30 PM)', 'ot': '2.0 hrs OT', 'mode': 'Office · Colombo HQ'},
      {'day': 'Fri', 'date': 'Sep 25', 'shift': 'General (8:30 AM – 5:30 PM)', 'ot': 'No OT', 'mode': 'Office · Colombo HQ'},
      {'day': 'Sat', 'date': 'Sep 26', 'shift': 'Weekly Off', 'ot': '—', 'mode': 'Holiday'},
      {'day': 'Sun', 'date': 'Sep 27', 'shift': 'Weekly Off', 'ot': '—', 'mode': 'Holiday'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Roster & Shifts', style: TextStyle(fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: Brand.blue.withValues(alpha: 0.08),
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Brand.blue),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Roster published by M. Gunathilaka. Need a shift change? Request a swap below.',
                      style: t.textTheme.bodyMedium?.copyWith(color: Brand.blue, fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          for (final d in days)
            Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: d['day'] == 'Sat' || d['day'] == 'Sun' ? Colors.grey.shade200 : Brand.blue.withValues(alpha: 0.15),
                  child: Text(d['day']!, style: TextStyle(color: d['day'] == 'Sat' || d['day'] == 'Sun' ? Colors.grey : Brand.blue, fontWeight: FontWeight.bold)),
                ),
                title: Text('${d['date']} · ${d['shift']}', style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text('${d['mode']} · ${d['ot']}'),
                trailing: d['day'] != 'Sat' && d['day'] != 'Sun'
                    ? TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Swap request sent for ${d['date']}')));
                        },
                        child: const Text('Swap'),
                      )
                    : null,
              ),
            ),
        ],
      ),
    );
  }
}

// ── 2. Expense Claims Screen ──
class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({super.key});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  final List<Map<String, String>> _claims = [
    {'title': 'Fuel Claim · Client Visit Kandy', 'date': '24 Sep 2026', 'amount': 'LKR 8,500.00', 'status': 'Approved', 'type': 'Transport'},
    {'title': 'Team Lunch · Sprint Retrospective', 'date': '18 Sep 2026', 'amount': 'LKR 14,200.00', 'status': 'Pending', 'type': 'Meals'},
    {'title': 'Client Refreshments · Colombo HQ', 'date': '12 Sep 2026', 'amount': 'LKR 3,450.00', 'status': 'Approved', 'type': 'Entertainment'},
  ];

  void _addClaim() {
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Submit Expense Claim'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Expense Description')),
            const SizedBox(height: 12),
            TextField(controller: amountCtrl, decoration: const InputDecoration(labelText: 'Amount (LKR)'), keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(10)),
              child: const Row(
                children: [
                  Icon(Icons.receipt_long, color: Brand.blue),
                  SizedBox(width: 8),
                  Text('Receipt Photo Attached ✓', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Brand.ok)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              if (titleCtrl.text.isNotEmpty && amountCtrl.text.isNotEmpty) {
                setState(() {
                  _claims.insert(0, {
                    'title': titleCtrl.text,
                    'date': 'Today',
                    'amount': 'LKR ${amountCtrl.text}.00',
                    'status': 'Pending',
                    'type': 'General',
                  });
                });
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Expense claim submitted for approval!')));
              }
            },
            child: const Text('Submit Claim'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Expense Claims', style: TextStyle(fontWeight: FontWeight.w700))),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addClaim,
        backgroundColor: Brand.blue,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Claim', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final c in _claims)
            Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Brand.blue.withValues(alpha: 0.1),
                  child: const Icon(Icons.receipt, color: Brand.blue),
                ),
                title: Text(c['title']!, style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text('${c['date']} · ${c['type']}'),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(c['amount']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: c['status'] == 'Approved' ? Brand.ok.withValues(alpha: 0.15) : Brand.warn.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        c['status']!,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: c['status'] == 'Approved' ? Brand.ok : Brand.warn,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── 3. Documents & Letters Screen ──
class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final docs = [
      {'name': 'Appointment Letter — Senior Engineer', 'date': 'Issued 01 Jan 2024', 'type': 'PDF · 245 KB'},
      {'name': 'Salary Confirmation Letter (Bank)', 'date': 'Generated 15 Sep 2026', 'type': 'PDF · 118 KB'},
      {'name': 'EPF Member Registration (Form B)', 'date': 'Verified No: 84920/ABC', 'type': 'PDF · 380 KB'},
      {'name': 'APIT Income Tax Withholding (T-10)', 'date': 'Tax Year 2025/2026', 'type': 'PDF · 190 KB'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('My Documents', style: TextStyle(fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final d in docs)
            Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.red.withValues(alpha: 0.1),
                  child: const Icon(Icons.picture_as_pdf, color: Colors.red),
                ),
                title: Text(d['name']!, style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text('${d['date']} · ${d['type']}'),
                trailing: IconButton(
                  icon: const Icon(Icons.download_rounded, color: Brand.blue),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Downloading ${d['name']}...')));
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── 4. Company Assets Screen ──
class AssetsScreen extends StatelessWidget {
  const AssetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final assets = [
      {'item': 'MacBook Pro 14" M2', 'tag': 'AST-2024-089', 'date': 'Issued 15 Jan 2024', 'status': 'Active · In Custody'},
      {'item': 'YubiKey 5 NFC Security Token', 'tag': 'AST-SEC-042', 'date': 'Issued 15 Jan 2024', 'status': 'Active · In Custody'},
      {'item': 'Corporate SIM Card (Dialog 100GB)', 'tag': '077 123 4567', 'date': 'Active Plan', 'status': 'Active'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Assigned Assets', style: TextStyle(fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final a in assets)
            Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Brand.navy.withValues(alpha: 0.1),
                  child: const Icon(Icons.devices, color: Brand.navy),
                ),
                title: Text(a['item']!, style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text('Asset Tag: ${a['tag']}\n${a['date']}'),
                isThreeLine: true,
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Brand.ok.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                  child: Text(a['status']!, style: const TextStyle(color: Brand.ok, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── 5. Team Moments Screen ──
class MomentsScreen extends StatelessWidget {
  const MomentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final moments = [
      {
        'title': '🎂 Happy Birthday Dinesh Kumara!',
        'sub': 'Senior QA Lead · Colombo HQ',
        'desc': 'සුබ උපන්දිනයක් වේවා දිනේෂ්! Wishing you another wonderful year of success and happiness with the ABC Holdings family.',
        'likes': '24 wishes',
      },
      {
        'title': '🏆 5 Years at SmartHR — Nuwan Pradeep',
        'sub': 'Principal Architect',
        'desc': 'Nuwan completed 5 inspiring years leading the mobile & cloud architecture teams! Thank you for your dedication.',
        'likes': '48 wishes',
      },
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Team Moments', style: TextStyle(fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final m in moments)
            Card(
              margin: const EdgeInsets.only(bottom: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(m['title']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text(m['sub']!, style: TextStyle(fontSize: 13, color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 12),
                    Text(m['desc']!, style: const TextStyle(fontSize: 14, height: 1.4)),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(m['likes']!, style: const TextStyle(color: Brand.blue, fontWeight: FontWeight.w600, fontSize: 13)),
                        ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Wish sent! 🎉')));
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Brand.pink.withValues(alpha: 0.1),
                            foregroundColor: Brand.pink,
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.favorite, size: 16),
                          label: const Text('Send Wish'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── 6. Performance & KPIs Screen ──
class PerformanceScreen extends StatelessWidget {
  const PerformanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Performance & KPIs', style: TextStyle(fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: Brand.navy,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            child: const Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Q3 2026 Overall Performance', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Text('4.85', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
                      Text(' / 5.0', style: TextStyle(color: Colors.white60, fontSize: 20)),
                      Spacer(),
                      Chip(
                        backgroundColor: Brand.ok,
                        label: Text('Exceeding Expectations', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Sprint Goals & Deliverables', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  SizedBox(height: 12),
                  LinearProgressIndicator(value: 0.92, minHeight: 8, color: Brand.blue, backgroundColor: Color(0xFFE2E9F2)),
                  SizedBox(height: 8),
                  Text('92% completed (23 of 25 tickets delivered on time)', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Supervisor Notes — M. Gunathilaka', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  SizedBox(height: 8),
                  Text(
                    'Kamal demonstrated outstanding leadership during the Q3 cloud migration. Punctuality and attendance have been 100% compliant with zero unscheduled absences.',
                    style: TextStyle(fontSize: 14, height: 1.45),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
