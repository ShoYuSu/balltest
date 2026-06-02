import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface ActivityFile { file_id: number; file_url: string; file_type: string; }
interface ActivityItem {
  activity_id: number; title: string; description: string;
  activity_date: string; files: ActivityFile[];
}
interface FilePreview { file: File; previewUrl: string | null; name: string; }

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity.html',
  styleUrl: './activity.css',
})
export class Activity implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private base = environment.apiUrl;

  activities: ActivityItem[] = [];

  // Add modal
  showAddModal = false;
  saving = false;
  isAddClosing = false;
  form = { title: '', description: '' };
  selectedDate = '';
  filePreviews: FilePreview[] = [];

  // Calendar
  showCalendar = false;
  calYear = new Date().getFullYear();
  calMonth = new Date().getMonth();
  dayNames = ['อา','จ','อ','พ','พฤ','ศ','ส'];
  monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

  // Detail modal
  selected: ActivityItem | null = null;
  isDetailClosing = false;

  // Edit modal
  showEditModal = false;
  isEditClosing = false;
  editingId = 0;
  editForm = { title: '', description: '' };
  editDate = '';
  editCalYear = new Date().getFullYear();
  editCalMonth = new Date().getMonth();
  showEditCal = false;
  saving2 = false;
  editExistingFiles: ActivityFile[] = [];
  editRemovedIds: number[] = [];
  editNewFiles: FilePreview[] = [];

  // Delete confirm
  showDeleteConfirm = false;

  get calendarDays(): (number | null)[] {
    const first = new Date(this.calYear, this.calMonth, 1).getDay();
    const total = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  get displayDate(): string {
    if (!this.selectedDate) return '';
    const d = new Date(this.selectedDate);
    return `${d.getDate()} ${this.monthNames[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  isSelectedDay(day: number | null): boolean {
    if (!day || !this.selectedDate) return false;
    const d = new Date(this.selectedDate);
    return d.getFullYear() === this.calYear && d.getMonth() === this.calMonth && d.getDate() === day;
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const t = new Date();
    return t.getFullYear() === this.calYear && t.getMonth() === this.calMonth && t.getDate() === day;
  }

  prevCal() { this.calMonth--; if (this.calMonth < 0) { this.calMonth = 11; this.calYear--; } this.cdr.detectChanges(); }
  nextCal() { this.calMonth++; if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; } this.cdr.detectChanges(); }

  pickDay(day: number | null) {
    if (!day) return;
    this.selectedDate = `${this.calYear}-${String(this.calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    this.showCalendar = false;
    this.cdr.detectChanges();
  }

  ngOnInit() { this.loadActivities(); }

  loadActivities() {
    const uid = localStorage.getItem('user_id');
    if (!uid) return;
    this.http.get<ActivityItem[]>(`${this.base}/get_student_activities.php?user_id=${uid}`).subscribe({
      next: d => { this.activities = d; this.cdr.detectChanges(); },
      error: e => console.error(e),
    });
  }

  openAdd() {
    this.form = { title: '', description: '' };
    this.selectedDate = '';
    this.filePreviews = [];
    this.isAddClosing = false;
    this.showCalendar = false;
    this.calYear = new Date().getFullYear();
    this.calMonth = new Date().getMonth();
    this.showAddModal = true;
    this.cdr.detectChanges();
  }

  closeAdd() {
    this.isAddClosing = true; this.cdr.detectChanges();
    setTimeout(() => { this.showAddModal = false; this.isAddClosing = false; this.cdr.detectChanges(); }, 160);
  }

  onFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(f => {
      const isImg = f.type.startsWith('image/');
      const preview: FilePreview = { file: f, name: f.name, previewUrl: null };
      if (isImg) {
        const reader = new FileReader();
        reader.onload = ev => { preview.previewUrl = ev.target?.result as string; this.cdr.detectChanges(); };
        reader.readAsDataURL(f);
      }
      this.filePreviews.push(preview);
    });
    input.value = '';
    this.cdr.detectChanges();
  }

  removeFile(i: number) { this.filePreviews.splice(i, 1); this.cdr.detectChanges(); }

  save() {
    if (!this.form.title || !this.selectedDate || this.saving) return;
    const uid = localStorage.getItem('user_id');
    if (!uid) return;
    this.saving = true; this.cdr.detectChanges();

    const fd = new FormData();
    fd.append('user_id', uid);
    fd.append('title', this.form.title);
    fd.append('description', this.form.description);
    fd.append('activity_date', this.selectedDate);
    this.filePreviews.forEach(p => fd.append('files[]', p.file));

    this.http.post<any>(`${this.base}/add_activity.php`, fd).subscribe({
      next: res => {
        this.saving = false;
        if (res.success) { this.loadActivities(); this.closeAdd(); }
        this.cdr.detectChanges();
      },
      error: () => { this.saving = false; this.cdr.detectChanges(); },
    });
  }

  openDetail(a: ActivityItem) { this.isDetailClosing = false; this.selected = a; this.cdr.detectChanges(); }

  closeDetail() {
    this.isDetailClosing = true; this.cdr.detectChanges();
    setTimeout(() => { this.selected = null; this.isDetailClosing = false; this.cdr.detectChanges(); }, 160);
  }

  coverOf(a: ActivityItem): string {
    const img = a.files.find(f => f.file_type?.startsWith('image/'));
    return img ? `${this.base}/${img.file_url}` : '';
  }

  fileUrl(url: string): string { return `${this.base}/${url}`; }

  isImage(f: ActivityFile): boolean { return f.file_type?.startsWith('image/') ?? false; }

  // --- EDIT ---
  get editDisplayDate(): string {
    if (!this.editDate) return '';
    const d = new Date(this.editDate);
    return `${d.getDate()} ${this.monthNames[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  isEditSelected(day: number | null): boolean {
    if (!day || !this.editDate) return false;
    const d = new Date(this.editDate);
    return d.getFullYear() === this.editCalYear && d.getMonth() === this.editCalMonth && d.getDate() === day;
  }

  get editCalDays(): (number | null)[] {
    const first = new Date(this.editCalYear, this.editCalMonth, 1).getDay();
    const total = new Date(this.editCalYear, this.editCalMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  prevEditCal() { this.editCalMonth--; if (this.editCalMonth < 0) { this.editCalMonth = 11; this.editCalYear--; } this.cdr.detectChanges(); }
  nextEditCal() { this.editCalMonth++; if (this.editCalMonth > 11) { this.editCalMonth = 0; this.editCalYear++; } this.cdr.detectChanges(); }

  pickEditDay(day: number | null) {
    if (!day) return;
    this.editDate = `${this.editCalYear}-${String(this.editCalMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    this.showEditCal = false; this.cdr.detectChanges();
  }

  openEdit(a: ActivityItem) {
    this.editingId = a.activity_id;
    this.editForm = { title: a.title, description: a.description || '' };
    this.editDate = a.activity_date;
    this.editExistingFiles = [...a.files];
    this.editRemovedIds = [];
    this.editNewFiles = [];
    const d = new Date(a.activity_date);
    this.editCalYear = d.getFullYear(); this.editCalMonth = d.getMonth();
    this.showEditCal = false; this.isEditClosing = false; this.showEditModal = true;
    this.cdr.detectChanges();
  }

  removeExistingFile(fileId: number) {
    this.editRemovedIds.push(fileId);
    this.editExistingFiles = this.editExistingFiles.filter(f => f.file_id !== fileId);
    this.cdr.detectChanges();
  }

  onEditFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(f => {
      const preview: FilePreview = { file: f, name: f.name, previewUrl: null };
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => { preview.previewUrl = ev.target?.result as string; this.cdr.detectChanges(); };
        reader.readAsDataURL(f);
      }
      this.editNewFiles.push(preview);
    });
    input.value = '';
    this.cdr.detectChanges();
  }

  removeEditNewFile(i: number) { this.editNewFiles.splice(i, 1); this.cdr.detectChanges(); }

  closeEdit() {
    this.isEditClosing = true; this.cdr.detectChanges();
    setTimeout(() => { this.showEditModal = false; this.isEditClosing = false; this.cdr.detectChanges(); }, 160);
  }

  saveEdit() {
    if (!this.editForm.title || !this.editDate || this.saving2) return;
    this.saving2 = true; this.cdr.detectChanges();

    const fd = new FormData();
    fd.append('activity_id', String(this.editingId));
    fd.append('title', this.editForm.title);
    fd.append('description', this.editForm.description);
    fd.append('activity_date', this.editDate);
    fd.append('remove_ids', JSON.stringify(this.editRemovedIds));
    this.editNewFiles.forEach(p => fd.append('files[]', p.file));

    this.http.post<any>(`${this.base}/edit_activity.php`, fd).subscribe({
      next: res => {
        this.saving2 = false;
        if (res.success) { this.loadActivities(); this.closeEdit(); }
        this.cdr.detectChanges();
      },
      error: () => { this.saving2 = false; this.cdr.detectChanges(); }
    });
  }

  // --- DELETE ---
  deleteActivity() {
    this.http.post<any>(`${this.base}/delete_activity.php`, { activity_id: this.editingId })
      .subscribe({
        next: res => {
          if (res.success) { this.loadActivities(); this.showDeleteConfirm = false; this.closeEdit(); }
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  formatDate(d: string): string {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate()} ${this.monthNames[date.getMonth()]} ${date.getFullYear() + 543}`;
  }
}
