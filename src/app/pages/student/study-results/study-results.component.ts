import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-study-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-results.component.html',
  styleUrl: './study-results.component.css',
})
export class StudyResultsComponent implements OnInit {
  private http = inject(HttpClient);
  apiUrl = environment.apiUrl;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  activeTab: 'result' | 'credit' = 'result';
  isDropdownOpen = false;

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
    let credits = 0;
    let points = 0;
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
    if (this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  selectTerm(term: string) {
    this.selectedTerm.set(term);
    this.isDropdownOpen = false;
  }

  ngOnInit() {
    this.loadStudyResults();
  }

  loadStudyResults() {
    const studentCode =
      localStorage.getItem('student_code') || localStorage.getItem('username') || '6504800006';
    if (!studentCode) return;

    this.http
      .get<any>(
        `${this.apiUrl}/get_study_results.php?student_code=${studentCode}&t=${new Date().getTime()}`,
      )
      .subscribe({
        next: (res) => {
          if (res.error) return console.error(res.error);

          this.gpax.set(res.gpax);
          this.latestGpa.set(res.latest_gpa);
          this.creditsDone.set(res.total_credits_done);
          this.creditsNeed.set(res.total_credits_need);

          this.allSubjects.set(res.subjects);
          this.creditSummary.set(res.credit_summary);
          this.terms.set(res.terms);

          if (res.terms.length > 0) {
            this.selectedTerm.set(res.terms[0]);
          }
        },
        error: (err) => console.error('Failed to load study results:', err),
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
