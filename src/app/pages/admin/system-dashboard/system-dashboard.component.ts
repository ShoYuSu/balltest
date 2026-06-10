import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core'; //  เพิ่ม HostListener เข้ามาตรงนี้
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
  // กำหนดสิทธิ์และตัวกรองตามบรีฟอาจารย์ (ไม่สะสมข้ามปี เก็บประวัติรายเทอม)
  selectedYear!: number;
  selectedSemester: number = 1;
  userRole: string = 'admin';
  currentAdvisorId: number = 14;

  availableYears: number[] = [];
  isYearDropdownOpen: boolean = false;
  isSemesterDropdownOpen: boolean = false;

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
    this.loadAvailableYears(); //  เปลี่ยนมาเรียกฟังก์ชันดึงปีการศึกษาก่อน เพื่อเอาค่าปีไปโหลดกราฟต่อ
  }

  //  ฟังก์ชันดึงปีการศึกษาที่มีข้อมูลจริงทั้งหมดมาจาก PHP
  loadAvailableYears() {
    this.http.get('http://localhost:8080/api/get_dashboard_stats.php?action=get_years').subscribe({
      next: (res: any) => {
        this.availableYears = res; //  พัดเอาอาร์เรย์ปี พ.ศ. [2570, 2569] จาก PHP มาเก็บไว้
        
        // ดักเช็ก: ถ้าดึงปีมาได้สำเร็จ ให้ระบบทำการล็อกเลือกปีล่าสุด (ตัวแรกของอาเรย์) ให้ผู้ใช้อัตโนมัติ
        if (this.availableYears && this.availableYears.length > 0) {
          this.selectedYear = this.availableYears[0]; // หน้าจอจะถูกตั้งเป็น 2570 ทันที
        } else {
          this.selectedYear = 2569; // กรณีฉุกเฉินฐานข้อมูลไม่มีหลักสูตรเลย
        }

        // พอได้ปีการศึกษาที่ถูกต้องและมีอยู่จริงแล้ว ค่อยสั่งโหลดข้อมูลกราฟแสดงผลต่อครับ
        this.loadKpiData(); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('โหลดข้อมูลปีการศึกษาล้มเหลว:', err);
        this.selectedYear = 2569;
        this.loadKpiData();
      }
    });
  }

  onFilterChange() {
    this.loadKpiData(); // กดเปลี่ยนปีการศึกษาหรือเทอมแล้วข้อมูลจะรีโหลดเรียลไทม์
  }

  loadStats() {
    this.http
      .get('http://localhost:8080/api/get_dashboard_stats.php?action=basic_stats')
      .subscribe({
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
  }

  toggleSemesterDropdown(event: Event) {
    event.stopPropagation();
    this.isSemesterDropdownOpen = !this.isSemesterDropdownOpen;
    this.isYearDropdownOpen = false;
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

  //  แถมโค้ดตรวจจับการคลิกด้านนอกเมนูเพื่อให้กล่องยอมหุบกลับไปอัตโนมัติครับ
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    this.isYearDropdownOpen = false;
    this.isSemesterDropdownOpen = false;
  }

  loadKpiData() {
    // ป้องกันกรณีที่ฟังก์ชันเผลอทำงานตอนที่ปีการศึกษายังโหลดไม่เสร็จ
    if (!this.selectedYear) return;

    const apiBase = 'http://localhost:8080/api/get_dashboard_stats.php';

    // 🟢 1. เรียกดึงข้อมูลร้อยละคำปรึกษา พร้อมระบบแมปคำนวณเฉดสีเขียวอัตโนมัติ
    this.http
      .get(
        `${apiBase}?action=advising_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}`,
      )
      .subscribe((res: any) => {
        this.advisingKpiData = res.map((item: any) => {
          let greenTone = '';
          let textStatus = '';
          
          // 💡 ตรรกะแยกความเข้มของเฉดสีเขียวตามระดับร้อยละความขยันของอาจารย์ที่ปรึกษา
          if (item.advising_percentage >= 90) {
            greenTone = 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200'; // 🏆 เขียวมรกตกลุ่มผู้นำ
            textStatus = '🏆 Leader Tier (ดูแลดีเยี่ยม)';
          } else if (item.advising_percentage >= 70 && item.advising_percentage < 90) {
            greenTone = 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-100';  // ✨ เขียวใบไม้ระดับมาตรฐาน
            textStatus = '✨ Passed Tier (ผ่านเกณฑ์ดี)';
          } else {
            greenTone = 'bg-gradient-to-r from-lime-400 to-green-400';                      // ⚡ เขียวตองอ่อนกลุ่มปรับปรุง
            textStatus = '⚡ Improving Tier (ควรเร่งส่งเสริม)';
          }
          
          // ส่งค่า Object ตัวเดิมกลับไป พร้อมเพิ่มตัวแปรแต่งสีและป้ายกำกับเข้าหน้าจอ HTML
          return { 
            ...item, 
            colorClass: greenTone,
            statusLabel: textStatus
          };
        });
        this.cdr.detectChanges();
      });

    // 🟣 2. เรียกดูผลสรุปคะแนนประเมิน PLO (คงของเดิมไว้ 100% ข้อมูลไม่หายแน่นอนครับ)
    this.http
      .get(
        `${apiBase}?action=plo_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}&role=${this.userRole}&advisor_id=${this.currentAdvisorId}`,
      )
      .subscribe((res: any) => {
        this.ploKpiData = res;
        this.cdr.detectChanges();
      });
  }
}
