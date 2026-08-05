import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
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
  userRole: string = 'student'; // ค่า default ก่อนถอดรหัส token — จะถูกแทนที่ทันทีใน ngOnInit
  currentAdvisorId: number = 0;

  availableYears: number[] = [];
  availableMajors: string[] = []; 

  isYearDropdownOpen: boolean = false;
  isSemesterDropdownOpen: boolean = false;
  isMajorDropdownOpen: boolean = false; 

  dashboardStats = [
    {
      label: 'จำนวนผู้ใช้งานทั้งหมด',
      value: 0,
      icon: 'group',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      cardBg: 'bg-[#F3FBFF]',
    },
    {
      label: 'จำนวนนักศึกษา',
      value: 0,
      icon: 'school',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      cardBg: 'bg-[#F5FFFA]',
    },
    {
      label: 'จำนวนอาจารย์',
      value: 0,
      icon: 'person',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      cardBg: 'bg-[#FFF9E5]',
    },
    {
      label: 'ผู้ดูแลระบบ',
      value: 0,
      icon: 'assignment',
      bgColor: 'bg-red-200',
      textColor: 'text-red-600',
      cardBg: 'bg-[#FFE5E5]',
    },
  ];

  advisingKpiData: any[] = [];
  ploKpiData: any[] = [];

  // สำหรับ tooltip กราฟแท่ง (ใช้พิกัดจริงบนหน้าจอ ไม่ใช่ % จาก viewBox
  // เพื่อไม่ให้โดนตัดขอบโดย overflow-hidden ของ container ที่เลื่อนได้)
  hoveredIndex: number | null = null;
  tooltipClientX: number = 0;
  tooltipClientY: number = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
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
      if (payload?.role) {
        this.userRole = payload.role;
      }
      if (payload?.advisor_id) {
        this.currentAdvisorId = Number(payload.advisor_id);
      }
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

  loadAvailableYears() {
    this.http.get('http://localhost:8080/api/get_dashboard_stats.php?action=get_years').subscribe({
      next: (res: any) => {
        this.availableYears = res;
        this.selectedYear = this.availableYears?.length > 0 ? this.availableYears[0] : 2569;
        this.loadKpiData();
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedYear = 2569;
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

  // 🔴 เพิ่ม this.cdr.detectChanges() เพื่อให้อัปเดตหน้าจอทันทีเมื่อเปลี่ยนฟิลเตอร์
  onFilterChange() {
    this.loadKpiData();
    this.cdr.detectChanges(); 
  }

  loadStats() {
    this.http
      .get('http://localhost:8080/api/get_dashboard_stats.php?action=basic_stats')
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.dashboardStats = this.dashboardStats.map((stat) => {
              if (stat.label === 'จำนวนผู้ใช้งานทั้งหมด') return { ...stat, value: res.total };
              if (stat.label === 'จำนวนนักศึกษา')         return { ...stat, value: res.student };
              if (stat.label === 'จำนวนอาจารย์')           return { ...stat, value: res.teacher };
              if (stat.label === 'ผู้ดูแลระบบ')             return { ...stat, value: res.admin };
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
    this.cdr.detectChanges(); // 🔴 สั่งให้อัปเดตการเปิด/ปิด เมนูทันที
  }

  toggleSemesterDropdown(event: Event) {
    event.stopPropagation();
    this.isSemesterDropdownOpen = !this.isSemesterDropdownOpen;
    this.isYearDropdownOpen = false;
    this.isMajorDropdownOpen = false;
    this.cdr.detectChanges(); // 🔴 สั่งให้อัปเดตการเปิด/ปิด เมนูทันที
  }

  toggleMajorDropdown(event: Event) {
    event.stopPropagation();
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
    this.isYearDropdownOpen = false;
    this.isSemesterDropdownOpen = false;
    this.cdr.detectChanges(); // 🔴 สั่งให้อัปเดตการเปิด/ปิด เมนูทันที
  }

  // 🔴 แก้ไขฟังก์ชันเลือกปี: สั่งอัปเดตหน้าจอทันทีหลังเปลี่ยนค่า
  selectYear(year: number) {
    this.selectedYear = year;
    this.isYearDropdownOpen = false;
    this.onFilterChange();
    this.cdr.detectChanges();
  }

  // 🔴 แก้ไขฟังก์ชันเลือกภาคเรียน: สั่งอัปเดตหน้าจอทันทีหลังเปลี่ยนค่า
  selectSemester(semester: number) {
    this.selectedSemester = semester;
    this.isSemesterDropdownOpen = false;
    this.onFilterChange();
    this.cdr.detectChanges();
  }

  // 🔴 แก้ไขฟังก์ชันเลือกสาขา: สั่งอัปเดตหน้าจอทันทีหลังเปลี่ยนค่า
  selectMajor(major: string) {
    this.selectedMajor = major;
    this.isMajorDropdownOpen = false;
    this.onFilterChange();
    this.cdr.detectChanges();
  }

  @HostListener('document:click')
  clickout() {
    if (this.isYearDropdownOpen || this.isSemesterDropdownOpen || this.isMajorDropdownOpen) {
      this.isYearDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
      this.isMajorDropdownOpen = false;
      this.cdr.detectChanges(); // 🔴 สั่งอัปเดตหน้าจอทันทีตอนคลิกที่ว่างแล้วเมนูปิด
    }
  }

  loadKpiData() {
    if (!this.selectedYear) return;

    const apiBase = 'http://localhost:8080/api/get_dashboard_stats.php';
    const majorParam = `&major=${encodeURIComponent(this.selectedMajor)}`;

    // Advising KPI
    this.http
      .get(`${apiBase}?action=advising_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}${majorParam}`)
      .subscribe((res: any) => {
        this.advisingKpiData = res.map((item: any) => {
          let greenTone = '';
          let textStatus = '';

          if (item.advising_percentage >= 90) {
            greenTone  = '#10b981'; // emerald-500
            textStatus = ' ดูแลครบถ้วน (≥90%)';
          } else if (item.advising_percentage >= 70) {
            greenTone  = '#34d399'; // emerald-400
            textStatus = ' ดูแลตามเกณฑ์ (≥70%)';
          } else {
            greenTone  = '#a3e635'; // lime-400
            textStatus = ' ต้องเร่งติดตาม (<70%)';
          }

          return { ...item, colorHex: greenTone, statusLabel: textStatus };
        });
        this.cdr.detectChanges(); // อัปเดตทันทีเมื่อได้ข้อมูลกราฟ
      });

    // PLO KPI
    this.http
      .get(`${apiBase}?action=plo_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}&role=${this.userRole}&advisor_id=${this.currentAdvisorId}${majorParam}`)
      .subscribe((res: any) => {
        this.ploKpiData = res;
        this.cdr.detectChanges(); // อัปเดตทันทีเมื่อได้ข้อมูล PLO
      });
  }

  // ─── Chart Calculation Helpers (แท่งกราฟ + วงกลมยอดแท่ง) ───

  readonly barWidth = 48;

  private calcX(index: number, count: number): number {
    const minX = 60;
    const maxX = 740;
    const width = maxX - minX;
    if (count === 0) return minX;
    if (count === 1) return minX + width / 2;
    return minX + index * (width / (count - 1));
  }

  getPointX(index: number): number {
    return this.calcX(index, this.advisingKpiData?.length || 0);
  }

  getPointY(percentage: number): number {
    const minY = 30;  // 100% position
    const maxY = 200; // 0% position
    const height = maxY - minY;
    return maxY - (percentage / 100) * height;
  }

  getBarX(index: number): number {
    return this.getPointX(index) - this.barWidth / 2;
  }

  getBarHeight(percentage: number): number {
    const baseline = 200;
    return baseline - this.getPointY(percentage);
  }

  // ─── Tooltip Hover Handlers ───
  // ใช้ getBoundingClientRect() ของแท่งกราฟที่ hover เพื่อหาตำแหน่งจริงบนหน้าจอ
  // แม่นยำกว่าคำนวณจาก % viewBox และไม่โดนตัดขอบโดย overflow ของ container

  onBarHover(index: number, item: any, event: MouseEvent) {
    this.hoveredIndex = index;

    const target = event.currentTarget as SVGGElement;
    const rect = target.getBoundingClientRect();

    this.tooltipClientX = rect.left + rect.width / 2;
    this.tooltipClientY = rect.top;

    this.cdr.detectChanges();
  }

  onBarLeave() {
    this.hoveredIndex = null;
    this.cdr.detectChanges();
  }
}