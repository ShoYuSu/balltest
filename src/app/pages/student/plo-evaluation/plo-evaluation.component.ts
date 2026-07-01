import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

interface PloItem {
  plo_id: number;
  plo_name: string;
  description: string;
  score: number;
  status: 'passed' | 'in_progress' | 'not_assessed';
  assessment_date: string | null;
  advisor_name: string | null;
}

interface PloResponse {
  student_id: number;
  total: number;
  passed: number;
  plos: PloItem[];
}

@Component({
  selector: 'app-plo-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plo-evaluation.component.html',
  styleUrl: './plo-evaluation.component.css',
})
export class PloEvaluationComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  total = 0;
  passed = 0;
  plos: PloItem[] = [];

  get overallPercent(): number {
    return this.total > 0 ? Math.round((this.passed / this.total) * 100) : 0;
  }

  get overallText(): string {
    if (this.total === 0) return 'ยังไม่มีข้อมูล PLO';
    return `ผ่านแล้ว ${this.passed} จาก ${this.total} ข้อ`;
  }

  get belowThreshold(): number {
    return this.plos.filter(p => p.status === 'in_progress').length;
  }

  get notAssessed(): number {
    return this.plos.filter(p => p.status === 'not_assessed').length;
  }

  get overallStatus(): string {
    if (this.total === 0) return '-';
    if (this.passed === this.total) return 'สถานะโดยรวม: ผ่านทุกข้อ ✓';
    if (this.passed > 0) return 'สถานะโดยรวม: รอการประเมินเพิ่มเติม';
    return 'สถานะโดยรวม: ยังไม่ผ่านการประเมิน';
  }

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    this.http
      .get<PloResponse>(`${environment.apiUrl}/get_student_plo.php?user_id=${userId}`)
      .subscribe({
        next: (data) => {
          this.total = data.total;
          this.passed = data.passed;
          this.plos = data.plos;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('PLO load error:', err),
      });
  }

  getBarColor(status: string): string {
    if (status === 'passed') return 'bg-green-500';
    if (status === 'in_progress') return 'bg-yellow-400';
    return 'bg-gray-300';
  }

  getStatusLabel(status: string): string {
    if (status === 'passed') return 'บรรลุผลตามเกณฑ์';
    if (status === 'in_progress') return 'อยู่ระหว่างประเมิน';
    return 'ยังไม่ประเมิน';
  }

  getStatusColor(status: string): string {
    if (status === 'passed') return 'bg-green-100 text-green-600';
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-600';
    return 'bg-gray-100 text-gray-500';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
