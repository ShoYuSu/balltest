import { Component, inject } from '@angular/core';
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
export class HeaderComponent {
  // Inject สิ่งที่จำเป็น
  public supabaseService = inject(SupabaseService);
  private router = inject(Router);

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async onLogout() {
    await this.supabaseService.signOut();
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }
}
