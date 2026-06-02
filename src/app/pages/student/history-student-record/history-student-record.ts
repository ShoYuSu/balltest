import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

interface StudentInfo {
  student_id: number; student_code: string; faculty: string; major: string;
  year: number; curriculum_year: string;
  full_name: string; email: string; phone: string | null; img_profile: string | null;
}
interface AdvisorHistory {
  year: number; is_current: number;
  advisor_name: string; advisor_email: string; advisor_phone: string;
  advisor_img: string | null; dept_name: string;
}

@Component({
  selector: 'app-history-student-record',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-student-record.html',
  styleUrl: './history-student-record.css',
})
export class HistoryStudentRecord implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  student: StudentInfo | null = null;
  advisors: AdvisorHistory[] = [];

  get avatarUrl(): string {
    if (this.student?.img_profile)
      return `${environment.apiUrl}/${this.student.img_profile}`;
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.student?.full_name || '-') + '&background=7B4A1E&color=fff&size=128';
  }

  advisorAvatar(img: string | null, name: string): string {
    if (img) return `${environment.apiUrl}/${img}`;
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=A0622A&color=fff&size=80';
  }

  ngOnInit() {
    const uid = localStorage.getItem('user_id');
    if (!uid) return;
    this.http.get<any>(`${environment.apiUrl}/get_student_history.php?user_id=${uid}`)
      .subscribe({
        next: d => {
          this.student = d.student;
          this.advisors = d.advisors;
          this.cdr.detectChanges();
        },
        error: () => {}
      });
  }
}
