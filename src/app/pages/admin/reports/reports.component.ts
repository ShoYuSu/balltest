import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './reports.html'
})
export class ReportsComponent implements OnInit {

  private apiUrl: string = 'http://localhost:8080/api';

  // 4 แท็บ: กลุ่ม(นัดหมาย) / กิจกรรม / รายบุคคล(ค้นหา) / timeline(ประวัติรวม)
  activeTab: 'group' | 'activity' | 'individual' | 'timeline' = 'group';

  // ข้อมูลดิบจาก get_group_reports.php (มีทั้ง appointment และ activity ปนกัน)
  private allGroupData: any[] = [];

  groupReports: any[] = [];     // record_type === 'appointment'
  activityReports: any[] = [];  // record_type === 'activity'

  individualTimeline: any[] = [];
  timelineStudentLabel: string = '';

  searchStudentId: string = '';

  groupError: string | null = null;
  activityError: string | null = null;
  individualError: string | null = null;

  // ป้องกัน race condition: เมื่อ switchTab/backToIndividualSearch สั่ง navigate เพื่อล้าง
  // query param เอง ไม่ต้องการให้ subscription ด้านล่างมาประมวลผลซ้ำ/ทับ activeTab ที่เพิ่งตั้งไว้
  private skipNextParamsHandling = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ดักจับการเปลี่ยนแปลงของ URL เพื่อแก้ปัญหาข้อมูลหายตอนรีเฟรช
    this.route.queryParams.subscribe(params => {
      // ถ้าเป็นการ navigate ที่เกิดจาก switchTab/backToIndividualSearch เอง ให้ข้ามรอบนี้ไป
      // เพื่อไม่ให้มาทับ activeTab ที่ผู้ใช้เพิ่งกดเลือก
      if (this.skipNextParamsHandling) {
        this.skipNextParamsHandling = false;
        return;
      }

      const studentIdFromUrl = params['student_id'];

      if (studentIdFromUrl) {
        // ถ้ามีรหัสใน URL ให้เปิดแท็บ timeline และดึงข้อมูล
        this.activeTab = 'timeline';
        this.searchStudentId = studentIdFromUrl;
        this.fetchIndividualReport(0, false); // false = ไม่ต้องอัปเดต URL ซ้ำ
      } else if (this.activeTab === 'timeline') {
        // ออกจาก timeline แล้วไม่มีรหัสใน URL แล้ว ให้กลับไปแท็บกลุ่มตามปกติ
        this.activeTab = 'group';
      }
    });

    this.fetchGroupReport();
  }

  // ฟังก์ชันสำหรับกดที่รายชื่อในแท็บกลุ่ม/กิจกรรม แล้วพามาที่แท็บ timeline
  viewStudent(studentCode: string): void {
    if (!studentCode) return;
    // เปลี่ยน URL ไปเพิ่ม ?student_id=xxx ซึ่งจะไป trigger ngOnInit ด้านบนอัตโนมัติ
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { student_id: studentCode }
    });
  }

  switchTab(tab: 'group' | 'activity' | 'individual' | 'timeline'): void {
    this.activeTab = tab;

    if (tab === 'group' || tab === 'activity') {
      if (this.allGroupData.length === 0) {
        this.fetchGroupReport();
      }
    }

    if (tab !== 'timeline') {
      // ล้างรหัสออกจาก URL เมื่อไม่ได้อยู่แท็บ timeline
      // ตั้ง flag ไว้ก่อน navigate เพื่อบอก subscription ด้านบนว่านี่คือ navigate ที่เราสั่งเอง
      this.skipNextParamsHandling = true;
      this.router.navigate([], { queryParams: {} });
    }
  }

  fetchGroupReport(retryCount: number = 0): void {
    this.groupError = null;
    this.activityError = null;

    this.http.get<any>(
      `${this.apiUrl}/get_group_reports.php`
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.allGroupData = res.data || [];
          this.groupReports = this.allGroupData.filter(item => item.record_type === 'appointment');
          this.activityReports = this.allGroupData.filter(item => item.record_type === 'activity');
        } else {
          this.groupError = res.message || 'ไม่สามารถโหลดข้อมูลได้';
          this.activityError = this.groupError;
        }
      },
      error: (err) => {
        console.error('Error fetching group reports:', err);
        if (retryCount < 1) {
          setTimeout(() => {
            this.fetchGroupReport(retryCount + 1);
          }, 500);
        } else {
          this.groupError = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
          this.activityError = this.groupError;
        }
      }
    });
  }

  // เรียกจากแท็บ "รายบุคคล" เมื่อกดค้นหา -> ดึงข้อมูลแล้วพาไปแท็บ timeline
  searchIndividual(): void {
    this.fetchIndividualReport(0, true);
  }

  fetchIndividualReport(retryCount: number = 0, updateUrl: boolean = true): void {
    if (!this.searchStudentId.trim()) {
      this.individualTimeline = [];
      this.individualError = 'กรุณากรอกรหัสนักศึกษา';
      return;
    }

    this.individualError = null;
    const studentId = this.searchStudentId.trim();
    this.timelineStudentLabel = studentId;

    // อัปเดต URL เพื่อป้องกันการรีเฟรชแล้วข้อมูลหาย และเพื่อสลับไปแท็บ timeline
    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { student_id: studentId }
      });
    }

    this.activeTab = 'timeline';

    this.http.get<any>(
      `${this.apiUrl}/get_individual_timeline.php?student_id=${studentId}`
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.individualTimeline = res.data || [];
          if (this.individualTimeline.length === 0) {
            this.individualError = res.message || 'ไม่พบประวัติข้อมูลของนักศึกษาคนนี้';
          }
        } else {
          this.individualTimeline = [];
          this.individualError = res.message || 'ไม่พบข้อมูล';
        }
      },
      error: (err) => {
        console.error('Error fetching individual report:', err);
        if (retryCount < 1) {
          setTimeout(() => {
            this.fetchIndividualReport(retryCount + 1, false);
          }, 500);
        } else {
          this.individualTimeline = [];
          this.individualError = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      }
    });
  }

  // กลับจาก timeline ไปแท็บค้นหารายบุคคล
  backToIndividualSearch(): void {
    this.skipNextParamsHandling = true;
    this.router.navigate([], { queryParams: {} });
    this.activeTab = 'individual';
  }

  getTotalStudents(): number {
    return this.groupReports.reduce(
      (total, group) => total + (group.students?.length || 0),
      0
    );
  }

  getTotalAppointments(): number {
    return this.individualTimeline.filter(
      item => item.record_type === 'appointment'
    ).length;
  }

  getTotalActivities(): number {
    return this.individualTimeline.filter(
      item => item.record_type === 'activity'
    ).length;
  }

  // ใช้ตัดสินป้ายกำกับบนการ์ดแต่ละใบ (แท็บกลุ่ม/กิจกรรม)
  // มีนักศึกษามากกว่า 1 คน -> "กลุ่ม", มีคนเดียว -> "รายบุคคล"
  isGroup(report: any): boolean {
    return (report.students?.length || 0) > 1;
  }
}