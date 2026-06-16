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
  userRole: string = 'admin';
  currentAdvisorId: number = 14;

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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadAvailableYears();
    this.loadAvailableMajors();
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

  onFilterChange() {
    this.loadKpiData();
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
  }

  toggleSemesterDropdown(event: Event) {
    event.stopPropagation();
    this.isSemesterDropdownOpen = !this.isSemesterDropdownOpen;
    this.isYearDropdownOpen = false;
    this.isMajorDropdownOpen = false;
  }

  toggleMajorDropdown(event: Event) {
    event.stopPropagation();
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
    this.isYearDropdownOpen = false;
    this.isSemesterDropdownOpen = false;
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
    this.isYearDropdownOpen = false;
    this.isSemesterDropdownOpen = false;
    this.isMajorDropdownOpen = false;
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
            textStatus = '🏆 Leader Tier (ดูแลดีเยี่ยม)';
          } else if (item.advising_percentage >= 70) {
            greenTone  = '#34d399'; // emerald-400
            textStatus = '✨ Passed Tier (ผ่านเกณฑ์ดี)';
          } else {
            greenTone  = '#a3e635'; // lime-400
            textStatus = '⚡ Improving Tier (ควรเร่งส่งเสริม)';
          }

          return { ...item, colorHex: greenTone, statusLabel: textStatus };
        });
        this.cdr.detectChanges();
      });

    // PLO KPI
    this.http
      .get(`${apiBase}?action=plo_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}&role=${this.userRole}&advisor_id=${this.currentAdvisorId}${majorParam}`)
      .subscribe((res: any) => {
        this.ploKpiData = res;
        this.cdr.detectChanges();
      });
  }

  // ─── Chart Calculation Helpers (เพิ่มใหม่สำหรับกราฟเส้น) ───

  getPointX(index: number): number {
    const minX = 60;
    const maxX = 740;
    const width = maxX - minX;
    if (!this.advisingKpiData || this.advisingKpiData.length === 0) return minX;
    if (this.advisingKpiData.length === 1) return minX + width / 2;
    return minX + index * (width / (this.advisingKpiData.length - 1));
  }

  getPointY(percentage: number): number {
    const minY = 30;  // 100% position
    const maxY = 200; // 0% position
    const height = maxY - minY;
    return maxY - (percentage / 100) * height;
  }

  get lineChartPath(): string {
    if (!this.advisingKpiData || this.advisingKpiData.length === 0) return '';
    return this.advisingKpiData.map((d, i) => {
      const x = this.getPointX(i);
      const y = this.getPointY(d.advising_percentage);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  get areaChartPath(): string {
    if (!this.advisingKpiData || this.advisingKpiData.length === 0) return '';
    let path = this.lineChartPath;
    const firstX = this.getPointX(0);
    const lastX = this.getPointX(this.advisingKpiData.length - 1);
    const bottomY = 200;
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    return path;
  }
}