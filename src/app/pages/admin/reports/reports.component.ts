import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reports.html',
})
export class ReportsComponent implements OnInit {
  private apiUrl: string = 'http://localhost:8080/api';

  // แท็บปัจจุบัน: 'group' | 'activity' | 'individual' | 'timeline'
  activeTab: 'group' | 'activity' | 'individual' | 'timeline' = 'group';

  private allGroupData: any[] = [];

  groupReports: any[] = []; // การนัดหมายที่มีนักศึกษา > 1 คน (กลุ่ม)
  individualReports: any[] = []; // การนัดหมายที่มีนักศึกษา 1 คน
  activityReports: any[] = []; // กิจกรรมทั้งหมด (record_type === 'activity')

  individualTimeline: any[] = [];
  timelineStudentLabel: string = '';
  searchStudentId: string = '';

  // ------------------------------------------
  // สถานะการเรียงลำดับวันที่ ( default: 'desc' = ใหม่ล่าสุด )
  // ------------------------------------------
  groupSortOrder: 'asc' | 'desc' = 'desc';
  activitySortOrder: 'asc' | 'desc' = 'desc';
  individualSortOrder: 'asc' | 'desc' = 'desc';
  timelineSortOrder: 'asc' | 'desc' = 'desc';

  isLoadingGroup: boolean = false;
  isLoadingTimeline: boolean = false;

  groupError: string | null = null;
  activityError: string | null = null;
  individualError: string | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // 1. ดึงค่าแท็บและรหัสนักศึกษาที่เคยจำไว้ใน sessionStorage
    const savedTab = sessionStorage.getItem('reports_active_tab') as any;
    const savedStudentId = sessionStorage.getItem('reports_student_id');

    if (savedStudentId) {
      this.searchStudentId = savedStudentId;
    }

    if (savedTab && ['group', 'activity', 'individual', 'timeline'].includes(savedTab)) {
      this.activeTab = savedTab;
    } else {
      this.activeTab = 'group';
    }

    // 2. โหลดข้อมูลตามแท็บที่เปิดค้างไว้
    if (this.activeTab === 'timeline' && this.searchStudentId) {
      this.fetchIndividualReport();
    } else {
      this.fetchGroupReport();
    }
  }

  // สลับแท็บพร้อมบันทึกลง sessionStorage (ไม่ต้องมี Query Params บน URL)
  switchTab(tab: 'group' | 'activity' | 'individual' | 'timeline'): void {
    this.activeTab = tab;
    sessionStorage.setItem('reports_active_tab', tab);

    if (tab === 'group' || tab === 'activity' || tab === 'individual') {
      if (this.allGroupData.length === 0) {
        this.fetchGroupReport();
      }
    }
    this.cdr.detectChanges();
  }

  // กดเลือกรายชื่อนักศึกษาจากแท็บอื่นเพื่อดู Timeline
  viewStudent(studentCode: string): void {
    if (!studentCode) return;
    this.searchStudentId = studentCode;
    this.fetchIndividualReport();
  }

  // ดึงข้อมูลรายงานกลุ่ม/กิจกรรม/รายบุคคลจาก get_group_reports.php
  fetchGroupReport(retryCount: number = 0): void {
    this.isLoadingGroup = true;
    this.groupError = null;
    this.activityError = null;

    this.http.get<any>(`${this.apiUrl}/get_group_reports.php`).subscribe({
      next: (res) => {
        this.isLoadingGroup = false;
        if (res.success) {
          this.allGroupData = res.data || [];

          // แยกประเภทตามข้อมูลจริงที่ PHP ส่งมา
          const appointments = this.allGroupData.filter(
            (item) => item.record_type === 'appointment',
          );

          // การนัดหมายกลุ่ม (นักศึกษา > 1 คน)
          this.groupReports = appointments.filter((item) => this.isGroup(item));

          // การนัดหมายรายบุคคล (นักศึกษา <= 1 คน)
          this.individualReports = appointments.filter((item) => !this.isGroup(item));

          // กิจกรรม
          this.activityReports = this.allGroupData.filter(
            (item) => item.record_type === 'activity',
          );

          // จัดเรียงข้อมูลทันทีหลังจากดึงข้อมูลมาแล้ว
          this.sortGroupReports(this.groupSortOrder);
          this.sortIndividualReports(this.individualSortOrder);
          this.sortActivityReports(this.activitySortOrder);
        } else {
          this.groupError = res.message || 'ไม่สามารถโหลดข้อมูลได้';
          this.activityError = this.groupError;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingGroup = false;
        console.error('Error fetching group reports:', err);
        if (retryCount < 1) {
          setTimeout(() => {
            this.fetchGroupReport(retryCount + 1);
          }, 500);
        } else {
          this.groupError = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
          this.activityError = this.groupError;
        }
        this.cdr.detectChanges();
      },
    });
  }

  searchIndividual(): void {
    this.fetchIndividualReport();
  }

  // ดึงข้อมูลประวัติ Timeline รายบุคคลจาก get_individual_timeline.php
  fetchIndividualReport(retryCount: number = 0): void {
    if (!this.searchStudentId.trim()) {
      this.individualTimeline = [];
      this.individualError = 'กรุณากรอกรหัสนักศึกษา';
      this.cdr.detectChanges();
      return;
    }

    this.isLoadingTimeline = true;
    this.individualError = null;
    const studentId = this.searchStudentId.trim();
    this.timelineStudentLabel = studentId;
    this.activeTab = 'timeline';

    // บันทึกสถานะไว้เผื่อกดรีเฟรชหน้าเว็บ
    sessionStorage.setItem('reports_active_tab', 'timeline');
    sessionStorage.setItem('reports_student_id', studentId);

    this.http
      .get<any>(`${this.apiUrl}/get_individual_timeline.php?student_id=${studentId}`)
      .subscribe({
        next: (res) => {
          this.isLoadingTimeline = false;
          if (res.success) {
            this.individualTimeline = res.data || [];
            if (this.individualTimeline.length === 0) {
              this.individualError = res.message || 'ไม่พบประวัติข้อมูลของนักศึกษาคนนี้';
            } else {
              // จัดเรียง Timeline เมื่อโหลดสำเร็จ
              this.sortTimeline(this.timelineSortOrder);
            }
          } else {
            this.individualTimeline = [];
            this.individualError = res.message || 'ไม่พบข้อมูล';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoadingTimeline = false;
          console.error('Error fetching individual report:', err);
          if (retryCount < 1) {
            setTimeout(() => {
              this.fetchIndividualReport(retryCount + 1);
            }, 500);
          } else {
            this.individualTimeline = [];
            this.individualError = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
          }
          this.cdr.detectChanges();
        },
      });
  }

  getTotalStudents(): number {
    return this.groupReports.reduce((total, group) => total + (group.students?.length || 0), 0);
  }

  getTotalAppointments(): number {
    return this.individualTimeline.filter((item) => item.record_type === 'appointment').length;
  }

  getTotalActivities(): number {
    return this.individualTimeline.filter((item) => item.record_type === 'activity').length;
  }

  // ตัดสินว่าเป็นกลุ่มเมื่อมีนักศึกษานัดหมายมากกว่า 1 คน
  isGroup(report: any): boolean {
    return (report.students?.length || 0) > 1;
  }

  // ==========================================
  // ⚙️ LOGIC การจัดเรียงลำดับวันที่ (Date Sorting)
  // ==========================================

  private sortByDate(list: any[], dateKey: string, order: 'asc' | 'desc'): any[] {
    const toTimestamp = (item: any): number => {
      if (!item[dateKey]) return 0;
      const time = item['start_time'] || '00:00:00';
      return new Date(`${item[dateKey]} ${time}`).getTime();
    };
    return list.sort((a, b) => {
      const dateA = toTimestamp(a);
      const dateB = toTimestamp(b);
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  sortGroupReports(order: 'asc' | 'desc'): void {
    this.groupSortOrder = order;
    this.groupReports = this.sortByDate([...this.groupReports], 'date', order);
    this.cdr.detectChanges();
  }

  sortActivityReports(order: 'asc' | 'desc'): void {
    this.activitySortOrder = order;
    this.activityReports = this.sortByDate([...this.activityReports], 'date', order);
    this.cdr.detectChanges();
  }

  sortIndividualReports(order: 'asc' | 'desc'): void {
    this.individualSortOrder = order;
    this.individualReports = this.sortByDate([...this.individualReports], 'date', order);
    this.cdr.detectChanges();
  }

  sortTimeline(order: 'asc' | 'desc'): void {
    this.timelineSortOrder = order;
    this.individualTimeline = this.sortByDate([...this.individualTimeline], 'date', order);
    this.cdr.detectChanges();
  }
}
