import { Component, OnInit, ChangeDetectorRef, HostListener, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';

@Component({
  selector: 'app-system-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardsComponent],
  templateUrl: './system-dashboard.component.html',
  styleUrl: './system-dashboard.component.css',
})
export class SystemDashboardComponent implements OnInit {
  selectedYear!: number;
  selectedSemester: number = 1;
  selectedMajor: string = 'all'; 
  userRole: string = 'student';
  currentAdvisorId: number = 0;

  availableYears: number[] = [];
  availableMajors: string[] = []; 

  isYearDropdownOpen: boolean = false;
  isSemesterDropdownOpen: boolean = false;
  isMajorDropdownOpen: boolean = false; 

  dashboardStats = [
    { label: 'จำนวนผู้ใช้งานทั้งหมด', value: 0, icon: 'group', bgColor: 'bg-blue-100', textColor: 'text-blue-600', cardBg: 'bg-[#F3FBFF]' },
    { label: 'จำนวนนักศึกษา', value: 0, icon: 'school', bgColor: 'bg-green-100', textColor: 'text-green-600', cardBg: 'bg-[#F5FFFA]' },
    { label: 'จำนวนอาจารย์', value: 0, icon: 'person', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', cardBg: 'bg-[#FFF9E5]' },
    { label: 'ผู้ดูแลระบบ', value: 0, icon: 'assignment', bgColor: 'bg-red-200', textColor: 'text-red-600', cardBg: 'bg-[#FFE5E5]' },
  ];

  advisingKpiData: any[] = [];
  ploKpiData: any[] = [];
  advisorConsultData: any[] = []; // 🌟 เก็บข้อมูลสรุปการให้คำปรึกษาของอาจารย์ (ชื่อ + จำนวนครั้ง)

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.setUserFromToken();
    this.loadStats();
    this.loadAvailableYears();
    this.loadAvailableMajors();
  }

  private setUserFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = this.decodeJwtPayload(token);
      if (payload?.role) this.userRole = payload.role;
      if (payload?.advisor_id) this.currentAdvisorId = Number(payload.advisor_id);
    } catch (e) {
      console.error('ถอดรหัส Token ไม่สำเร็จ:', e);
    }
  }

  private decodeJwtPayload(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private getCurrentThaiYear(): number {
    return new Date().getFullYear() + 543;
  }

  loadAvailableYears() {
    this.http.get('http://localhost:8080/api/get_dashboard_stats.php?action=get_years').subscribe({
      next: (res: any) => {
        const yearsFromApi: number[] = Array.isArray(res) ? res : [];
        const currentYear = this.getCurrentThaiYear();
        const otherYears = Array.from(new Set(yearsFromApi.filter((y) => y !== currentYear))).sort((a, b) => b - a);
        this.availableYears = [currentYear, ...otherYears];
        this.selectedYear = currentYear;
        this.loadKpiData();
        this.cdr.detectChanges();
      },
      error: () => {
        this.availableYears = [this.getCurrentThaiYear()];
        this.selectedYear = this.getCurrentThaiYear();
        this.loadKpiData();
      }
    });
  }

  loadAvailableMajors() {
    this.http.get('http://localhost:8080/api/get_dashboard_stats.php?action=get_majors').subscribe({
      next: (res: any) => {
        this.availableMajors = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('โหลดภาควิชาล้มเหลว:', err)
    });
  }

  onFilterChange() {
    this.loadKpiData();
    this.cdr.detectChanges(); 
  }

  loadStats() {
    this.http.get('http://localhost:8080/api/get_dashboard_stats.php?action=basic_stats').subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dashboardStats = this.dashboardStats.map((stat) => {
            if (stat.label === 'จำนวนผู้ใช้งานทั้งหมด') return { ...stat, value: res.total };
            if (stat.label === 'จำนวนนักศึกษา') return { ...stat, value: res.student };
            if (stat.label === 'จำนวนอาจารย์') return { ...stat, value: res.teacher };
            if (stat.label === 'ผู้ดูแลระบบ') return { ...stat, value: res.admin };
            return stat;
          });
          this.cdr.detectChanges();
        }
      },
    });
  }

  toggleYearDropdown(event: Event) {
    event.stopPropagation();
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    this.isSemesterDropdownOpen = false;
    this.isMajorDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleSemesterDropdown(event: Event) {
    event.stopPropagation();
    this.isSemesterDropdownOpen = !this.isSemesterDropdownOpen;
    this.isYearDropdownOpen = false;
    this.isMajorDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleMajorDropdown(event: Event) {
    event.stopPropagation();
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
    this.isYearDropdownOpen = false;
    this.isSemesterDropdownOpen = false;
    this.cdr.detectChanges();
  }

  selectYear(year: number) {
    this.selectedYear = year;
    this.isYearDropdownOpen = false;
    this.onFilterChange();
  }

  selectSemester(semester: number) {
    this.selectedSemester = semester;
    this.isSemesterDropdownOpen = false;
    this.onFilterChange();
  }

  selectMajor(major: string) {
    this.selectedMajor = major;
    this.isMajorDropdownOpen = false;
    this.onFilterChange();
  }

  @HostListener('document:click')
  clickout() {
    if (this.isYearDropdownOpen || this.isSemesterDropdownOpen || this.isMajorDropdownOpen) {
      this.isYearDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
      this.isMajorDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  loadKpiData() {
    if (!this.selectedYear) return;

    const apiBase = 'http://localhost:8080/api/get_dashboard_stats.php';
    const majorParam = `&major=${encodeURIComponent(this.selectedMajor)}`;

    // Advising KPI (หลักสูตร)
    this.http.get(`${apiBase}?action=advising_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}${majorParam}`)
      .subscribe((res: any) => {
        this.selectedDonutIndex = null;
        this.studentLists = {};
        this.advisingKpiData = res.map((item: any) => {
          let greenTone = '';
          let textStatus = '';

          if (item.advising_percentage >= 90) {
            greenTone = '#10b981';
            textStatus = ' ดูแลครบถ้วน (≥90%)';
          } else if (item.advising_percentage >= 70) {
            greenTone = '#34d399';
            textStatus = ' ดูแลตามเกณฑ์ (≥70%)';
          } else {
            greenTone = '#a3e635';
            textStatus = ' ต้องเร่งติดตาม (<70%)';
          }

          return { ...item, colorHex: greenTone, statusLabel: textStatus };
        });
        this.cdr.detectChanges();
      });

    // PLO KPI
    this.http.get(`${apiBase}?action=plo_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}&role=${this.userRole}&advisor_id=${this.currentAdvisorId}${majorParam}`)
      .subscribe((res: any) => {
        this.ploKpiData = res;
        this.cdr.detectChanges();
      });

    // 🌟 1. ดึงข้อมูลจำนวนครั้งการให้คำปรึกษา แยกตามอาจารย์ (ดึงชื่ออาจารย์มาแสดง)
    this.http.get(`${apiBase}?action=advisor_consult_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}`)
      .subscribe((res: any) => {
        this.advisorConsultData = Array.isArray(res) ? res : [];
        this.cdr.detectChanges();
      });
  }

  // ─── Modal & Helper Functions ───
  selectedDonutIndex: number | null = null;
  studentLists: { [major: string]: any[] } = {};
  loadingStudentsMajor: string | null = null;
  studentFilter: 'all' | 'advised' | 'pending' = 'all';
  studentSearch: string = '';

  get selectedItem(): any | null {
    return this.selectedDonutIndex === null ? null : this.advisingKpiData[this.selectedDonutIndex] ?? null;
  }

  openMajorDetail(index: number) {
    const major = this.advisingKpiData[index]?.major;
    this.selectedDonutIndex = index;
    this.studentFilter = 'all';
    this.studentSearch = '';
    // ตั้งสถานะ "กำลังโหลด" ก่อนวาดหน้าต่าง เพื่อไม่ให้เห็นหน้าต่างว่างระหว่างรอข้อมูล
    this.loadingStudentsMajor = major && !this.studentLists[major] ? major : null;
    this.cdr.detectChanges();
    this.loadStudentsForMajor(major);
  }

  @HostListener('document:keydown.escape')
  closeMajorDetail() {
    if (this.selectedDonutIndex === null) return;
    this.selectedDonutIndex = null;
    this.cdr.detectChanges();
  }

  getDisplayName(st: any): string {
    const name = (st?.student_name ?? '').toString().trim();
    return name || (st?.student_code ?? '').toString() || (st?.student_id ?? '').toString();
  }

  getFilteredStudents(): any[] {
    const major = this.selectedItem?.major;
    const list: any[] = (major && this.studentLists[major]) || [];
    const q = this.studentSearch.trim().toLowerCase();

    return list.filter((st) => {
      if (this.studentFilter === 'advised' && !st.is_advised) return false;
      if (this.studentFilter === 'pending' && st.is_advised) return false;
      if (!q) return true;
      return this.getDisplayName(st).toLowerCase().includes(q);
    });
  }

  private loadStudentsForMajor(major: string) {
    if (!major || this.studentLists[major]) return;

    this.http.get(`http://localhost:8080/api/get_dashboard_stats.php?action=advising_students&year=${this.selectedYear}&semester=${this.selectedSemester}&major=${encodeURIComponent(major)}`)
      .subscribe({
        next: (res: any) => {
          // รันใน NgZone + สั่งวาดใหม่ เพื่อให้รายชื่อขึ้นทันที ไม่ต้องรอคลิกที่อื่น
          this.zone.run(() => {
            if (Array.isArray(res)) {
              this.studentLists[major] = res;
            } else {
              console.error('รูปแบบข้อมูลรายชื่อนักศึกษาไม่ถูกต้อง:', res);
            }
            this.loadingStudentsMajor = null;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('โหลดรายชื่อนักศึกษาล้มเหลว:', err);
            this.loadingStudentsMajor = null;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
      });
  }

  getDonutDash(percentage: number): string {
    const p = Math.min(100, Math.max(0, Number(percentage) || 0));
    return `${p}, 100`;
  }

  getNotAdvised(item: any): number {
    return Math.max(0, (Number(item.total_students) || 0) - (Number(item.advised_students) || 0));
  }
}