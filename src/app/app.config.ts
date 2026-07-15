import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
// 🟢 1. นำเข้า withInterceptors เพิ่มเข้ามา
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
// 🟢 2. นำเข้าไฟล์ Interceptor ที่เรากำลังจะสร้าง (สมมติว่าตั้งชื่อไฟล์ auth.interceptor.ts)
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // 🟢 3. ยัด authInterceptor เข้าไปใน provideHttpClient
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
