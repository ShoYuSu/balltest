import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🌟 ดึงข้อมูลฟอร์มควบคุมเทอมและปีการศึกษา
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
  selectedYear: number = 2569;
  selectedSemester: number = 1;
  userRole: string = 'admin'; // 💡 ลองแก้ตรงนี้เป็น 'teacher' หน้าจอจะปรับสิทธิ์ดึงคะแนน PLO เฉพาะเด็กในกลุ่มดูแลทันที
  currentAdvisorId: number = 14; 

  dashboardStats = [
    { label: 'จำนวนผู้ใช้งานทั้งหมด', value: 0, icon: 'group', bgColor: 'bg-blue-100', textColor: 'text-blue-600', cardBg: 'bg-[#F3FBFF]' },
    { label: 'จำนวนนักศึกษา', value: 0, icon: 'school', bgColor: 'bg-green-100', textColor: 'text-green-600', cardBg: 'bg-[#F5FFFA]' },
    { label: 'จำนวนอาจารย์', value: 0, icon: 'person', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', cardBg: 'bg-[#FFF9E5]' },
    { label: 'ผู้ดูแลระบบ', value: 0, icon: 'assignment', bgColor: 'bg-red-200', textColor: 'text-red-600', cardBg: 'bg-[#FFE5E5]' }
  ];

  advisingKpiData: any[] = [];
  ploKpiData: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadStats();
    this.loadKpiData();
  }

  onFilterChange() {
    this.loadKpiData(); // กดเปลี่ยนปีการศึกษาหรือเทอมแล้วข้อมูลจะรีโหลดเรียลไทม์
  }

  loadStats() {
    this.http.get('http://localhost:8080/api/get_dashboard_stats.php?action=basic_stats').subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dashboardStats = this.dashboardStats.map(stat => {
            if (stat.label === 'จำนวนผู้ใช้งานทั้งหมด') return { ...stat, value: res.total };
            if (stat.label === 'จำนวนนักศึกษา') return { ...stat, value: res.student };
            if (stat.label === 'จำนวนอาจารย์') return { ...stat, value: res.teacher };
            if (stat.label === 'ผู้ดูแลระบบ') return { ...stat, value: res.admin };
            return stat;
          });
          this.cdr.detectChanges();
        }
      }
    });
  }

  loadKpiData() {
    const apiBase = 'http://localhost:8080/api/get_dashboard_stats.php';

    // 1. เรียกดึงข้อมูลร้อยละคำปรึกษา พร้อมระบุเฉดสีเขียวที่ต่างกันเพื่อสร้างการแข่งขันเชิงบริหาร
    this.http.get(`${apiBase}?action=advising_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}`).subscribe((res: any) => {
      this.advisingKpiData = res.map((item: any) => {
        let greenTone = 'bg-emerald-600'; // สีเขียวเฉดเข้ม สำหรับสาขาวิทยาการคอมพิวเตอร์
        if (item.major === 'เทคโนโลยีการอาหาร') {
          greenTone = 'bg-lime-500';    // สีเขียวเฉดสว่างตองอ่อน สำหรับสาขาเทคโนโลยีการอาหาร
        }
        return { ...item, colorClass: greenTone };
      });
      this.cdr.detectChanges();
    });

    // 2. เรียกดูผลสรุปคะแนนประเมิน PLO ตามเทอม/สิทธิ์ผู้ใช้
    this.http.get(`${apiBase}?action=plo_kpi&year=${this.selectedYear}&semester=${this.selectedSemester}&role=${this.userRole}&advisor_id=${this.currentAdvisorId}`).subscribe((res: any) => {
      this.ploKpiData = res;
      this.cdr.detectChanges();
    });
  }
}