import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-result-modal.component.html',
})
export class StudentResultModalComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  @ViewChild('dropdownRef') dropdownRef?: ElementRef;

  apiUrl = environment.apiUrl; // 🌟 เพิ่ม apiUrl เพื่อให้ HTML เรียกแสดงรูปภาพได้

  student: any = this.router.getCurrentNavigation()?.extras?.state?.['student'] ?? null;

  activeTab: 'result' | 'credit' | 'portfolio' = 'result'; // 🌟 เพิ่มแท็บ portfolio
  isDropdownOpen = false;
  isLoading = signal(true);

  gpax = signal('0.00');
  latestGpa = signal('0.00');
  creditsDone = signal(0);
  creditsNeed = signal(127);

  terms = signal<string[]>([]);
  selectedTerm = signal('');
  allSubjects = signal<any[]>([]);
  creditSummary = signal<any[]>([]);

  // 🌟 เพิ่ม Signal สำหรับเก็บข้อมูลกิจกรรมและใบรับรอง
  activities = signal<any[]>([]);
  certificates = signal<any[]>([]);

  displayedSubjects = computed(() =>
    this.allSubjects().filter((s) => s.term === this.selectedTerm()),
  );

  termStats = computed(() => {
    const subjects = this.displayedSubjects();
    let credits = 0,
      points = 0;
    const gradeValues: Record<string, number> = {
      A: 4,
      'B+': 3.5,
      B: 3,
      'C+': 2.5,
      C: 2,
      'D+': 1.5,
      D: 1,
      F: 0,
    };
    subjects.forEach((s) => {
      if (gradeValues[s.grade] !== undefined) {
        credits += s.credit;
        points += s.credit * gradeValues[s.grade];
      }
    });
    return {
      credits,
      gpa: credits > 0 ? (points / credits).toFixed(2) : '0.00',
    };
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.isDropdownOpen &&
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      this.isDropdownOpen = false;
    }
  }

  ngOnInit() {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
      scrollContainers.forEach((container) => {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }, 50);

    const studentCode = this.route.snapshot.paramMap.get('studentCode');
    if (studentCode) {
      this.loadResults(studentCode);
      this.loadPortfolio(studentCode); // 🌟 สั่งเรียกโหลดข้อมูล e-Portfolio
    }
  }

  loadResults(studentCode: string) {
    this.isLoading.set(true);
    this.http
      .get<any>(
        `${environment.apiUrl}/get_study_results.php?student_code=${studentCode}&t=${Date.now()}`,
      )
      .subscribe({
        next: (res) => {
          if (res.error) {
            this.isLoading.set(false);
            return;
          }
          this.gpax.set(res.gpax);
          this.latestGpa.set(res.latest_gpa);
          this.creditsDone.set(res.total_credits_done);
          this.creditsNeed.set(res.total_credits_need);
          this.allSubjects.set(res.subjects);
          this.creditSummary.set(res.credit_summary);
          this.terms.set(res.terms);
          if (res.terms.length > 0) this.selectedTerm.set(res.terms[0]);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  // 🌟 ฟังก์ชันใหม่สำหรับโหลด e-Portfolio จาก API ที่เราเพิ่งสร้าง
  loadPortfolio(studentCode: string) {
    this.http.get<any>(`${environment.apiUrl}/get_student_portfolio.php?student_code=${studentCode}`).subscribe({
      next: (res) => {
        if (!res.error) {
          this.activities.set(res.activities || []);
          this.certificates.set(res.certificates || []);
        }
      },
      error: (err) => console.error('โหลด Portfolio ไม่สำเร็จ', err)
    });
  }

  selectTerm(term: string) {
    this.selectedTerm.set(term);
    this.isDropdownOpen = false;
  }

  goBack() {
    this.location.back();
  }

  goToEvaluation() {
    this.router.navigate(['/plo-assessment'], {
      state: {
        autoOpenEval: true,
        targetStudentId: this.student.id,
      },
    });
  }

  getGradeColor(grade: string) {
    if (['A', 'B+', 'B'].includes(grade))
      return 'bg-green-100 text-green-700 border border-green-200';
    if (['C+', 'C'].includes(grade)) return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (['D+', 'D'].includes(grade))
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    if (grade === 'F') return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
}