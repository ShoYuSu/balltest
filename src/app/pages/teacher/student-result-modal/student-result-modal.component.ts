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
import { CommonModule, Location } from '@angular/common'; // 👉 1. เพิ่ม Location ตรงนี้
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
  private location = inject(Location); // 👉 2. Inject Location เข้ามาใช้งาน

  @ViewChild('dropdownRef') dropdownRef?: ElementRef;

  // ดึงข้อมูลนักศึกษาจาก router state ที่ส่งมาจากหน้าก่อนหน้า
  student: any = this.router.getCurrentNavigation()?.extras?.state?.['student'] ?? null;

  activeTab: 'result' | 'credit' = 'result';
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
    // ใช้ setTimeout เพื่อรอให้ Angular วาดหน้าเว็บให้เสร็จก่อน 50 มิลลิวินาที
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
      scrollContainers.forEach((container) => {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }, 50);

    const studentCode = this.route.snapshot.paramMap.get('studentCode');
    if (studentCode) this.loadResults(studentCode);
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

  selectTerm(term: string) {
    this.selectedTerm.set(term);
    this.isDropdownOpen = false;
  }

  // 👉 3. เปลี่ยนจาก router.navigate เป็น location.back()
  goBack() {
    this.location.back();
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
