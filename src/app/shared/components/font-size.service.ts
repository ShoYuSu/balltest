import { Injectable } from '@angular/core';

export type FontSize = 'font-small' | 'font-medium' | 'font-large';

@Injectable({ providedIn: 'root' })
export class FontSizeService {
  private readonly sizes: FontSize[] = ['font-small', 'font-medium', 'font-large'];
  current: FontSize = 'font-medium';

  /** เรียกครั้งเดียวตอนแอปเริ่มทำงาน (ใน app.ts) เพื่อโหลดค่าที่จำไว้ */
  init() {
    const saved = (localStorage.getItem('fontSize') as FontSize) || 'font-medium';
    this.setSize(saved);
  }

  setSize(size: FontSize) {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove(...this.sizes);
    document.documentElement.classList.add(size);
    localStorage.setItem('fontSize', size);
    this.current = size;
  }
}