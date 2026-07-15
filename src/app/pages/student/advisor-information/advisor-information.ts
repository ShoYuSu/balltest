import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { getAuthUser } from '../auth-user.util';

interface AdvisorInfo {
  full_name: string; email: string; phone: string;
  img_profile: string | null; dept_name: string;
  position: string; staff_code: string; office: string; line: string;
}

@Component({
  selector: 'app-advisor-information',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advisor-information.html',
  styleUrl: './advisor-information.css',
})
export class AdvisorInformation implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  advisors: AdvisorInfo[] = [];

  avatarUrl(img: string | null, name: string): string {
    if (img) return `${environment.apiUrl}/${img}`;
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=7B4A1E&color=fff&size=128';
  }

  ngOnInit() {
    const uid = getAuthUser().user_id;
    if (!uid) return;
    this.http.get<AdvisorInfo[]>(`${environment.apiUrl}/get_advisor_info.php?user_id=${uid}`)
      .subscribe({
        next: d => { this.advisors = d; this.cdr.detectChanges(); },
        error: () => {}
      });
  }
}
