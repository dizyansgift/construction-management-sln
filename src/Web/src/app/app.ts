import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project, ProjectsService } from './projects.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly projectStorageKey = 'slate.projects';
  protected readonly projects = signal<Project[]>([]);
  protected readonly activeSection = signal('Dashboard');
  protected readonly dashboardPeriod = signal('This week');
  protected readonly selectedProjectFilter = signal('All projects');
  protected readonly showProjectForm = signal(false);
  protected readonly formError = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly moduleNotice = signal('');
  protected readonly showBoqForm = signal(false);
  protected readonly boqFormError = signal('');
  protected readonly showExpenseForm = signal(false);
  protected readonly expenseFormError = signal('');
  protected readonly receiptPreview = signal('');
  protected readonly receiptFileName = signal('');
  protected readonly isReadingReceipt = signal(false);
  protected readonly showPaymentForm = signal(false);
  protected readonly paymentFormError = signal('');
  protected readonly showMaterialForm = signal(false);
  protected readonly materialFormError = signal('');
  protected readonly darkMode = signal(false);
  protected readonly showEmployeeHistory = signal(false);
  protected readonly selectedEmployee = signal<{
    name: string;
    role: string;
    project: string;
    attendance: string;
    wage: number;
  } | null>(null);
  protected readonly showReportPreview = signal(false);
  protected readonly reportTitle = signal('');
  protected readonly reportContent = signal('');
  protected readonly materials = [
    {
      name: 'Portland cement',
      project: 'Riverside Medical Pavilion',
      category: 'Concrete',
      unit: 'bags',
      stock: 480,
      minimum: 120,
      price: 11.5,
      supplier: 'Cascade Building Supply',
    },
    {
      name: 'Rebar steel 12mm',
      project: 'Riverside Medical Pavilion',
      category: 'Reinforcement',
      unit: 'lengths',
      stock: 860,
      minimum: 200,
      price: 8.75,
      supplier: 'Northwest Steel',
    },
    {
      name: 'Washed construction sand',
      project: 'Northline Apartments',
      category: 'Aggregates',
      unit: 'tons',
      stock: 18,
      minimum: 8,
      price: 64,
      supplier: 'Columbia Aggregates',
    },
    {
      name: 'Concrete block 8in',
      project: 'Northline Apartments',
      category: 'Masonry',
      unit: 'pieces',
      stock: 3200,
      minimum: 900,
      price: 2.85,
      supplier: 'Cedar Masonry',
    },
    {
      name: 'Framing lumber 2x4',
      project: 'Cedar Street Retail',
      category: 'Timber',
      unit: 'pieces',
      stock: 740,
      minimum: 250,
      price: 6.4,
      supplier: 'Westline Timber',
    },
    {
      name: 'PVC pipe 4in',
      project: 'Cedar Street Retail',
      category: 'Plumbing',
      unit: 'lengths',
      stock: 34,
      minimum: 40,
      price: 18.2,
      supplier: 'FlowPro Plumbing',
    },
    {
      name: 'Electrical cable 2.5mm',
      project: 'Riverside Medical Pavilion',
      category: 'Electrical',
      unit: 'rolls',
      stock: 26,
      minimum: 10,
      price: 92,
      supplier: 'BrightWire Electrical',
    },
    {
      name: 'Interior wall paint',
      project: 'Cedar Street Retail',
      category: 'Finishes',
      unit: 'gallons',
      stock: 68,
      minimum: 20,
      price: 38,
      supplier: 'ColorCraft',
    },
  ];
  protected readonly boqItems = signal([
    {
      project: 'Riverside Medical Pavilion',
      category: 'Concrete',
      description: 'Foundation concrete C30',
      unit: 'm³',
      quantity: 120,
      rate: 145,
      amount: 17400,
    },
    {
      project: 'Riverside Medical Pavilion',
      category: 'Reinforcement',
      description: 'Rebar supply and placement',
      unit: 'ton',
      quantity: 18,
      rate: 980,
      amount: 17640,
    },
    {
      project: 'Northline Apartments',
      category: 'Masonry',
      description: 'External blockwork',
      unit: 'm²',
      quantity: 860,
      rate: 42,
      amount: 36120,
    },
    {
      project: 'Cedar Street Retail',
      category: 'Electrical',
      description: 'First fix electrical installation',
      unit: 'lot',
      quantity: 1,
      rate: 18500,
      amount: 18500,
    },
  ]);
  protected readonly labour = [
    {
      name: 'Maya Singh',
      role: 'Site engineer',
      project: 'Riverside Medical Pavilion',
      attendance: 'Present',
      wage: 285,
    },
    {
      name: 'Luis Ortega',
      role: 'Concrete foreman',
      project: 'Riverside Medical Pavilion',
      attendance: 'Present',
      wage: 240,
    },
    {
      name: 'Alex Kim',
      role: 'Procurement lead',
      project: 'Cedar Street Retail',
      attendance: 'Present',
      wage: 220,
    },
    {
      name: 'Northline Civil',
      role: 'Masonry contractor',
      project: 'Northline Apartments',
      attendance: 'Pending',
      wage: 1250,
    },
  ];
  protected readonly expenses = signal([
    {
      category: 'Materials',
      description: 'Cement and rebar delivery',
      project: 'Riverside Medical Pavilion',
      vendor: 'Cascade Building Supply',
      amount: 8420,
      date: 'Sep 11, 2026',
      receiptName: '',
    },
    {
      category: 'Equipment',
      description: 'Excavator rental',
      project: 'Northline Apartments',
      vendor: 'Horizon Equipment',
      amount: 3200,
      date: 'Sep 10, 2026',
      receiptName: '',
    },
    {
      category: 'Fuel',
      description: 'Site vehicles and generator',
      project: 'Cedar Street Retail',
      vendor: 'Pacific Fuel Co.',
      amount: 680,
      date: 'Sep 09, 2026',
      receiptName: '',
    },
  ]);
  protected readonly payments = signal([
    {
      project: 'Riverside Medical Pavilion',
      type: 'Customer payment',
      party: 'Riverside Health',
      invoice: 'INV-1024',
      amount: 125000,
      status: 'Received',
      due: 'Sep 08, 2026',
    },
    {
      project: 'Riverside Medical Pavilion',
      type: 'Supplier payment',
      party: 'Northwest Steel',
      invoice: 'SUP-4481',
      amount: 18400,
      status: 'Pending',
      due: 'Sep 15, 2026',
    },
    {
      project: 'Northline Apartments',
      type: 'Contractor payment',
      party: 'Northline Civil',
      invoice: 'CON-2077',
      amount: 32200,
      status: 'Pending',
      due: 'Sep 18, 2026',
    },
  ]);
  protected readonly projectForm = {
    projectCode: '',
    name: '',
    clientName: '',
    clientContact: '',
    siteAddress: '',
    startDate: '',
    expectedCompletionDate: '',
    estimatedBudget: 0,
    projectManager: '',
    description: '',
  };
  protected readonly boqForm = {
    project: '',
    category: 'Concrete',
    description: '',
    unit: 'm³',
    quantity: 1,
    rate: 0,
  };
  protected readonly expenseForm = {
    project: '',
    category: 'Materials',
    description: '',
    vendor: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank transfer',
    notes: '',
  };
  protected readonly paymentForm = {
    project: '',
    type: 'Supplier payment',
    party: '',
    invoice: '',
    amount: 0,
    status: 'Pending',
    due: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank transfer',
    notes: '',
  };
  protected readonly materialForm = {
    name: '',
    project: '',
    category: 'Concrete',
    unit: 'bags',
    quantity: 0,
    minimum: 0,
    price: 0,
    supplier: '',
  };
  protected readonly totalBudget = (total: number, project: { estimatedBudget: number }) =>
    total + project.estimatedBudget;
  protected readonly totalActual = (total: number, project: { actualCost: number }) =>
    total + project.actualCost;

  ngOnInit(): void {
    this.darkMode.set(localStorage.getItem('slate.theme') === 'dark');
    const savedProjects = this.readSavedProjects();
    this.projects.set(savedProjects);
    this.projectsService.getProjects().subscribe((apiProjects) => {
      if (apiProjects.length > 0) {
        const existing = new Map(
          this.projects().map((project) => [project.id || project.projectCode, project]),
        );
        for (const project of apiProjects) existing.set(project.id || project.projectCode, project);
        const mergedProjects = [...existing.values()];
        this.projects.set(mergedProjects);
        this.saveProjects(mergedProjects);
      }
    });
  }

  protected openSection(section: string): void {
    this.activeSection.set(section);
    this.moduleNotice.set('');
  }

  protected action(module: string): void {
    this.moduleNotice.set(
      `${module} is ready. This workspace is prepared for live records and API synchronization.`,
    );
  }

  protected toggleTheme(): void {
    const enabled = !this.darkMode();
    this.darkMode.set(enabled);
    localStorage.setItem('slate.theme', enabled ? 'dark' : 'light');
  }

  protected changeDashboardPeriod(): void {
    const periods = ['This week', 'This month', 'This quarter'];
    const nextPeriod = periods[(periods.indexOf(this.dashboardPeriod()) + 1) % periods.length];
    this.dashboardPeriod.set(nextPeriod);
    this.moduleNotice.set(`Dashboard period changed to ${nextPeriod}.`);
  }

  private projectBudget(project: Project): number {
    return Number(project.estimatedBudget ?? 0);
  }

  private projectActualCost(project: Project): number {
    return Number(project.actualCost ?? 0);
  }

  protected generateReport(report: string): void {
    const currency = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
    let rows: string[][];
    switch (report) {
      case 'Project summary':
        rows = [
          ['Project', 'Client', 'Status', 'Budget (INR)', 'Actual cost (INR)', 'Progress'],
        ].concat(
          this.visibleProjects().map((project) => [
            project.name,
            project.clientName,
            project.status,
            currency.format(this.projectBudget(project)),
            currency.format(this.projectActualCost(project)),
            `${project.progressPercent}%`,
          ]),
        );
        break;
      case 'Budget vs actual':
        rows = [['Project', 'Budget (INR)', 'Actual cost (INR)', 'Variance (INR)']].concat(
          this.visibleProjects().map((project) => [
            project.name,
            currency.format(this.projectBudget(project)),
            currency.format(this.projectActualCost(project)),
            currency.format(this.projectBudget(project) - this.projectActualCost(project)),
          ]),
        );
        rows.push([
          'TOTAL',
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectBudget(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectActualCost(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) =>
                total + this.projectBudget(project) - this.projectActualCost(project),
              0,
            ),
          ),
        ]);
        break;
      case 'Material usage':
        rows = [
          ['Material', 'Category', 'Stock', 'Unit', 'Unit price (INR)', 'Stock value (INR)'],
        ].concat(
          this.visibleMaterials().map((material) => [
            material.name,
            material.category,
            String(material.stock),
            material.unit,
            currency.format(material.price),
            currency.format(material.stock * material.price),
          ]),
        );
        break;
      case 'Labour attendance':
        rows = [['Worker', 'Role', 'Project', 'Attendance', 'Daily wage (INR)']].concat(
          this.visibleLabour().map((worker) => [
            worker.name,
            worker.role,
            worker.project,
            worker.attendance,
            currency.format(worker.wage),
          ]),
        );
        break;
      case 'Payment report':
        rows = [
          ['Project', 'Party', 'Type', 'Reference', 'Status', 'Due date', 'Amount (INR)'],
        ].concat(
          this.visiblePayments().map((payment) => [
            payment.project,
            payment.party,
            payment.type,
            payment.invoice,
            payment.status,
            payment.due,
            currency.format(payment.amount),
          ]),
        );
        break;
      case 'Profit and loss':
        rows = [
          ['Project', 'Contract/budget (INR)', 'Actual cost (INR)', 'Estimated margin (INR)'],
        ].concat(
          this.visibleProjects().map((project) => [
            project.name,
            currency.format(this.projectBudget(project)),
            currency.format(this.projectActualCost(project)),
            currency.format(this.projectBudget(project) - this.projectActualCost(project)),
          ]),
        );
        rows.push([
          'TOTAL',
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectBudget(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectActualCost(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) =>
                total + this.projectBudget(project) - this.projectActualCost(project),
              0,
            ),
          ),
        ]);
        break;
      default:
        rows = [
          ['Report', 'Status'],
          [report, 'No data available'],
        ];
    }
    this.reportTitle.set(report);
    this.reportContent.set(
      rows
        .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
        .join('\n'),
    );
    this.showReportPreview.set(true);
  }

  protected closeReportPreview(): void {
    this.showReportPreview.set(false);
  }

  protected downloadReport(): void {
    const blob = new Blob([this.reportContent()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.reportTitle()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')}-inr.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.moduleNotice.set(`${this.reportTitle()} downloaded as CSV.`);
  }

  protected projectOptions(): string[] {
    return [
      ...new Set([
        ...this.projects().map((project) => project.name),
        ...this.boqItems().map((item) => item.project),
        ...this.expenses().map((expense) => expense.project),
        ...this.payments().map((payment) => payment.project),
        ...this.labour.map((worker) => worker.project),
        ...this.materials.map((material) => material.project),
      ]),
    ].sort();
  }

  protected nextProjectCode(): string {
    const highestCode = this.projects().reduce((highest, project) => {
      const match = project.projectCode?.match(/PRJ-(\d+)/i);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `PRJ-${String(highestCode + 1).padStart(4, '0')}`;
  }

  protected boqProjectOptions(): string[] {
    return [
      ...new Set([...this.projectOptions(), ...this.boqItems().map((item) => item.project)]),
    ].sort();
  }

  protected visibleBoqItems() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.boqItems()
      : this.boqItems().filter((item) => item.project === this.selectedProjectFilter());
  }

  protected visibleProjects(): Project[] {
    return this.selectedProjectFilter() === 'All projects'
      ? this.projects()
      : this.projects().filter((project) => project.name === this.selectedProjectFilter());
  }

  protected visibleMaterials() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.materials
      : this.materials.filter((material) => material.project === this.selectedProjectFilter());
  }

  protected visibleLabour() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.labour
      : this.labour.filter((worker) => worker.project === this.selectedProjectFilter());
  }

  protected visibleExpenses() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.expenses()
      : this.expenses().filter((expense) => expense.project === this.selectedProjectFilter());
  }

  protected visiblePayments() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.payments()
      : this.payments().filter((payment) => payment.project === this.selectedProjectFilter());
  }

  protected openExpenseForm(): void {
    this.expenseFormError.set('');
    if (!this.expenseForm.project) this.expenseForm.project = this.projectOptions()[0] ?? '';
    this.showExpenseForm.set(true);
  }

  protected closeExpenseForm(): void {
    this.showExpenseForm.set(false);
  }

  protected async readReceipt(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.expenseFormError.set('Please select a receipt image file.');
      return;
    }
    this.receiptFileName.set(file.name);
    this.receiptPreview.set(URL.createObjectURL(file));
    this.isReadingReceipt.set(true);
    this.moduleNotice.set('Reading receipt image. Review the suggested fields before saving.');
    try {
      const { recognize } = await import('tesseract.js');
      const result = await recognize(file, 'eng');
      const text = result.data.text;
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const amountMatches =
        text.match(/(?:₹|INR|Rs\.?)[\s:]*([\d,]+(?:\.\d{1,2})?)/gi) ??
        text.match(/\b\d[\d,]*(?:\.\d{1,2})?\b/g) ??
        [];
      const amountText = amountMatches.at(-1)?.replace(/[^\d.]/g, '') ?? '';
      if (amountText) this.expenseForm.amount = Number(amountText.replace(/,/g, ''));
      if (!this.expenseForm.vendor && lines[0]) this.expenseForm.vendor = lines[0].slice(0, 80);
      if (!this.expenseForm.description && lines[1])
        this.expenseForm.description = lines[1].slice(0, 120);
      this.moduleNotice.set(
        amountText
          ? 'Receipt read. Amount and vendor suggestions were added; please review them.'
          : 'Receipt read. Please review the suggested fields before saving.',
      );
    } catch {
      this.expenseFormError.set(
        'The receipt could not be read. You can still enter the expense manually.',
      );
    } finally {
      this.isReadingReceipt.set(false);
    }
  }

  protected async generateExpenseBill(expense: {
    category: string;
    description: string;
    project: string;
    vendor: string;
    amount: number;
    date: string;
    receiptName: string;
  }): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    const currency = (amount: number) =>
      `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const tax = expense.amount * 0.18;
    pdf.setFontSize(18);
    pdf.setTextColor(45, 118, 91);
    pdf.text('FIELDLINE CONSTRUCTION SERVICES', 20, 22);
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    pdf.text('GSTIN: 27ABCDE1234F1Z5 | 123 Build Street, Mumbai, Maharashtra 400001', 20, 30);
    pdf.text('Email: accounts@fieldline.example | Phone: +91 98765 43210', 20, 36);
    pdf.setDrawColor(210, 220, 212);
    pdf.line(20, 42, 190, 42);
    pdf.setFontSize(14);
    pdf.setTextColor(28, 41, 39);
    pdf.text('EXPENSE BILL', 20, 55);
    pdf.setFontSize(10);
    pdf.text(`Bill no: EXP-${Date.now().toString().slice(-8)}`, 130, 55);
    pdf.text(`Date: ${expense.date}`, 130, 62);
    pdf.text(`Project: ${expense.project}`, 20, 70);
    pdf.text(`Vendor / payee: ${expense.vendor}`, 20, 77);
    pdf.text(`Category: ${expense.category}`, 20, 84);
    pdf.line(20, 92, 190, 92);
    pdf.text('Description', 20, 102);
    pdf.text('Amount', 155, 102);
    pdf.text(expense.description.slice(0, 80), 20, 112);
    pdf.text(currency(expense.amount), 155, 112);
    pdf.line(20, 120, 190, 120);
    pdf.text('Subtotal', 125, 132);
    pdf.text(currency(expense.amount), 155, 132);
    pdf.text('GST (18%)', 125, 140);
    pdf.text(currency(tax), 155, 140);
    pdf.setFontSize(12);
    pdf.text('Total', 125, 151);
    pdf.text(currency(expense.amount + tax), 155, 151);
    pdf.setFontSize(9);
    pdf.text(
      'Computer-generated expense bill. Header and tax details are currently demo values.',
      20,
      180,
    );
    pdf.save(`expense-bill-${expense.project.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.pdf`);
  }

  protected createExpense(): void {
    const form = this.expenseForm;
    if (
      !form.project ||
      !form.description.trim() ||
      !form.vendor.trim() ||
      form.amount <= 0 ||
      !form.date
    ) {
      this.expenseFormError.set(
        'Project, description, vendor, date, and an amount greater than zero are required.',
      );
      return;
    }

    const expense = {
      category: form.category,
      description: form.description.trim(),
      project: form.project,
      vendor: form.vendor.trim(),
      amount: Number(form.amount),
      date: new Date(`${form.date}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      receiptName: this.receiptFileName(),
    };
    this.expenses.update((expenses) => [expense, ...expenses]);
    this.projects.update((projects) => {
      const updatedProjects = projects.map((project) =>
        project.name === expense.project
          ? { ...project, actualCost: project.actualCost + expense.amount }
          : project,
      );
      this.saveProjects(updatedProjects);
      return updatedProjects;
    });
    this.moduleNotice.set(`Expense added to ${expense.project}.`);
    Object.assign(form, {
      project: '',
      category: 'Materials',
      description: '',
      vendor: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank transfer',
      notes: '',
    });
    this.receiptPreview.set('');
    this.receiptFileName.set('');
    this.showExpenseForm.set(false);
  }

  protected openPaymentForm(): void {
    this.paymentFormError.set('');
    if (!this.paymentForm.project) this.paymentForm.project = this.projectOptions()[0] ?? '';
    this.showPaymentForm.set(true);
  }

  protected openMaterialForm(): void {
    this.materialFormError.set('');
    if (!this.materialForm.project) this.materialForm.project = this.projectOptions()[0] ?? '';
    this.showMaterialForm.set(true);
  }

  protected closeMaterialForm(): void {
    this.showMaterialForm.set(false);
  }

  protected receiveMaterial(): void {
    const form = this.materialForm;
    if (
      !form.name.trim() ||
      !form.project ||
      !form.supplier.trim() ||
      form.quantity <= 0 ||
      form.minimum < 0 ||
      form.price < 0
    ) {
      this.materialFormError.set(
        'Material name, project, supplier, quantity, reorder level, and unit price are required.',
      );
      return;
    }

    const received = {
      name: form.name.trim(),
      project: form.project,
      category: form.category,
      unit: form.unit,
      stock: Number(form.quantity),
      minimum: Number(form.minimum),
      price: Number(form.price),
      supplier: form.supplier.trim(),
    };
    const existing = this.materials.find(
      (material) =>
        material.name.toLowerCase() === received.name.toLowerCase() &&
        material.project === received.project,
    );
    if (existing) {
      existing.stock += received.stock;
      existing.minimum = received.minimum;
      existing.price = received.price;
      existing.supplier = received.supplier;
    } else {
      this.materials.unshift(received);
    }
    this.moduleNotice.set(`${received.stock} ${received.unit} of ${received.name} received into inventory.`);
    Object.assign(form, {
      name: '',
      project: '',
      category: 'Concrete',
      unit: 'bags',
      quantity: 0,
      minimum: 0,
      price: 0,
      supplier: '',
    });
    this.showMaterialForm.set(false);
  }

  protected closePaymentForm(): void {
    this.showPaymentForm.set(false);
  }

  protected openEmployeeHistory(employee: {
    name: string;
    role: string;
    project: string;
    attendance: string;
    wage: number;
  }): void {
    this.selectedEmployee.set(employee);
    this.showEmployeeHistory.set(true);
  }

  protected closeEmployeeHistory(): void {
    this.showEmployeeHistory.set(false);
    this.selectedEmployee.set(null);
  }

  protected employeeHistory(employee: {
    name: string;
    role: string;
    project: string;
    attendance: string;
  }): { period: string; project: string; work: string; status: string }[] {
    const workByRole: Record<string, string> = {
      'Site engineer': 'Site supervision, measurements, and daily progress review',
      'Concrete foreman': 'Foundation concrete, reinforcement, and curing coordination',
      'Procurement lead': 'Material ordering, delivery checks, and supplier coordination',
      'Masonry contractor': 'External blockwork, wall alignment, and finishing preparation',
    };
    return [
      {
        period: 'Current assignment',
        project: employee.project,
        work: workByRole[employee.role] ?? 'Construction site operations',
        status: employee.attendance,
      },
      {
        period: 'Previous assignment',
        project: employee.project,
        work: 'Completed assigned construction activities and submitted site records',
        status: 'Completed',
      },
    ];
  }

  protected employeeAttendanceHistory(employee: {
    attendance: string;
  }): { date: string; status: string; hours: string; project: string }[] {
    return [
      {
        date: '13 Sep 2026',
        status: employee.attendance,
        hours: employee.attendance === 'Present' ? '8 hours' : 'Awaiting entry',
        project: 'Current assignment',
      },
      { date: '12 Sep 2026', status: 'Present', hours: '8 hours', project: 'Current assignment' },
      { date: '11 Sep 2026', status: 'Present', hours: '8 hours', project: 'Current assignment' },
      { date: '10 Sep 2026', status: 'Half day', hours: '4 hours', project: 'Current assignment' },
    ];
  }

  protected createPayment(): void {
    const form = this.paymentForm;
    if (
      !form.project ||
      !form.party.trim() ||
      !form.invoice.trim() ||
      form.amount <= 0 ||
      !form.due
    ) {
      this.paymentFormError.set(
        'Project, party, invoice number, due date, and an amount greater than zero are required.',
      );
      return;
    }
    if (
      this.payments().some(
        (payment) => payment.invoice.toLowerCase() === form.invoice.trim().toLowerCase(),
      )
    ) {
      this.paymentFormError.set('An invoice or reference with this number already exists.');
      return;
    }

    const payment = {
      project: form.project,
      type: form.type,
      party: form.party.trim(),
      invoice: form.invoice.trim(),
      amount: Number(form.amount),
      status: form.status,
      due: new Date(`${form.due}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    const projectName = form.project;
    this.payments.update((payments) => [payment, ...payments]);
    this.moduleNotice.set(`Payment ${payment.invoice} added to ${projectName}.`);
    Object.assign(form, {
      project: '',
      type: 'Supplier payment',
      party: '',
      invoice: '',
      amount: 0,
      status: 'Pending',
      due: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank transfer',
      notes: '',
    });
    this.showPaymentForm.set(false);
  }

  protected openBoqForm(): void {
    this.boqFormError.set('');
    if (!this.boqForm.project) this.boqForm.project = this.projectOptions()[0] ?? '';
    this.showBoqForm.set(true);
  }

  protected closeBoqForm(): void {
    this.showBoqForm.set(false);
  }

  protected createBoqItem(): void {
    if (
      !this.boqForm.project ||
      !this.boqForm.description.trim() ||
      this.boqForm.quantity <= 0 ||
      this.boqForm.rate < 0
    ) {
      this.boqFormError.set('Project, description, quantity, and a valid rate are required.');
      return;
    }

    this.boqItems.update((items) => [
      ...items,
      {
        project: this.boqForm.project,
        category: this.boqForm.category,
        description: this.boqForm.description.trim(),
        unit: this.boqForm.unit,
        quantity: this.boqForm.quantity,
        rate: this.boqForm.rate,
        amount: this.boqForm.quantity * this.boqForm.rate,
      },
    ]);
    this.moduleNotice.set(`BOQ item '${this.boqForm.description.trim()}' added successfully.`);
    Object.assign(this.boqForm, {
      project: '',
      category: 'Concrete',
      description: '',
      unit: 'm³',
      quantity: 1,
      rate: 0,
    });
    this.showBoqForm.set(false);
  }

  protected lowStockCount(): number {
    return this.visibleMaterials().filter((material) => material.stock < material.minimum).length;
  }

  protected readonly stockValue = (total: number, material: { stock: number; price: number }) =>
    total + material.stock * material.price;
  protected readonly boqTotal = (total: number, item: { amount: number }) => total + item.amount;
  protected readonly expenseTotal = (total: number, expense: { amount: number }) =>
    total + expense.amount;
  protected readonly paymentTotal = (total: number, payment: { amount: number }) =>
    total + payment.amount;

  protected openProjectForm(): void {
    this.formError.set('');
    this.projectForm.projectCode = this.nextProjectCode();
    this.showProjectForm.set(true);
  }

  protected closeProjectForm(): void {
    this.showProjectForm.set(false);
  }

  protected createProject(): void {
    if (this.isSubmitting()) return;
    if (
      !this.projectForm.name.trim() ||
      !this.projectForm.clientName.trim() ||
      this.projectForm.estimatedBudget < 0
    ) {
      this.formError.set('Project name, client name, and a valid budget are required.');
      return;
    }

    const duplicate = this.projects().some(
      (project) =>
        (this.projectForm.projectCode.trim() &&
          project.projectCode === this.projectForm.projectCode.trim()) ||
        project.name.trim().toLowerCase() === this.projectForm.name.trim().toLowerCase(),
    );
    if (duplicate) {
      this.formError.set('A project with this code or name already exists.');
      return;
    }

    this.isSubmitting.set(true);
    const request = { ...this.projectForm };
    this.projectsService.createProject(request).subscribe({
      next: (project) => this.addProject(project),
      error: () =>
        this.addProject({
          id: crypto.randomUUID(),
          projectCode: request.projectCode || `PRJ-${this.projects().length + 1}`.padStart(7, '0'),
          name: request.name,
          clientName: request.clientName,
          siteAddress: request.siteAddress,
          estimatedBudget: request.estimatedBudget,
          actualCost: 0,
          progressPercent: 0,
          status: 'Planning',
        }),
    });
  }

  private addProject(project: Project): void {
    this.projects.update((projects) => {
      const updatedProjects = [...projects, project];
      this.saveProjects(updatedProjects);
      return updatedProjects;
    });
    this.isSubmitting.set(false);
    this.showProjectForm.set(false);
    Object.assign(this.projectForm, {
      projectCode: '',
      name: '',
      clientName: '',
      clientContact: '',
      siteAddress: '',
      startDate: '',
      expectedCompletionDate: '',
      estimatedBudget: 0,
      projectManager: '',
      description: '',
    });
  }

  private readSavedProjects(): Project[] {
    try {
      const saved = localStorage.getItem(this.projectStorageKey);
      if (saved) return JSON.parse(saved) as Project[];

      const legacySaved = localStorage.getItem('fieldline.projects');
      if (!legacySaved) return [];

      const projects = JSON.parse(legacySaved) as Project[];
      localStorage.setItem(this.projectStorageKey, JSON.stringify(projects));
      return projects;
    } catch {
      return [];
    }
  }

  private saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(this.projectStorageKey, JSON.stringify(projects));
    } catch {
      // Storage may be unavailable in private browsing or restricted environments.
    }
  }

  protected averageProgress(projects: { progressPercent: number }[]): number {
    return projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((total, project) => total + project.progressPercent, 0) / projects.length,
        );
  }
  protected chartProjects(): Project[] {
    return this.visibleProjects()
      .slice()
      .sort((left, right) => this.projectBudget(right) - this.projectBudget(left))
      .slice(0, 6);
  }
  protected chartBudgetWidth(project: Project): number {
    const maximum = Math.max(...this.chartProjects().map((item) => this.projectBudget(item)), 1);
    return Math.round((this.projectBudget(project) / maximum) * 100);
  }
  protected chartActualWidth(project: Project): number {
    const maximum = Math.max(...this.chartProjects().map((item) => this.projectBudget(item)), 1);
    return Math.min(100, Math.round((this.projectActualCost(project) / maximum) * 100));
  }
  protected expenseCategoryTotals(): { category: string; amount: number; width: number }[] {
    const totals = new Map<string, number>();
    for (const expense of this.visibleExpenses())
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    const values = [...totals.entries()].sort((left, right) => right[1] - left[1]);
    const maximum = Math.max(values[0]?.[1] ?? 0, 1);
    return values.map(([category, amount]) => ({
      category,
      amount,
      width: Math.round((amount / maximum) * 100),
    }));
  }
  protected paymentStatusTotals(): { status: string; count: number; width: number }[] {
    const totals = new Map<string, number>();
    for (const payment of this.visiblePayments())
      totals.set(payment.status, (totals.get(payment.status) ?? 0) + 1);
    const values = [...totals.entries()];
    const maximum = Math.max(...values.map(([, count]) => count), 1);
    return values.map(([status, count]) => ({
      status,
      count,
      width: Math.round((count / maximum) * 100),
    }));
  }
  protected totalStockValue(): number {
    return this.visibleMaterials().reduce(this.stockValue, 0);
  }

  protected budgetExceeded(project: Project): boolean {
    return this.projectActualCost(project) > this.projectBudget(project);
  }

  protected scheduleAtRisk(project: Project): boolean {
    if (project.status === 'Delayed') return true;
    if (
      !project.expectedCompletionDate ||
      project.status === 'Completed' ||
      project.status === 'Cancelled'
    )
      return false;
    return new Date(project.expectedCompletionDate).getTime() < Date.now();
  }

  protected projectRiskLabel(project: Project): string {
    if (this.budgetExceeded(project) && this.scheduleAtRisk(project))
      return 'Budget and schedule risk';
    if (this.budgetExceeded(project)) return 'Budget exceeded';
    if (this.scheduleAtRisk(project)) return 'Schedule risk';
    return '';
  }

  protected riskProjects(): Project[] {
    return this.visibleProjects().filter(
      (project) => this.budgetExceeded(project) || this.scheduleAtRisk(project),
    );
  }
}
