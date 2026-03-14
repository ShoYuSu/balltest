// 1. เพิ่ม ChangeDetectorRef เข้ามาใน import
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  // 2. Inject ChangeDetectorRef เข้ามาใช้งาน
  private cdr = inject(ChangeDetectorRef);

  userProfile: any = null;
  isDropdownOpen = false;

  async ngOnInit() {
    const user = await this.supabaseService.getCurrentUser();

    if (user) {
      const { data, error } = await this.supabaseService.getUserProfile(user.id);

      if (!error) {
        this.userProfile = data;
        // 3. ใส่บรรทัดนี้เพื่อสั่งให้อัปเดตหน้าจอทันที
        this.cdr.detectChanges();
      }
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async onLogout() {
    await this.supabaseService.signOut();
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }
}
