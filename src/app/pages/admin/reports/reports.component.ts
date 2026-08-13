import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './reports.html'
})
export class ReportsComponent implements OnInit {
  // Path ไปยัง PHP API ของคุณ
  private apiUrl: string = 'http://localhost/testwd'; 

  // ตัวแปรควบคุม Tab
  activeTab: 'group' | 'individual' = 'group';

  // ตัวแปรเก็บข้อมูล
  groupReports: any[] = [];
  individualTimeline: any[] = [];
  searchStudentId: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchGroupReport();
  }

  switchTab(tab: 'group' | 'individual'): void {
    this.activeTab = tab;
    if (tab === 'group' && this.groupReports.length === 0) {
      this.fetchGroupReport();
    }
  }

  fetchGroupReport(): void {
    this.http.get<any>(`${this.apiUrl}/get_group_reports.php`).subscribe({
      next: (res) => {
        if (res.success) {
          this.groupReports = res.data;
        }
      },
      error: (err) => console.error('Error fetching group reports:', err)
    });
  }

  fetchIndividualReport(): void {
    if (!this.searchStudentId.trim()) {
      alert('กรุณากรอกรหัสนักศึกษา');
      return;
    }
    
    this.http.get<any>(`${this.apiUrl}/get_individual_timeline.php?student_id=${this.searchStudentId.trim()}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.individualTimeline = res.data;
        } else {
          this.individualTimeline = [];
          alert(res.message || 'ไม่พบข้อมูล');
        }
      },
      error: (err) => console.error('Error fetching individual report:', err)
    });
  }
}