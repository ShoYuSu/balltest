import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. ไปควานหา Token จาก Local Storage
  const token = localStorage.getItem('token');

  // 2. ถ้าเจอ Token ให้ทำการร่างจดหมาย (Request) ฉบับใหม่ แล้วแปะสแตมป์ (Token) ลงไป
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    // ส่งจดหมายฉบับใหม่ที่แปะสแตมป์แล้วไปให้ Backend
    return next(clonedReq);
  }

  // 3. ถ้าไม่มี Token (เช่น หน้า Login) ก็ส่งจดหมายไปแบบปกติ
  return next(req);
};
